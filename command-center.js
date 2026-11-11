/* SFSN COMMAND CENTER: 4 destinations, hard-hitting evidence, legacy analytics preserved in vault. */
(()=>{'use strict';
const names={1:'Mike',2:'Bleif',3:'Rammy',4:'Ginny',5:'Coop',6:'Luke',7:'Travvy',8:'Madar',9:'Cole',10:'Durk'};
const aliases={1:'Commissioner of Catastrophe',2:'The Corporate Collapse',3:'The Mammoth Donation Fund',4:'The Land Surveyor of Losses',5:'The Tour Pro of Mediocrity',6:'The Ghost with Receipts',7:'The Leveraged Disaster',8:'The Calendar Criminal',9:'The Gibbs Life Support System',10:'Three-Ring Menace'};
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const f=n=>Number.isFinite(+n)?Number(n).toFixed(1):'—';
const teamName=t=>names[t?.id]||t?.name||'Unknown';
const rank=(list,id)=>list.findIndex(x=>x.id===id)+1;
function make(d){
 const t=d.teams||[],pos=d.advanced?.positionPoints||[],weeks=d.completedWeeks||1;
 const byScore=[...t].sort((a,b)=>b.averagePoints-a.averagePoints);
 const byWins=[...t].sort((a,b)=>b.wins-a.wins||b.pointsFor-a.pointsFor);
 const byAll=[...t].sort((a,b)=>b.expectedWins-a.expectedWins);
 const byRecent=[...t].sort((a,b)=>recent(b)-recent(a));
 const byLuck=[...t].sort((a,b)=>b.luck-a.luck);
 const slot=(id,k)=>Number(pos.find(p=>p.teamId===id)?.slots?.[k]||0);
 function recent(x){const w=[...(x.weeklyScores||[])].sort((a,b)=>b.week-a.week).slice(0,3);return w.length?w.reduce((s,v)=>s+v.points,0)/w.length:x.averagePoints;}
 // Transparent rank blend: 45% scoring, 35% all-play, 20% last 3 completed weeks.
 const power=[...t].map(x=>({...x,powerScore:100*(.45*(t.length-rank(byScore,x.id))/(t.length-1)+.35*(t.length-rank(byAll,x.id))/(t.length-1)+.20*(t.length-rank(byRecent,x.id))/(t.length-1))})).sort((a,b)=>b.powerScore-a.powerScore);
 const leader=power[0],fraud=byLuck[0],unlucky=byLuck.at(-1);
 const el=document.createElement('section');el.id='sfsn-command';
 el.innerHTML='<div class="command-mast"><div class="sfsn-kicker">THE LEAGUE IS NOT A HOBBY. IT IS A PERSONALITY DISORDER.</div><h2>THE WAR ROOM<span> / 2026</span></h2><p>Ten managers. Six playoff spots. One baby costume. No mercy.</p></div>'+
 '<div class="command-metrics"><div><small>POWER LEADER</small><strong>'+e(teamName(leader))+'</strong><span>'+f(leader.powerScore)+'/100 power index</span></div><div><small>TOP OFFENSE</small><strong>'+e(teamName(byScore[0]))+'</strong><span>'+f(byScore[0].averagePoints)+' PPG</span></div><div><small>SCHEDULE MERCHANT</small><strong>'+e(teamName(fraud))+'</strong><span>+'+f(fraud.luck)+' wins vs expected</span></div><div><small>BAD LUCK DEPARTMENT</small><strong>'+e(teamName(unlucky))+'</strong><span>'+f(unlucky.luck)+' wins vs expected</span></div></div>'+
 '<nav class="command-nav" aria-label="League command center"><button data-view="standings" class="active">THE LEAGUE</button><button data-view="power">POWER & FRAUD</button><button data-view="matchups">MATCHUPS</button><button data-view="teams">TEAM DOSSIERS</button></nav>'+
 '<div id="command-body" class="command-body"></div><details class="command-vault"><summary>THE ANALYTICS VAULT <span>All 18 original reports · advanced research</span></summary><div class="command-vault-links" id="command-vault-links"></div><div id="command-vault-slot"></div></details>';
 const main=document.querySelector('main'),oldNav=main.querySelector('nav.tabs'),oldPanel=main.querySelector('section.panel'),oldCards=main.querySelector('#cards'),oldTop=main.querySelector('.top'),oldNotice=main.querySelector('#notice'),how=main.querySelectorAll('section.panel')[1];
 [oldNav,oldCards,oldTop,oldNotice,how].forEach(n=>n?.classList.add('command-legacy-hidden'));
 oldPanel?.classList.add('command-legacy-panel');
 main.insertBefore(el,document.getElementById('sfsn-newsroom')?.nextSibling||main.firstChild);
 const vault=el.querySelector('#command-vault-slot');if(oldPanel)vault.appendChild(oldPanel);
 const links=el.querySelector('#command-vault-links');
 oldNav?.querySelectorAll('[data-tab]').forEach(b=>{const c=document.createElement('button');c.textContent=b.textContent;c.addEventListener('click',()=>{oldNav.querySelector('[data-tab="'+b.dataset.tab+'"]')?.click();el.querySelector('.command-vault').open=true;});links.appendChild(c);});
 const body=el.querySelector('#command-body');
 function table(headers,rows){return '<div class="command-table-scroll"><table><thead><tr>'+headers.map(h=>'<th>'+e(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
 const wlt=x=>x.wins+'–'+x.losses;
 const standings=()=>'<div class="command-section-head"><div><span class="sfsn-kicker">THE OFFICIAL TABLE</span><h3>Standings. No excuses.</h3></div><p>Top six qualify; division leaders earn the byes.</p></div>'+table(['#','MANAGER','RECORD','PPG','EXPECTED W','LUCK'],byWins.map((x,i)=>['<b>'+(i+1)+'</b>','<strong>'+e(teamName(x))+'</strong><small>'+e(aliases[x.id])+'</small>',wlt(x),f(x.averagePoints),f(x.expectedWins),'<span class="'+(x.luck>0?'command-good':'command-bad')+'">'+(x.luck>0?'+':'')+f(x.luck)+'</span>']))+'<p class="command-method">Expected wins = weekly all-play wins / 9. Luck = actual wins − expected wins. Playoff positions shown by overall record; division byes determined by league rules.</p>';
 const powers=()=>'<div class="command-section-head"><div><span class="sfsn-kicker">RECORDS ARE FOR FRAUDS</span><h3>The real power rankings</h3></div><p>45% PPG rank · 35% all-play rank · 20% last-three-week PPG rank</p></div>'+table(['#','MANAGER','POWER','PPG','ALL-PLAY W','LAST 3'],power.map((x,i)=>['<b>'+(i+1)+'</b>','<strong>'+e(teamName(x))+'</strong><small>'+e(aliases[x.id])+'</small>','<strong>'+f(x.powerScore)+'</strong>',f(x.averagePoints),f(x.expectedWins),f(recent(x))]))+'<div class="command-editorial"><h4>THE FRAUDOMETER</h4><p>'+e(teamName(fraud))+' has '+f(fraud.luck)+' more wins than the schedule-neutral model expects. Meanwhile '+e(teamName(unlucky))+' is '+f(Math.abs(unlucky.luck))+' wins below expectation. The standings are real; the schedule is a crooked witness.</p></div>';
 const matchups=()=>{const games=(d.matchups||d.currentMatchups||[]);return '<div class="command-section-head"><div><span class="sfsn-kicker">EVERY SUNDAY IS PERSONAL</span><h3>Matchup Center</h3></div></div><div class="command-editorial"><h4>THE WEEKLY BLOODBATH</h4><p>All original matchup previews, results and custom lore remain available in the analytics vault. Select <b>Matchup Center</b> there for the complete breakdown.</p></div><div class="command-mini-stats"><div><small>TOP OFFENSE</small><strong>'+e(teamName(byScore[0]))+'</strong><span>'+f(byScore[0].averagePoints)+' PPG</span></div><div><small>HOTTEST LAST 3</small><strong>'+e(teamName(byRecent[0]))+'</strong><span>'+f(recent(byRecent[0]))+' PPG</span></div></div>';};
 const teamsView=()=>'<div class="command-section-head"><div><span class="sfsn-kicker">THE SCOUTING DEPARTMENT</span><h3>Ten teams. Ten indictments.</h3></div><p>Actual production, not fake scouting grades.</p></div><div class="command-dossiers">'+power.map((x,i)=>{const scores=[['QB',slot(x.id,'QB')],['RB',slot(x.id,'RB1')+slot(x.id,'RB2')],['WR',slot(x.id,'WR1')+slot(x.id,'WR2')],['TE',slot(x.id,'TE')]].sort((a,b)=>b[1]-a[1]);const weakest=scores.at(-1),strong=scores[0];return '<article><div class="sfsn-kicker">POWER #'+(i+1)+' · '+wlt(x)+'</div><h4>'+e(teamName(x))+'</h4><div class="command-alias">'+e(aliases[x.id])+'</div><p><b>THE WEAPON:</b> '+e(strong[0])+' slots — '+f(strong[1])+' points.</p><p><b>THE WEAK LINK:</b> '+e(weakest[0])+' slots — '+f(weakest[1])+' points.</p><div class="command-dossier-foot"><span>'+f(x.averagePoints)+' PPG</span><span>'+(x.luck>0?'+':'')+f(x.luck)+' LUCK</span></div></article>'}).join('')+'</div><p class="command-method">Position groups compare raw starting-slot totals; QB, RB, WR and TE have different numbers of slots, so this is a production profile, not a position-adjusted grade.</p>';
 const views={standings,power:powers,matchups,teams:teamsView};
 function set(v){body.innerHTML=views[v]();el.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));}
 el.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>set(b.dataset.view)));
 set('standings');
 // Keep editorial concise: one cover + six strongest stories, remaining stories available on demand.
 const newsroom=document.getElementById('sfsn-newsroom');if(newsroom){const articles=[...newsroom.querySelectorAll('.sfsn-article')];if(articles.length>6){articles.slice(6).forEach(a=>a.hidden=true);const button=document.createElement('button');button.className='command-more';button.textContent='READ ALL INVESTIGATIONS ('+articles.length+')';let open=false;button.addEventListener('click',()=>{open=!open;articles.slice(6).forEach(a=>a.hidden=!open);button.textContent=open?'SHOW FEWER STORIES':'READ ALL INVESTIGATIONS ('+articles.length+')';});newsroom.querySelector('.sfsn-grid')?.after(button);}}
}
async function init(){try{const r=await fetch('./data/league.json?command='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('sync');const d=await r.json();if(!d.teams?.length)return;make(d);}catch(err){/* Original dashboard remains usable if new view cannot load. */}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();