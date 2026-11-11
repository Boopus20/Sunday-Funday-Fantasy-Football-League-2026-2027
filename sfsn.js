/* SFSN cinematic newsroom v2. ESPN-backed facts + clearly labeled satire. */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const f=n=>Number.isFinite(Number(n))?Number(n).toFixed(1):'—';
const managers={1:'Mike',2:'Bleif',3:'Rammy',4:'Ginny',5:'Coop',6:'Luke',7:'Travvy',8:'Madar',9:'Cole',10:'Durk'};
const who=t=>managers[t?.id]||t?.name||'Unknown';
const story=(category,title,copy,teamId,stat,source='ESPN • completed weeks')=>({category,title,copy,teamId,stat,source});
function storiesFor(d){
 const teams=d.teams||[],byId=Object.fromEntries(teams.map(t=>[t.id,t])), weeks=d.completedWeeks||1;
 const ranked=[...teams].sort((a,b)=>b.wins-a.wins||b.pointsFor-a.pointsFor);
 const scoring=[...teams].sort((a,b)=>b.averagePoints-a.averagePoints);
 const lucky=[...teams].sort((a,b)=>b.luck-a.luck);
 const positions=d.advanced?.positionPoints||[];
 const prod=d.advanced?.playerProduction||[];
 const pos=id=>positions.find(p=>p.teamId===id)?.slots||{};
 const slot=(id,key)=>Number(pos(id)[key]||0);
 const player=(id,query)=>prod.find(p=>p.teamId===id&&p.playerName?.toLowerCase().includes(query.toLowerCase()));
 const wr=teams.map(t=>({t,value:slot(t.id,'WR1')+slot(t.id,'WR2')})).sort((a,b)=>b.value-a.value);
 const rb=teams.map(t=>({t,value:slot(t.id,'RB1')+slot(t.id,'RB2')})).sort((a,b)=>b.value-a.value);
 const te=teams.map(t=>({t,value:slot(t.id,'TE')})).sort((a,b)=>b.value-a.value);
 const qb=teams.map(t=>({t,value:slot(t.id,'QB')})).sort((a,b)=>b.value-a.value);
 const pointsAgainst=[...teams].sort((a,b)=>b.pointsAgainst-a.pointsAgainst);
 const articles=[];
 const add=(category,title,copy,id,stat,source)=>articles.push(story(category,title,copy,id,stat,source));
 if(ranked[0])add('COVER STORY',who(ranked[0])+' has the keys to the kingdom. Who is taking them?',who(ranked[0])+' is '+ranked[0].wins+'–'+ranked[0].losses+'. The crown is real, but the postseason is a completely different courtroom.',ranked[0].id,ranked[0].wins+' WINS');
 const cole=byId[9],gibbs=player(9,'Jahmyr Gibbs'),allen=player(9,'Josh Allen');
 if(cole&&gibbs&&allen){
  add('THE FRAUD DEPARTMENT','Cole is a Gibbs merchant. But the accomplice is Josh Allen.','Gibbs has scored '+f(gibbs.starterPoints)+' points in '+gibbs.starts+' starts, while Allen has added '+f(allen.starterPoints)+'. Together they account for '+f(100*(gibbs.starterPoints+allen.starterPoints)/cole.pointsFor)+'% of Cole’s total team points. His WR1 and WR2 slots have combined for only '+f(slot(9,'WR1')+slot(9,'WR2'))+'.',9,f(100*(gibbs.starterPoints+allen.starterPoints)/cole.pointsFor)+'% FROM TWO','ESPN • starter contribution; current snapshot');
  add('THE COLE FILES','Six wins, a weak receiver room, and an extraordinary amount of confidence.','Cole is '+cole.wins+'–'+cole.losses+' despite a combined WR1/WR2 total of '+f(slot(9,'WR1')+slot(9,'WR2'))+' points. The backfield and quarterback are doing the work of an entire front office.',9,'WR PAIR '+f(slot(9,'WR1')+slot(9,'WR2')));
 }
 const luke=byId[6],puka=player(6,'Puka Nacua');
 if(luke){
  const rank=wr.findIndex(x=>x.t.id===6)+1;
  add('THE GLAZE FACTORY','Luke’s receivers have earned the velvet rope.','Luke has '+f(slot(6,'WR1')+slot(6,'WR2'))+' points from WR1/WR2, ranking #'+rank+' in the league. His FLEX slot has added '+f(slot(6,'FLEX'))+'. The Ghost may be quiet, but his lineup is not.',6,'WR RANK #'+rank);
  if(puka)add('THE GHOST FILES','Puka has been Luke’s luxury insurance policy.','Puka Nacua has delivered '+f(puka.starterPoints)+' starter points across '+puka.starts+' starts in the available completed-week data. Any future injury news should be checked against this actual exposure before publishing a verdict.',6,f(puka.starterPoints)+' PUKA PTS');
 }
 const mike=byId[1];
 if(mike){
  add('COMMISSIONER UNDER REVIEW','Mike has a tight end problem and the league has questions.','The commissioner’s TE slot has scored just '+f(slot(1,'TE'))+' points in '+weeks+' weeks, averaging '+f(slot(1,'TE')/weeks)+' per week. His '+mike.wins+'–'+mike.losses+' record is not receiving help from the position.',1,f(slot(1,'TE')/weeks)+' TE PPG');
  add('TRADE TRIBUNAL','The Jonathan Taylor trade case needs the actual receipts.','The current ESPN starter-production snapshot lists Jonathan Taylor with Ginny, not Mike. Until a verified transaction ledger establishes the assets and timing, the newsroom will not invent a winner or a trade narrative.',1,'EVIDENCE REQUIRED','Roster snapshot • transaction history unverified');
 }
 const madar=byId[8],jsn=player(8,'Jaxon Smith-Njigba');
 if(madar){
  add('SCHEDULE CRIMES','Madar’s record has a suspiciously friendly relationship with luck.','At '+madar.wins+'–'+madar.losses+', Madar has a +'+f(madar.luck)+' schedule-neutral luck index and the lowest weekly scoring volatility in the league ('+f(madar.pointsPerWeekStdDev)+'). Consistent? Absolutely. Blessed? The numbers say there is an argument.',8,'+'+f(madar.luck)+' LUCK');
  if(jsn)add('THE JSN CONSPIRACY','Madar built a contender on the back of one very loud receiver.','Jaxon Smith-Njigba has delivered '+f(jsn.starterPoints)+' points in '+jsn.starts+' starts. Madar’s WR2 slot alone has generated '+f(slot(8,'WR2'))+' points—more than several teams get from their entire receiver pairing.',8,f(jsn.starterPoints)+' JSN PTS');
 }
 const rammy=byId[3],lamb=player(3,'CeeDee Lamb');
 if(rammy&&lamb)add('THE MAMMOTH REPORT','Rammy has CeeDee Lamb and a running-back emergency.','Lamb has contributed '+f(lamb.starterPoints)+' starter points. Rammy’s RB1 slot, meanwhile, has produced just '+f(slot(3,'RB1'))+' across '+weeks+' weeks. One position is wearing a tuxedo while the other is asking for bus fare.',3,f(slot(3,'RB1')/weeks)+' RB1 PPG');
 const bleif=byId[2],cmc=player(2,'Christian McCaffrey');
 if(bleif&&cmc)add('THE BLENDER FILES','Bleif owns McCaffrey. So why is RB1 in witness protection?','CMC has contributed '+f(cmc.starterPoints)+' starter points, yet Bleif’s RB1 slot totals only '+f(slot(2,'RB1'))+'. The difference reflects lineup slot assignment, not missing points. The bigger story: '+bleif.wins+'–'+bleif.losses+' with a negative luck index.',2,f(slot(2,'RB1'))+' RB1 SLOT','ESPN • slot allocation and player starts');
 const ginny=byId[4],jt=player(4,'Jonathan Taylor');
 if(ginny&&jt)add('THE GINSTER CHRONICLES','Ginny has Jonathan Taylor and still lives in the basement.','Taylor has supplied '+f(jt.starterPoints)+' points in '+jt.starts+' starts, yet Ginny is '+ginny.wins+'–'+ginny.losses+'. A '+f(ginny.luck)+' luck index suggests the schedule has added insult to injury.',4,ginny.wins+'–'+ginny.losses);
 const coop=byId[5];
 if(coop)add('TOUR PRO UNDER PRESSURE','Coop has a tight end empire and a receiver shortage.','Coop’s TE slot has '+f(slot(5,'TE'))+' points, while WR1/WR2 together have '+f(slot(5,'WR1')+slot(5,'WR2'))+'. The tour pro can read a green, but can he read a receiver depth chart?',5,'TE '+f(slot(5,'TE')));
 const trav=byId[7];
 if(trav)add('THE UNIT LAUNCHER','Travvy has an RB room and an extreme case of variance.','Travvy’s RB1/RB2 slots have scored '+f(slot(7,'RB1')+slot(7,'RB2'))+' points. His '+f(trav.pointsPerWeekStdDev)+' scoring volatility makes every Sunday feel like a leveraged trade with no stop-loss.',7,f(trav.pointsPerWeekStdDev)+' VOLATILITY');
 const durk=byId[10];
 if(durk)add('THE THANOS REPORT','Durk has assembled the tight end infinity stone.','Durk’s TE slot leads the league with '+f(slot(10,'TE'))+' points, and his '+f(durk.averagePoints)+' points per week are the highest league average. This is a contender with actual receipts.',10,'#1 PPG');
 if(scoring[0])add('THE POWER INDEX',who(scoring[0])+' owns the highest-output offense','At '+f(scoring[0].averagePoints)+' points per week, '+who(scoring[0])+' is the top scorer. No imaginary power-ranking formula required.',scoring[0].id,f(scoring[0].averagePoints)+' PPG');
 if(lucky[0]?.luck>0.25)add('FRAUD WATCH',who(lucky[0])+' is receiving gifts from the schedule','A +'+f(lucky[0].luck)+' luck index means actual wins exceed schedule-neutral expectation. This is not a criminal conviction, but the league would like to see the paperwork.',lucky[0].id,'+'+f(lucky[0].luck)+' LUCK');
 if(lucky.at(-1)?.luck<-.25)add('CRIMES AGAINST FANTASY',who(lucky.at(-1))+' has grounds for a formal complaint','A '+f(lucky.at(-1).luck)+' luck index means the underlying all-play record deserves more wins than the real schedule provided.',lucky.at(-1).id,f(lucky.at(-1).luck)+' LUCK');
 if(ranked.at(-1))add('BABY BAR CRAWL WATCH',who(ranked.at(-1))+' is dangerously close to the diaper aisle','Currently '+ranked.at(-1).wins+'–'+ranked.at(-1).losses+'. The punishment is not yet decided. The fitting appointment remains a possibility.',ranked.at(-1).id,ranked.at(-1).wins+'–'+ranked.at(-1).losses);
 if(wr[0])add('POSITION EMPIRE',who(wr[0].t)+' owns the WR1/WR2 penthouse','The two starting wide receiver slots have produced '+f(wr[0].value)+' points, or '+f(wr[0].value/weeks)+' per completed week.',wr[0].t.id,'#1 WR ROOM');
 if(rb[0])add('TRENCH WARFARE',who(rb[0].t)+' has the most productive RB pairing','RB1 and RB2 combined for '+f(rb[0].value)+' points through '+weeks+' weeks.',rb[0].t.id,'#1 RB ROOM');
 if(qb[0])add('QUARTERBACK DEPARTMENT',who(qb[0].t)+' is winning the QB arms race','The quarterback slot has produced '+f(qb[0].value)+' points, the highest in the league.',qb[0].t.id,'#1 QB');
 if(te[0])add('THE TIGHT END COUNCIL',who(te[0].t)+' controls the tight end market','The TE slot has delivered '+f(te[0].value)+' points. The league average is '+f(te.reduce((sum,x)=>sum+x.value,0)/te.length)+'.',te[0].t.id,'#1 TE');
 if(pointsAgainst[0])add('THE OPPONENT CURSE',who(pointsAgainst[0])+' keeps running into buzzsaws','Opponents have scored '+f(pointsAgainst[0].pointsAgainst)+' points against '+who(pointsAgainst[0])+'. No defense can prevent another manager from having a career Sunday.',pointsAgainst[0].id,f(pointsAgainst[0].pointsAgainst)+' AGAINST');
 const high=[...teams].sort((a,b)=>b.bestWeek-a.bestWeek)[0];
 if(high)add('THE NUCLEAR FILES',who(high)+' owns the season’s largest single-week explosion','A '+f(high.bestWeek)+'-point performance is the highest completed-week team score in the current snapshot.',high.id,f(high.bestWeek)+' PTS');
 const wild=[...teams].sort((a,b)=>b.pointsPerWeekStdDev-a.pointsPerWeekStdDev)[0];
 if(wild)add('VOLATILITY DESK',who(wild)+' is the league’s weekly roller coaster','With '+f(wild.pointsPerWeekStdDev)+' points of weekly standard deviation, nobody knows which version of this roster is showing up.',wild.id,f(wild.pointsPerWeekStdDev)+' SWING');
 return articles;
}
function render(d){
 const root=document.getElementById('sfsn-newsroom')||document.createElement('section');root.id='sfsn-newsroom';
 if(!root.parentNode)document.querySelector('main')?.prepend(root);
 const all=storiesFor(d);if(!all.length)return;
 const rotate=Math.max(0,(d.completedWeeks||1)-1)%Math.min(5,all.length);
 const lead=all[rotate],rest=all.filter(x=>x!==lead);
 const time=d.updatedAt?new Date(d.updatedAt).toLocaleString():'unknown';
 root.innerHTML='<div class="sfsn-mast"><div><div class="sfsn-kicker">THE OFFICIAL UNOFFICIAL LEAGUE NEWSROOM</div><strong>SFSN<span> / THE SUNDAY FUNDAY WIRE</span></strong></div><div class="sfsn-edition">2026 SEASON · WEEK '+esc(d.currentWeek)+'<br>DATA UPDATED '+esc(time)+'</div></div>'+
 '<div class="sfsn-ticker"><b>BREAKING THE LEAGUE</b><span>'+esc(all.slice(1,5).map(x=>x.title).join('　 ◆　 '))+'</span></div>'+
 '<div class="sfsn-hero"><article class="sfsn-feature"><div class="sfsn-feature-shade"></div><div class="sfsn-feature-content"><div class="sfsn-kicker">'+esc(lead.category)+' / EXCLUSIVE</div><h2>'+esc(lead.title)+'</h2><p>'+esc(lead.copy)+'</p><div class="sfsn-meta">'+esc(lead.source)+' · '+esc(lead.stat)+'</div></div></article><aside class="sfsn-side"><div class="sfsn-kicker">THE LEAGUE AT A GLANCE</div><div class="sfsn-big-number">'+esc(d.completedWeeks)+'</div><div class="sfsn-subtitle">COMPLETED WEEKS</div><div class="sfsn-rule"></div><h3>Everybody has a story. Most of them are embarrassing.</h3><p>Investigations, position-room royalty, fraudulent records and the long march toward the Baby Bar Crawl.</p><div class="sfsn-meta">Facts from ESPN · Satire from the newsroom</div></aside></div>'+
 '<div class="sfsn-toolbar"><h2>THE LATEST DISPATCHES</h2><div class="sfsn-filters"><button class="selected" data-sfsn-filter="ALL">ALL</button><button data-sfsn-filter="FRAUD">FRAUD</button><button data-sfsn-filter="GLAZE">GLAZE</button><button data-sfsn-filter="OTHER">OTHER</button></div></div>'+
 '<div class="sfsn-grid" id="sfsn-articles">'+rest.map((x,i)=>'<article class="sfsn-article" data-category="'+esc(/FRAUD|CRIMES|VOLATILITY|BABY|TRADE/.test(x.category)?'FRAUD':/GLAZE|POSITION|POWER|TRENCH/.test(x.category)?'GLAZE':'OTHER')+'"><div class="sfsn-story-index">'+String(i+1).padStart(2,'0')+' / SFSN</div><div class="sfsn-kicker">'+esc(x.category)+'</div><h3>'+esc(x.title)+'</h3><p>'+esc(x.copy)+'</p><div class="sfsn-article-bottom"><strong>'+esc(x.stat)+'</strong><span>'+esc(x.source)+'</span></div></article>').join('')+'</div>'+
 '<div class="sfsn-bottomline">NO MADE-UP STATS. NO FREE PASSES. EVERY MANAGER UNDER INVESTIGATION. <span>↓ THE ANALYTICS VAULT</span></div>';
 root.querySelectorAll('[data-sfsn-filter]').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('[data-sfsn-filter]').forEach(x=>x.classList.toggle('selected',x===b));root.querySelectorAll('[data-category]').forEach(x=>x.hidden=b.dataset.sfsnFilter!=='ALL'&&x.dataset.category!==b.dataset.sfsnFilter);}));
}
async function init(){try{const r=await fetch('./data/league.json?sfsn='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('Missing league data');const d=await r.json();if(!Array.isArray(d.teams)||d.teams.length!==10)throw Error('Incomplete league data');render(d);}catch(e){const main=document.querySelector('main');if(main){const p=document.createElement('p');p.className='notice';p.textContent='SFSN newsroom awaiting verified ESPN data. The analytics dashboard below is unchanged.';main.prepend(p);}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();