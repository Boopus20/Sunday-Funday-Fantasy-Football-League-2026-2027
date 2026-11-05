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
    """Prefer weekly actual points over current or season totals."""
    pool=entry.get("playerPoolEntry") or {}
    player=pool.get("player") or {}
    for stat in player.get("stats") or []:
        if str(stat.get("scoringPeriodId"))==str(week) and str(stat.get("statSourceId"))=="0":
            for key in ("appliedTotal","appliedStatTotal"):
                if stat.get(key) is not None: return number(stat[key])
    for obj in (entry,pool):
        for key in ("appliedStatTotal","appliedTotal"):
            if obj.get(key) is not None: return number(obj[key])
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
    player_names={}
    roster_status={}
    full_rosters=defaultdict(dict)
    result["coverage"]["optimizationDiagnostics"]={}
    player_starts=defaultdict(lambda:{'starts':0,'points':0.0})
    result["coverage"]["weeksWithValidLineups"]=[]
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
                        pid=entry.get("playerId",player.get("id"))
                        if pid is not None and player.get("fullName"): player_names[str(pid)]=player["fullName"]
                        parsed.append({"playerId":pid,
                            "name":player.get("fullName") or player.get("name") or "Unknown",
                            "slotId":int(slot),"slot":SLOTS.get(int(slot),str(slot)),
                            "points":pts,"eligibleSlots":player.get("eligibleSlots",[])})
                    if parsed: weekly[week][int(tid)]=parsed
            # mRoster may contain real lineup slots when mBoxscore only returns
            # nine score-bearing entries all incorrectly tagged QB.
            if any(rows and len({e["slotId"] for e in rows})<5 for rows in weekly[week].values()):
                try:
                    roster_data=fetch("mRoster",{"scoringPeriodId":str(week)})
                    for team in roster_data.get("teams",[]):
                        tid=int(team.get("id",-1))
                        if tid not in weekly[week]: continue
                        historical=(team.get("roster") or {}).get("entries") or []
                        if historical: full_rosters[week][tid]=historical
                        roster_status[str(week)]=roster_status.get(str(week),0)+len(historical)
                        slots={}
                        for entry in historical:
                            pid=entry.get("playerId") or (entry.get("playerPoolEntry") or {}).get("player",{}).get("id")
                            if pid is not None and entry.get("lineupSlotId") is not None:
                                slots[int(pid)]=int(entry["lineupSlotId"])
                        # Only use mapping if ESPN supplies diverse real slots and
                        # every score-bearing starter can be matched by player ID.
                        mapped=weekly[week][tid]
                        if len(set(slots.values()))>=5 and all(e["playerId"] is not None and int(e["playerId"]) in slots for e in mapped):
                            for e in mapped:
                                e["slotId"]=slots[int(e["playerId"])]
                                e["slot"]=SLOTS.get(e["slotId"],str(e["slotId"]))
                except Exception as exc:
                    result["coverage"]["errors"].append(f"Historical roster lookup week {week}: {str(exc)[:100]}")
            count=len(weekly[week])
            if count==len(team_ids): result["coverage"]["weeksWithCompleteRosters"].append(week)
            if count==len(team_ids) and all(len({e["slot"] for e in rows})>=5 for rows in weekly[week].values()): result["coverage"]["weeksWithValidLineups"].append(week)
            elif count: result["coverage"]["weeksWithPartialRosters"].append(week)
        except Exception as exc:
            result["coverage"]["errors"].append(f"Week {week}: {type(exc).__name__}: {str(exc)[:130]}")
    # A position total is counted only when the historical starting slot mapping is credible.
    for tid in sorted(team_ids):
        totals=defaultdict(float); counts=defaultdict(int); weekly_rows=[]
        for week, rosters in sorted(weekly.items()):
            entries=rosters.get(tid,[])
            if not entries: continue
            starters=[e for e in entries if e["slot"] in STARTERS]
            # ESPN mBoxscore can mark every player slot 0 (QB) even for a mixed roster.
            # Reject that invalid slot mapping instead of publishing team totals as QB points.
            if len(starters)<8 or len({e["slot"] for e in starters})<5 or any(e["points"] is None for e in starters): continue
            used=defaultdict(int)
            actual=0
            for e in starters:
                used[e["slot"]]+=1
                label=e["slot"]+str(used[e["slot"]]) if e["slot"] in ("RB","WR") else e["slot"]
                totals[label]+=e["points"]; counts[label]+=1; actual+=e["points"]
                if e["playerId"] is not None:
                    key=(tid,int(e["playerId"]))
                    player_starts[key]["starts"]+=1
                    player_starts[key]["points"]+=e["points"]
            weekly_rows.append({"week":week,"actualStarterPoints":round(actual,2),
                "scoredStarters":len(starters)})
            result.setdefault("weeklyPositions",[]).append({"teamId":tid,"week":week,
                "slots":dict((k,round(v,2)) for k,v in ((label,sum(e["points"] for e in starters if e["slot"]==label)) for label in ("QB","TE","FLEX","D/ST","K"))),
                "RB":round(sum(e["points"] for e in starters if e["slot"]=="RB"),2),
                "WR":round(sum(e["points"] for e in starters if e["slot"]=="WR"),2),
                "players":[{"playerId":e["playerId"],"name":e["name"],"slot":e["slot"],"points":round(e["points"],2)} for e in starters]})
        result["positionPoints"].append({"teamId":tid,"slots":{k:round(v,2) for k,v in totals.items()},
            "gamesBySlot":dict(counts),"weeks":len(weekly_rows)})
        result["lineupIQ"].append({"teamId":tid,"weeksWithScoredStarters":len(weekly_rows),
            "weekly":weekly_rows,"optimalPoints":None,"benchPointsLost":None,
            "efficiency":None,"note":"Optimal lineup pending verified weekly bench scoring and roster eligibility."})

    # Optimize each verified historical lineup with position eligibility.
    # DP masks represent the nine distinct starting slots.
    slot_ids=(0,2,2,4,4,6,23,16,17)
    lineup_by_team={row["teamId"]:row for row in result["lineupIQ"]}
    for week, teams in sorted(full_rosters.items()):
        for tid, raw in teams.items():
            actual_rows=weekly[week].get(tid,[])
            if len(actual_rows)!=9 or len({e["slot"] for e in actual_rows})<5: continue
            if any(e["points"] is None for e in actual_rows): continue
            actual=sum(e["points"] for e in actual_rows)
            candidates=[]
            for entry in raw:
                pool=entry.get("playerPoolEntry") or {}
                player=pool.get("player") or {}
                pid=entry.get("playerId") or player.get("id")
                score=player_score(entry,week)
                eligible=player.get("eligibleSlots") or []
                if pid is not None and score is not None and eligible:
                    candidates.append((int(pid),score,set(eligible)))
            diag=result["coverage"]["optimizationDiagnostics"].setdefault(str(week),{"teams":0,"candidates":0,"missingStarters":0,"scoreMismatch":0,"eligibleMissing":0,"optimized":0})
            diag["teams"]+=1
            diag["candidates"]+=len(candidates)
            if len(candidates)<10: continue
            starter_ids={int(e["playerId"]) for e in actual_rows if e["playerId"] is not None}
            candidate_by_id={pid:pts for pid,pts,eligible in candidates}
            if len(starter_ids)!=9 or not starter_ids.issubset(candidate_by_id):
                diag["missingStarters"]+=1
                continue
            mismatches=[e for e in actual_rows if abs(candidate_by_id[int(e["playerId"])]-e["points"])>0.1]
            if mismatches:
                diag["scoreMismatch"]+=1
                if "scoreExample" not in diag:
                    e=mismatches[0]
                    matching=next((r for r in raw if str(r.get("playerId") or ((r.get("playerPoolEntry") or {}).get("player") or {}).get("id"))==str(e["playerId"])),{})
                    pool=matching.get("playerPoolEntry") or {}
                    stats=(pool.get("player") or {}).get("stats") or []
                    diag["scoreExample"]={"starterScore":e["points"],"rosterScore":candidate_by_id[int(e["playerId"])],"entryKeys":sorted(matching.keys()),"poolKeys":sorted(pool.keys()),"stats":[{"period":z.get("scoringPeriodId"),"source":z.get("statSourceId"),"applied":z.get("appliedTotal")} for z in stats[:8]]}
                candidates=[(pid,next((e["points"] for e in actual_rows if int(e["playerId"])==pid),pts),eligible) for pid,pts,eligible in candidates]
            if not any(pid not in starter_ids for pid,pts,eligible in candidates): continue
            dp={0:0.0}
            for pid,pts,eligible in candidates:
                next_dp=dict(dp)
                for mask,value in dp.items():
                    for j,slot in enumerate(slot_ids):
                        if not mask & (1<<j) and slot in eligible:
                            key=mask|(1<<j)
                            next_dp[key]=max(next_dp.get(key,float("-inf")),value+pts)
                dp=next_dp
            optimal=dp.get((1<<len(slot_ids))-1)
            if optimal is None or optimal+0.05<actual:
                diag["eligibleMissing"]+=1
                continue
            diag["optimized"]+=1
            row=lineup_by_team[tid]
            row.setdefault("optimalWeekly",[]).append({"week":week,"actual":round(actual,2),
                "optimal":round(optimal,2),"leftOnBench":round(max(0,optimal-actual),2)})
    for row in result["lineupIQ"]:
        verified=row.get("optimalWeekly",[])
        row["weeksWithOptimizedLineups"]=len(verified)
        if verified:
            actual=sum(w["actual"] for w in verified)
            optimal=sum(w["optimal"] for w in verified)
            row["optimalPoints"]=round(optimal,2)
            row["benchPointsLost"]=round(max(0,optimal-actual),2)
            row["efficiency"]=round(100*actual/optimal,1) if optimal>0 else None
            row["note"]="Optimal totals cover verified weeks only; efficiency is a percentage."
    result["playerProduction"]=[{"teamId":tid,"playerId":pid,
        "playerName":player_names.get(str(pid)),"starts":v["starts"],
        "starterPoints":round(v["points"],2)} for (tid,pid),v in player_starts.items()]
    result["coverage"]["rosterLookupEntryCounts"]=roster_status
    result["coverage"]["rosterShape"]=[]
    for week, rosters in sorted(weekly.items()):
        if not rosters: continue
        tid, entries=next(iter(rosters.items()))
        result["coverage"]["rosterShape"].append({"week":week,"teamId":tid,
            "count":len(entries),"slotIds":[e["slotId"] for e in entries],
            "points":[e["points"] for e in entries[:12]],
            "playerIds":[e["playerId"] for e in entries[:5]]})
        if len(result["coverage"]["rosterShape"])>=2: break
    try:
        draft=fetch("mDraftDetail",{})
        picks=draft.get("draftDetail",{}).get("picks",[])
        if isinstance(picks,list):
            result["draftPicks"]=[{"teamId":p.get("teamId"),"playerId":p.get("playerId"),
                "round":p.get("roundId"),"pick":p.get("roundPickNumber"),
                "overallPick":p.get("overallPickNumber"),"playerName":player_names.get(str(p.get("playerId")))} for p in picks]
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
                        "fromTeamId":i.get("fromTeamId"),"toTeamId":i.get("toTeamId"),"playerName":player_names.get(str(i.get("playerId")))}
                        for i in t.get("items",[])]})
            result["coverage"]["transactionsAvailable"]=bool(records)
    except Exception as exc: result["coverage"]["errors"].append("Transactions: "+str(exc)[:130])
    result["coverage"]["playerNamesResolved"]=len(player_names)
    return result
