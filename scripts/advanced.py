"""Optional advanced ESPN ingestion: historical starters, draft picks and trades.

Never substitutes current rosters for historical rosters. Coverage flags explain
which ESPN data were actually accessible.
"""
import json
from collections import defaultdict

SLOTS={0:"QB",2:"RB",4:"WR",6:"TE",16:"D/ST",17:"K",20:"BENCH",21:"IR",23:"FLEX"}
STARTERS={"QB","RB","WR","TE","D/ST","K","FLEX"}
def number(x):
    try: return float(x)
    except (ValueError,TypeError): return None

def player_score(entry,week):
    pool=entry.get('playerPoolEntry') or {}
    player=pool.get('player') or {}
    for obj in (entry,pool):
        for key in ('appliedStatTotal','appliedTotal','totalPoints'):
            if obj.get(key) is not None: return number(obj[key])
    for stat in player.get('stats') or []:
        if str(stat.get('scoringPeriodId'))==str(week) and str(stat.get('statSourceId')) in ('0','None'):
            for key in ('appliedTotal','appliedStatTotal'):
                if stat.get(key) is not None: return number(stat[key])
    return None

def find_entries(side):
    for key in ("rosterForMatchupPeriod","rosterForCurrentScoringPeriod","roster"):
        roster=side.get(key)
        if isinstance(roster,dict) and isinstance(roster.get("entries"),list):
            return roster["entries"]
    return None

def extract_advanced(fetch, weeks, team_ids):
    result={"coverage":{"weeksRequested":list(weeks),"weeksWithCompleteRosters":[],
            "weeksWithPartialRosters":[],"errors":[],"draftAvailable":False,
            "transactionsAvailable":False,"sampleScoreFields":{},"playersWithScores":0,"playersMissingScores":0},
            "lineupIQ":[],"positionPoints":[],"draftPicks":[],"transactions":[]}
    weekly=defaultdict(dict)
    for week in weeks:
        try:
            data=fetch("mBoxscore",{"scoringPeriodId":str(week)})
            games=data.get("schedule",[])
            for game in games:
                if int(game.get("matchupPeriodId",-1))!=week: continue
                for side in ("home","away"):
                    box=game.get(side) or {}
                    tid=box.get("teamId")
                    if tid is None or int(tid) not in team_ids: continue
                    entries=find_entries(box)
                    if not entries: continue
                    parsed=[]
                    for entry in entries:
                        slot=entry.get("lineupSlotId")
                        if slot is None: continue
                        player=entry.get("playerPoolEntry",{}).get("player",{})
                        pts=player_score(entry,week)
                        if pts is None:
                            result['coverage']['playersMissingScores']+=1
                            if not result['coverage']['sampleScoreFields']:
                                pool=entry.get('playerPoolEntry') or {}
                                result['coverage']['sampleScoreFields']={'entryKeys':sorted(entry.keys()),'poolKeys':sorted(pool.keys()),'playerKeys':sorted(player.keys()),'statKeys':sorted((player.get('stats') or [{}])[0].keys()),'statPeriods':[{'period':v.get('scoringPeriodId'),'source':v.get('statSourceId'),'applied':v.get('appliedTotal')} for v in (player.get('stats') or [])[:4]]}
                        else: result['coverage']['playersWithScores']+=1
                        parsed.append({"playerId":entry.get("playerId",player.get("id")),
                            "name":player.get("fullName") or player.get("name") or "Unknown",
                            "slotId":int(slot),"slot":SLOTS.get(int(slot),str(slot)),
                            "points":pts,"eligibleSlots":player.get("eligibleSlots",[])})
                    if parsed: weekly[week][int(tid)]=parsed
            count=len(weekly[week])
            if count==len(team_ids): result["coverage"]["weeksWithCompleteRosters"].append(week)
            elif count: result["coverage"]["weeksWithPartialRosters"].append(week)
        except Exception as exc:
            result["coverage"]["errors"].append(f"Week {week}: {type(exc).__name__}: {str(exc)[:130]}")
    # A position total is only counted when the historical starting player has an actual score.
    for tid in sorted(team_ids):
        totals=defaultdict(float); counts=defaultdict(int); weekly_rows=[]
        for week, rosters in sorted(weekly.items()):
            entries=rosters.get(tid,[])
            if not entries: continue
            starters=[e for e in entries if e["slot"] in STARTERS]
            if not starters or any(e["points"] is None for e in starters): continue
            used=defaultdict(int)
            actual=0
            for e in starters:
                used[e["slot"]]+=1
                label=e["slot"]+str(used[e["slot"]]) if e["slot"] in ("RB","WR") else e["slot"]
                totals[label]+=e["points"]; counts[label]+=1; actual+=e["points"]
            weekly_rows.append({"week":week,"actualStarterPoints":round(actual,2),
                "scoredStarters":len(starters)})
        result["positionPoints"].append({"teamId":tid,"slots":{k:round(v,2) for k,v in totals.items()},
            "gamesBySlot":dict(counts),"weeks":len(weekly_rows)})
        result["lineupIQ"].append({"teamId":tid,"weeksWithScoredStarters":len(weekly_rows),
            "weekly":weekly_rows,"optimalPoints":None,"benchPointsLost":None,
            "efficiency":None,"note":"Optimal lineup pending verified weekly bench scoring and roster eligibility."})
    try:
        draft=fetch("mDraftDetail",{})
        picks=draft.get("draftDetail",{}).get("picks",[])
        if isinstance(picks,list):
            result["draftPicks"]=[{"teamId":p.get("teamId"),"playerId":p.get("playerId"),
                "round":p.get("roundId"),"pick":p.get("roundPickNumber"),
                "overallPick":p.get("overallPickNumber")} for p in picks]
            result["coverage"]["draftAvailable"]=bool(picks)
    except Exception as exc: result["coverage"]["errors"].append("Draft: "+str(exc)[:130])
    try:
        tx=fetch("mTransactions2",{})
        records=tx.get("transactions",[])
        if isinstance(records,list):
            for t in records:
                if t.get("type") not in ("TRADE","WAIVER","FREEAGENT"): continue
                result["transactions"].append({"id":t.get("id"),"type":t.get("type"),
                    "status":t.get("status"),"proposingTeamId":t.get("proposingTeamId"),
                    "items":[{"playerId":i.get("playerId"),"type":i.get("type"),
                        "fromTeamId":i.get("fromTeamId"),"toTeamId":i.get("toTeamId")}
                        for i in t.get("items",[])]})
            result["coverage"]["transactionsAvailable"]=bool(records)
    except Exception as exc: result["coverage"]["errors"].append("Transactions: "+str(exc)[:130])
    return result
