#!/usr/bin/env python3
"""Fetch ESPN fantasy data and calculate schedule-neutral league metrics."""
import datetime as dt
import json
import os
import pathlib
import urllib.request

LEAGUE_ID = "204112345"
SEASON = "2026"
BASE = f"https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/{SEASON}/segments/0/leagues/{LEAGUE_ID}"
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "league.json"

def fetch(view):
    headers = {"User-Agent": "SundayFundayLeagueDashboard/1.0", "Accept": "application/json"}
    # If a private league requires authentication, configure these as GitHub Actions secrets.
    swid = os.getenv("ESPN_SWID")
    s2 = os.getenv("ESPN_S2")
    if swid and s2:
        headers["Cookie"] = f"SWID={swid}; espn_s2={s2}"
    req = urllib.request.Request(f"{BASE}?view={view}", headers=headers)
    with urllib.request.urlopen(req, timeout=35) as resp:
        return json.load(resp)

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
        owners = t.get("owners", [])
        teams[tid] = {"id": tid, "name": name, "shortName": name[:15], "owners": owners,
                      "wins": 0, "losses": 0, "ties": 0, "pointsFor": 0.0, "pointsAgainst": 0.0,
                      "allPlayWins": 0, "allPlayLosses": 0, "allPlayTies": 0,
                      "medianWins": 0, "medianLosses": 0, "medianTies": 0}
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
    for row in teams.values():
        row["expectedWins"] = round((row["allPlayWins"] + 0.5 * row["allPlayTies"]) / 9, 3)
        row["luck"] = round(row["wins"] + 0.5 * row["ties"] - row["expectedWins"], 3)
        for key in ("pointsFor", "pointsAgainst"): row[key] = round(row[key], 2)
    if completed_weeks == 0:
        raise RuntimeError("No complete scored weeks; refusing to publish")
    payload = {"leagueId": LEAGUE_ID, "season": int(SEASON),
               "updatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
               "currentWeek": league.get("scoringPeriodId"), "completedMatchups": completed,
               "completedWeeks": completed_weeks, "teams": list(teams.values()),
               "scheduleSwap": swap}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    temp = OUT.with_suffix(".tmp")
    temp.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    temp.replace(OUT)
    print(f"Updated {len(teams)} teams, {completed_weeks} complete weeks, {completed} matchups")

if __name__ == "__main__":
    main()
