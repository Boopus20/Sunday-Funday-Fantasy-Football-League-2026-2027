/* SFSN cinematic newsroom v2. ESPN-backed facts + clearly labeled satire. */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const f=n=>Number.isFinite(Number(n))?Number(n).toFixed(1):'—';
const managers={1:'Mike',2:'Bleif',3:'Rammy',4:'Ginny',5:'Coop',6:'Luke',7:'Travvy',8:'Madar',9:'Cole',10:'Durk'};
const who=t=>managers[t?.id]||t?.name||'Unknown';
const story=(category,title,copy,teamId,stat,source='ESPN • completed weeks')=>({category,title,copy,teamId,stat,source});
function storiesFor(d){
 const teams=d.teams||[],byId=Object.fromEntries(teams.map(t=>[t.id,t]));
 const ranked=[...teams].sort((a,b)=>b.wins-a.wins||b.pointsFor-a.pointsFor);
 const scoring=[...teams].sort((a,b)=>b.averagePoints-a.averagePoints);
 const lucky=[...teams].sort((a,b)=>b.luck-a.luck);
 const positions=d.advanced?.positionPoints||[];
 const pos=id=>positions.find(p=>p.teamId===id)?.slots||{};
 const weeks=d.completedWeeks||1;
 const wr=teams.map(t=>({t,value:(pos(t.id).WR1||0)+(pos(t.id).WR2||0)})).sort((a,b)=>b.value-a.value);
 const rb=teams.map(t=>({t,value:(pos(t.id).RB1||0)+(pos(t.id).RB2||0)})).sort((a,b)=>b.value-a.value);
 const production=d.advanced?.playerProduction||[];
 const cole=byId[9],luke=byId[6],mike=byId[1];
 const gibbs=production.find(p=>p.teamId===9&&/jahmyr gibbs/i.test(p.playerName||''));
 const articles=[];
 if(ranked[0])articles.push(story('COVER STORY',who(ranked[0])+' has the keys to the kingdom. Who is taking them?',who(ranked[0])+' sits at '+ranked[0].wins+'–'+ranked[0].losses+'. In a league where every contender has a weakness, first place is a target, not a guarantee.',ranked[0].id,ranked[0].wins+' WINS'));
 if(cole)articles.push(story('FRAUD INVESTIGATION','Cole’s Gibbs Merchant allegations are under formal review',gibbs?'Gibbs has produced '+f(gibbs.starterPoints)+' points in '+gibbs.starts+' starts for Cole. The league demands to know whether this is a balanced roster or a one-man rescue mission.':'Cole continues to face Gibbs Merchant allegations. The editorial board will not invent his dependency percentage without a verified player contribution.',9,gibbs?f(gibbs.starterPoints)+' GIBBS PTS':'CASE OPEN',gibbs?'ESPN • player starts':'League satire • dependency unverified'));
 if(luke){const rank=wr.findIndex(x=>x.t.id===6)+1;articles.push(story('THE GLAZE FACTORY',rank===1?'Luke’s receiver room is the league’s crown jewel':'Luke’s receivers enter the court of public opinion','Luke’s WR1 and WR2 slots have produced '+f((pos(6).WR1||0)+(pos(6).WR2||0))+' combined points through '+weeks+' completed weeks, ranking #'+rank+' of '+teams.length+'. '+(rank===1?'The glaze is officially evidence-based.':'The reputation is loud. The numbers get the final say.'),6,'WR RANK #'+rank));}
 if(mike)articles.push(story('TRADE TRIBUNAL','Mike’s Jonathan Taylor gamble: the receipts are requested','The commissioner’s Taylor trade remains a standing editorial investigation. A winner cannot be declared until the actual trade assets and post-trade points are verified.',1,'VERDICT PENDING','League lore • trade value not verified'));
 if(scoring[0])articles.push(story('THE POWER INDEX',who(scoring[0])+' runs the highest-output offense','The league’s top scorer is averaging '+f(scoring[0].averagePoints)+' points per completed week. Schedule luck can distort wins; weekly production is harder to argue with.',scoring[0].id,f(scoring[0].averagePoints)+' PPG'));
 if(lucky[0]&&lucky[0].luck>0.25)articles.push(story('FRAUD WATCH',who(lucky[0])+' has been blessed by the scheduling department','With '+f(lucky[0].luck)+' more actual wins than schedule-neutral expectation, '+who(lucky[0])+' is receiving the kind of assistance no commissioner can legally arrange.',lucky[0].id,'+'+f(lucky[0].luck)+' LUCK'));
 if(lucky.at(-1)&&lucky.at(-1).luck<-.25)articles.push(story('CRIMES AGAINST FANTASY',who(lucky.at(-1))+' demands a congressional hearing','A luck index of '+f(lucky.at(-1).luck)+' wins means the schedule has been less forgiving than the underlying scores suggest. Justice remains unavailable on waivers.',lucky.at(-1).id,f(lucky.at(-1).luck)+' LUCK'));
 if(ranked.at(-1))articles.push(story('BABY BAR CRAWL WATCH',who(ranked.at(-1))+' is shopping in the infant section','At '+ranked.at(-1).wins+'–'+ranked.at(-1).losses+', '+who(ranked.at(-1))+' currently occupies the basement. The diaper is not fitted yet. The threat is very real.',ranked.at(-1).id,ranked.at(-1).wins+'–'+ranked.at(-1).losses));
 if(wr[0])articles.push(story('POSITION EMPIRE',who(wr[0].t)+' owns the wide receiver penthouse','WR1 and WR2 have combined for '+f(wr[0].value)+' points. That is '+f(wr[0].value/weeks)+' per completed week from the two receiver slots alone.',wr[0].t.id,'#1 WR ROOM'));
 if(rb[0])articles.push(story('TRENCH WARFARE',who(rb[0].t)+' has the most dangerous running-back duo','RB1 and RB2 have generated '+f(rb[0].value)+' combined points. A weekly '+f(rb[0].value/weeks)+'-point foundation from those slots.',rb[0].t.id,'#1 RB ROOM'));
 const explosive=[...teams].sort((a,b)=>b.bestWeek-a.bestWeek)[0];
 if(explosive)articles.push(story('THE NUCLEAR FILES',who(explosive)+' owns the season’s biggest eruption','A '+f(explosive.bestWeek)+'-point week remains the league’s highest single-team scoring explosion. Everybody else has been handed the film.',explosive.id,f(explosive.bestWeek)+' PTS'));
 const inconsistent=[...teams].sort((a,b)=>b.pointsPerWeekStdDev-a.pointsPerWeekStdDev)[0];
 if(inconsistent)articles.push(story('VOLATILITY DESK',who(inconsistent)+' is a weekly medical emergency','With a weekly scoring standard deviation of '+f(inconsistent.pointsPerWeekStdDev)+', nobody knows which version of this roster is walking into the stadium.',inconsistent.id,f(inconsistent.pointsPerWeekStdDev)+' SWING'));
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