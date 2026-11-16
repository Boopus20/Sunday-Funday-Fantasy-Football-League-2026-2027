/* SFSN Week 10 War Room. Scenario math uses verified completed standings, never fabricated live scores. */
(()=>{'use strict';
const names={1:'MIKE',2:'BLEIF',3:'RAMMY',4:'GINNY',5:'COOP',6:'LUKE',7:'TRAVVY',8:'MADAR',9:'COLE',10:'DURK'};
const lore={
1:['THE COMMISSIONER IN CRISIS','A loss leaves Mike at 3–7, with the playoff ladder looking like an emergency exit he forgot to install.'],
2:['THE BLENDER FIGHTS BACK','Bleif can drag Cole down from the top pack and turn the 4–5 traffic jam into a real playoff push.'],
3:['THE MAMMOTH VS THANOS','Rammy has the chance to send the league scoring leader back to the mortal realm.'],
4:['THE GINSTER SURVIVAL HEARING','A 2–7 manager cannot afford another week of watching the baby costume get measured.'],
5:['THE TOUR PRO TIEBREAKER','Coop can put Travvy at 4–6 and protect his place above the chasing pack.'],
6:['THE GHOST AT THE GATE','Luke can move to 6–4; a loss to the last-place contender would be a deeply embarrassing headline.'],
7:['THE KEYBANK MARGIN CALL','Travvy can pull Coop back into the 5–5 crowd. A loss means another week underwater.'],
8:['THE SCHEDULE MERCHANT AUDIT','Madar can reach 7–3, or give Mike an upset that will require an independent investigation.'],
9:['THE GIBBS MERCHANT ON TRIAL','Cole can reach 7–3, but Bleif is perfectly positioned to make the top of the table considerably uglier.'],
10:['THANOS FACES THE MAMMOTH','Durk leads in points scored. Rammy has the opportunity to prove the standings are not inevitable.']
};
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n).toFixed(1);
function mount(d){
 const fixtures=(d.live?.games||[]).filter(x=>x.week===d.currentWeek&&x.homeId&&x.awayId);
 if(!fixtures.length)return;
 const teams=d.teams||[],by=Object.fromEntries(teams.map(x=>[x.id,x])),week=d.currentWeek;
 const resolved=fixtures.every(g=>g.final===true&&Number.isFinite(g.homeScore)&&Number.isFinite(g.awayScore));
 const hasScores=fixtures.some(g=>Number.isFinite(g.homeScore)&&Number.isFinite(g.awayScore));
 const pick={};
 for(const g of fixtures)pick[g.homeId+'-'+g.awayId]=null;
 const root=document.createElement('section');root.id='sfsn-warroom';
 const main=document.querySelector('main');if(!main)return;
 const paper=main.querySelector('#sfsn-paper');if(paper)paper.after(root);else main.prepend(root);
 const order=arr=>[...arr].sort((a,b)=>b.wins-a.wins||b.pointsFor-a.pointsFor||a.id-b.id);
 function simulate(){
  const rows=teams.map(t=>({...t}));const m=Object.fromEntries(rows.map(t=>[t.id,t]));
  fixtures.forEach(g=>{const choice=pick[g.homeId+'-'+g.awayId];if(choice===null)return;
   if(choice===g.homeId){m[g.homeId].wins++;m[g.awayId].losses++;}
   else if(choice===g.awayId){m[g.awayId].wins++;m[g.homeId].losses++;}
  });return order(rows);
 }
 const all=Array.from({length:2**fixtures.length},(_,mask)=>{
  const rows=teams.map(t=>({...t}));const m=Object.fromEntries(rows.map(t=>[t.id,t]));
  fixtures.forEach((g,i)=>{const win=mask&(1<<i)?g.homeId:g.awayId;const lose=win===g.homeId?g.awayId:g.homeId;m[win].wins++;m[lose].losses++;});
  return order(rows);
 });
 const ranges=Object.fromEntries(teams.map(t=>[t.id,{best:11,worst:0,topSix:0,first:0}]));
 for(const table of all)table.forEach((t,i)=>{const r=ranges[t.id];r.best=Math.min(r.best,i+1);r.worst=Math.max(r.worst,i+1);if(i<6)r.topSix++;if(i===0)r.first++;});
 function render(){
 const current=simulate(),decided=Object.values(pick).filter(v=>v!==null).length;
 const table='<div class="war-table-scroll"><table><thead><tr><th>#</th><th>MANAGER</th><th>SCENARIO RECORD</th><th>POINTS FOR*</th><th>RANK RANGE</th></tr></thead><tbody>'+current.map((t,i)=>'<tr class="'+(i<6?'war-cut':'war-out')+'"><td>'+(i+1)+'</td><td><b>'+e(names[t.id])+'</b></td><td>'+t.wins+'–'+t.losses+'</td><td>'+fmt(t.pointsFor)+'</td><td>'+ranges[t.id].best+'–'+ranges[t.id].worst+'</td></tr>').join('')+'</tbody></table></div>';
 const cards=fixtures.map((g,i)=>{
 const key=g.homeId+'-'+g.awayId,a=by[g.homeId],b=by[g.awayId],winner=pick[key];
 const live=Number.isFinite(g.homeScore)&&Number.isFinite(g.awayScore)?'<span class="war-score">'+fmt(g.homeScore)+' – '+fmt(g.awayScore)+(g.final?' · FINAL':' · ESPN SNAPSHOT')+'</span>':'<span class="war-score war-await">ESPN LIVE SCORES UNAVAILABLE · OUTCOME NOT VERIFIED</span>';
 return '<article class="war-match"><div class="war-match-head"><span>CASE '+String(i+1).padStart(2,'0')+' / WEEK '+week+'</span><span>'+(a.wins+'–'+a.losses)+' vs '+(b.wins+'–'+b.losses)+'</span></div><h3>'+e(names[a.id])+' <span>VS</span> '+e(names[b.id])+'</h3>'+live+'<div class="war-choices"><button data-war-pick="'+key+'" data-win="'+a.id+'" class="'+(winner===a.id?'selected':'')+'">IF '+e(names[a.id])+' WINS</button><button data-war-pick="'+key+'" data-win="'+b.id+'" class="'+(winner===b.id?'selected':'')+'">IF '+e(names[b.id])+' WINS</button></div><p>'+e(winner?lore[winner][1]:lore[a.id][1]+' '+lore[b.id][1])+'</p></article>';
 }).join('');
 root.innerHTML='<div class="war-mast"><div><span class="war-eyebrow">SFSN / THE PLAYOFF PANIC ROOM</span><h2>MONDAY NIGHT.<br><em>MAXIMUM DAMAGE.</em></h2><p>Week '+week+' · Five matchups. Three 6–3 contenders. Six playoff tickets. One diaper.</p></div><div class="war-mast-side"><b>32</b><span>POSSIBLE WIN/LOSS OUTCOME COMBINATIONS</span></div></div>'+
 '<div class="war-alert"><strong>'+(resolved?'WEEK '+week+' RESULTS VERIFIED':'THE WEEK IS NOT OVER')+'</strong><span>'+(hasScores?'Scores below reflect the last ESPN snapshot.':'ESPN has not supplied verified live fantasy scores. These are what-if scenarios, not reported results.')+' The final regular-season playoff field is not determined by these scenarios alone.</span></div>'+
 '<div class="war-section-heading"><h3>THE FIVE CASE FILES</h3><span>CHOOSE EACH WINNER TO SEE THE TABLE CHANGE</span></div><div class="war-grid">'+cards+'</div>'+
 '<div class="war-projection"><div class="war-section-heading"><h3>THE STANDINGS MACHINE</h3><button id="war-reset">RESET ALL PICKS ('+decided+'/5)</button></div><p>Scenario records apply your selected outcomes to the <b>completed Week 9 standings</b>. Unselected matchups remain pending. Rank ranges explore all 32 winner combinations.</p>'+table+'<small>* Points-for uses completed games only. Ties are ordered by those existing points, not unreported Week 10 points. Rank ranges are illustrative, not official ESPN tiebreak or playoff odds. Division leaders and byes depend on official league settings and final scores.</small></div>'+
 '<div class="war-bottom"><strong>THE BABY BAR CRAWL IS NOT A METAPHOR.</strong><span>PLAYOFFS BEGIN WEEK 15 · SIX TEAMS ADVANCE · DIVISION LEADERS RECEIVE BYES</span></div>';
 root.querySelectorAll('[data-war-pick]').forEach(btn=>btn.addEventListener('click',()=>{const key=btn.dataset.warPick,val=Number(btn.dataset.win);pick[key]=pick[key]===val?null:val;render();}));
 root.querySelector('#war-reset').addEventListener('click',()=>{Object.keys(pick).forEach(k=>pick[k]=null);render();});
 }
 render();
}
async function start(){try{const r=await fetch('./data/league.json?war='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('data');const d=await r.json();if(d.teams?.length)mount(d);}catch(err){/* Preserve dashboard on ESPN failure. */}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();