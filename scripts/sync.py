#!/usr/bin/env python3
"""Fetch ESPN fantasy data and calculate schedule-neutral league metrics."""
import datetime as dt
import json
import os
import pathlib
import urllib.request
import urllib.parse
from advanced import extract_advanced

LEAGUE_ID = "204112345"
SEASON = "2026"
BASE = f"https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/{SEASON}/segments/0/leagues/{LEAGUE_ID}"
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "league.json"

def fetch(view, params=None, fantasy_filter=None):
    headers = {"User-Agent": "SundayFundayLeagueDashboard/1.0", "Accept": "application/json"}
    # If a private league requires authentication, configure these as GitHub Actions secrets.
    swid = os.getenv("ESPN_SWID")
    s2 = os.getenv("ESPN_S2")
    if swid and s2:
        headers["Cookie"] = f"SWID={swid}; espn_s2={s2}"
    if fantasy_filter is not None:
        headers["x-fantasy-filter"] = json.dumps(fantasy_filter, separators=(",", ":"))
    query = urllib.parse.urlencode({"view":view, **(params or {})})
    req = urllib.request.Request(f"{BASE}?{query}", headers=headers)
    with urllib.request.urlopen(req, timeout=35) as resp:
        return json.load(resp)


def extract_live(matchups, week, teams):
    """Current ESPN scoreboard only; never count these scores as finalized standings."""
    result=[]
    for game in matchups.get("schedule", []):
        if int(game.get("matchupPeriodId", -1)) != int(week):
            continue
        home, away = game.get("home") or {}, game.get("away") or {}
        if home.get("teamId") is None or away.get("teamId") is None:
            continue
        hid,aid=int(home["teamId"]),int(away["teamId"])
        if hid not in teams or aid not in teams:
            continue
        def num(v):
            try: return round(float(v),2) if v is not None else None
            except (ValueError,TypeError): return None
        final=game.get("winner") in ("HOME","AWAY","TIE")
        result.append({"week":int(week),"homeId":hid,"awayId":aid,
            "homeScore":num(home.get("totalPoints")),"awayScore":num(away.get("totalPoints")),
            "homeProjected":num(home.get("totalProjectedPointsLive")),
            "awayProjected":num(away.get("totalProjectedPointsLive")),
            "final":final,"status":"final" if final else "in_progress_or_scheduled"})
    return result

def main():
    league = fetch("mTeam")
    matchups = fetch("mMatchup")
    team_rows = league.get("teams", [])
    if len(team_rows) != 10:
        raise RuntimeError(f"Expected 10 teams, got {len(team_rows)}; refusing to overwrite valid data")
    teams = {}
    for t in team_rows:
        tid = int(t["id"])
        name = t.get("name") or f"Team {tid}"
        teams[tid] = {"id": tid, "name": name, "shortName": name[:15],
                      "wins": 0, "losses": 0, "ties": 0, "pointsFor": 0.0, "pointsAgainst": 0.0,
                      "allPlayWins": 0, "allPlayLosses": 0, "allPlayTies": 0,
                      "medianWins": 0, "medianLosses": 0, "medianTies": 0}
    fixtures=[]
    for game in matchups.get("schedule",[]):
        home,away=game.get("home") or {},game.get("away") or {}
        hid,aid=home.get("teamId"),away.get("teamId")
        if hid is None or aid is None: continue
        if int(hid) not in teams or int(aid) not in teams: continue
        fixtures.append({"week":int(game.get("matchupPeriodId",0)),
            "homeId":int(hid),"awayId":int(aid),
            "completed":game.get("winner") in ("HOME","AWAY","TIE")})
    weekly = {}
    schedule = {}
    completed = 0
    for m in matchups.get("schedule", []):
        if m.get("winner") not in ("HOME", "AWAY", "TIE"):
            continue
        a, h = m.get("away") or {}, m.get("home") or {}
        if "teamId" not in a or "teamId" not in h or a.get("totalPoints") is None or h.get("totalPoints") is None:
            continue
        week = int(m["matchupPeriodId"])
        aid, hid = int(a["teamId"]), int(h["teamId"])
        if aid not in teams or hid not in teams:
            continue
        ap, hp = float(a["totalPoints"]), float(h["totalPoints"])
        weekly.setdefault(week, {})[aid] = ap
        weekly[week][hid] = hp
        schedule.setdefault(week, {})[aid] = hid
        schedule[week][hid] = aid
        for tid, pts, against in ((aid, ap, hp), (hid, hp, ap)):
            teams[tid]["pointsFor"] += pts
            teams[tid]["pointsAgainst"] += against
            teams[tid]["wins" if pts > against else "losses" if pts < against else "ties"] += 1
        completed += 1
    for week, scores in weekly.items():
        if len(scores) != len(teams):
            # Incomplete weekly data: do not calculate all-play/median from partial slate.
            continue
        vals = sorted(scores.values())
        median = (vals[4] + vals[5]) / 2
        for tid, score in scores.items():
            row = teams[tid]
            for other, other_score in scores.items():
                if other == tid: continue
                row["allPlayWins" if score > other_score else "allPlayLosses" if score < other_score else "allPlayTies"] += 1
            row["medianWins" if score > median else "medianLosses" if score < median else "medianTies"] += 1
    swap = {}
    for tid in teams:
        swap[str(tid)] = {}
        for sid in teams:
            w = l = tie = 0
            for week, scores in weekly.items():
                opponent = schedule.get(week, {}).get(sid)
                if opponent is None or tid not in scores or opponent not in scores: continue
                # For the team's own schedule, compare with its real opponent.
                # For swapped schedules, the source schedule's opponent may be the target team;
                # using that team's score is intentional for this hypothetical.
                score, opp_score = scores[tid], scores[opponent]
                if score > opp_score: w += 1
                elif score < opp_score: l += 1
                else: tie += 1
            swap[str(tid)][str(sid)] = {"wins": w, "losses": l, "ties": tie}
    completed_weeks = sum(1 for scores in weekly.values() if len(scores) == len(teams))
    for tid, row in teams.items():
        scores = [weekly[w][tid] for w in sorted(weekly) if tid in weekly[w]]
        row["weeklyScores"] = [{"week": w, "points": round(weekly[w][tid], 2),
            "opponentId": schedule.get(w, {}).get(tid),
            "opponentPoints": round(weekly[w][schedule[w][tid]], 2) if tid in schedule.get(w, {}) else None}
            for w in sorted(weekly) if tid in weekly[w]]
        row["averagePoints"] = round(sum(scores) / len(scores), 2) if scores else 0
        row["bestWeek"] = round(max(scores), 2) if scores else 0
        row["worstWeek"] = round(min(scores), 2) if scores else 0
        exact_mean = sum(scores) / len(scores) if scores else 0
        row["pointsPerWeekStdDev"] = round((sum((v-exact_mean)**2 for v in scores)/len(scores))**0.5, 2) if scores else 0
        row["opponentAverage"] = round(row["pointsAgainst"]/len(scores), 2) if scores else 0
        row["topHalfWeeks"] = row["medianWins"]
        row["winsByOneScore"] = sum(1 for x in row["weeklyScores"] if x["opponentPoints"] is not None and 0 < x["points"]-x["opponentPoints"] <= 10)
        row["lossesByOneScore"] = sum(1 for x in row["weeklyScores"] if x["opponentPoints"] is not None and 0 < x["opponentPoints"]-x["points"] <= 10)

    for row in teams.values():
        row["expectedWins"] = round((row["allPlayWins"] + 0.5 * row["allPlayTies"]) / 9, 3)
        row["luck"] = round(row["wins"] + 0.5 * row["ties"] - row["expectedWins"], 3)
        for key in ("pointsFor", "pointsAgainst"): row[key] = round(row[key], 2)
    if completed_weeks == 0:
        raise RuntimeError("No complete scored weeks; refusing to publish")
    live_week = int(league.get("scoringPeriodId") or 1)
    # The schedule view can return placeholder zeroes for unfinished games.
    # Query the scoring-period scoreboard instead and never display placeholders.
    live_games = []
    live_source = "unavailable"
    live_errors = []
    for view in ("mMatchupScore", "mBoxscore"):
        try:
            candidate = fetch(view, {"scoringPeriodId": str(live_week)})
            parsed = extract_live(candidate, live_week, teams)
            if len(parsed) == 5 and any(
                (g["homeScore"] or 0) > 0 or (g["awayScore"] or 0) > 0
                for g in parsed
            ):
                live_games = parsed
                live_source = view
                break
        except Exception as exc:
            live_errors.append(f"{view}: {str(exc)[:120]}")
    if not live_games:
        live_games = extract_live(matchups, live_week, teams)
        for game in live_games:
            if not game["final"]:
                game["homeScore"] = None
                game["awayScore"] = None
                game["homeProjected"] = None
                game["awayProjected"] = None
                game["status"] = "awaiting_verified_live_scores"

    payload = {"live": {"week":live_week, "games":live_games, "source":live_source, "errors":live_errors, "updatedAt":dt.datetime.now(dt.timezone.utc).isoformat()}, "leagueId": LEAGUE_ID, "season": int(SEASON),
               "updatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
               "currentWeek": league.get("scoringPeriodId"), "completedMatchups": completed,
               "completedWeeks": completed_weeks, "teams": list(teams.values()),
               "scheduleSwap": swap, "fixtures":fixtures}
    # Advanced features are best-effort and never block basic league standings.
    try:
        payload["advanced"] = extract_advanced(fetch, sorted(weekly), set(teams))
    except Exception as exc:
        payload["advanced"] = {"coverage":{"errors":[f"Advanced ingestion: {exc}"]}}
    # Current roster ownership is a different concept from historical starter production.
    # Always query the latest scoring period so trades are reflected on the next sync.
    try:
        current_roster_data = fetch("mRoster", {"scoringPeriodId": str(live_week)})
        current_rosters = []
        for team in current_roster_data.get("teams", []):
            tid = int(team.get("id", -1))
            if tid not in teams:
                continue
            for entry in (team.get("roster") or {}).get("entries") or []:
                pool = entry.get("playerPoolEntry") or {}
                player = pool.get("player") or {}
                pid = entry.get("playerId") or player.get("id")
                if pid is None:
                    continue
                current_rosters.append({"teamId": tid, "playerId": int(pid),
                    "playerName": player.get("fullName") or player.get("name"),
                    "lineupSlotId": entry.get("lineupSlotId"),
                    "acquisitionType": entry.get("acquisitionType"),
                    "acquisitionDate": entry.get("acquisitionDate")})
        # Resolve transaction player names from the current roster and historical
        # production without confusing historical points with current ownership.
        names = {str(p["playerId"]):p["playerName"] for p in current_rosters if p.get("playerName")}
        for p in payload.get("advanced",{}).get("playerProduction",[]):
            if p.get("playerId") is not None and p.get("playerName"):
                names.setdefault(str(p["playerId"]),p["playerName"])
        for tx in payload.get("advanced",{}).get("transactions",[]):
            for item in tx.get("items",[]):
                if not item.get("playerName"):
                    item["playerName"] = names.get(str(item.get("playerId")))
        if current_rosters:
            payload["currentRosters"] = current_rosters
            payload["currentRosterAsOfWeek"] = live_week
        else:
            payload["currentRosterError"] = "ESPN returned no current roster entries"
    except Exception as exc:
        payload["currentRosterError"] = f"{type(exc).__name__}: {str(exc)[:160]}"

    OUT.parent.mkdir(parents=True, exist_ok=True)
    temp = OUT.with_suffix(".tmp")
    temp.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    temp.replace(OUT)
    print(f"Updated {len(teams)} teams, {completed_weeks} complete weeks, {completed} matchups")

if __name__ == "__main__":
    main()
