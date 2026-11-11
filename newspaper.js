/* SFSN Newspaper Edition — five curated, fully readable, ESPN-grounded features. */
(()=>{'use strict';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const N=n=>Number(n||0).toFixed(1);
const manager={1:'Mike',2:'Bleif',3:'Rammy',4:'Ginny',5:'Coop',6:'Luke',7:'Travvy',8:'Madar',9:'Cole',10:'Durk'};
function articles(d){
 const t=Object.fromEntries(d.teams.map(x=>[x.id,x])),prod=d.advanced?.playerProduction||[],slots=d.advanced?.positionPoints||[];
 const get=(id,term)=>prod.find(p=>p.teamId===id&&p.playerName?.toLowerCase().includes(term.toLowerCase()));
 const slot=(id,key)=>Number(slots.find(p=>p.teamId===id)?.slots?.[key]||0);
 const w=d.completedWeeks||1;
 const sorted=[...d.teams].sort((a,b)=>b.averagePoints-a.averagePoints);
 const bottom=[...d.teams].sort((a,b)=>a.wins-b.wins||a.pointsFor-b.pointsFor)[0];
 const cole=t[9],gibbs=get(9,'Jahmyr Gibbs'),allen=get(9,'Josh Allen'),m=t[8],jsn=get(8,'Jaxon Smith-Njigba'),l=t[6],puka=get(6,'Puka Nacua'),durk=t[10],ginny=t[4],jt=get(4,'Jonathan Taylor');
 const out=[];
 const push=(tag,title,dek,subject,tone,paragraphs,stat)=>out.push({tag,title,dek,subject,tone,paragraphs,stat});
 if(cole&&gibbs&&allen)push('SPECIAL INVESTIGATION','The Gibbs Merchant Has an Accomplice','Cole built a six-win operation on two superstars and a receiving corps that appears to have been assembled during a lunch break.','COLE / THE MEDIA MOGGER','roast',[
 'The Sunday Funday Wire has reviewed the evidence, and the verdict is not particularly flattering for Cole Likovetz, the Jacksonville sandwich architect who somehow operates an NFL fantasy roster with the same reckless confidence he brings to a golf swing that has never met a fairway it could not avoid.',
 'Jahmyr Gibbs has supplied '+N(gibbs.starterPoints)+' points in '+gibbs.starts+' starts. Josh Allen has contributed another '+N(allen.starterPoints)+'. That is '+N(100*(gibbs.starterPoints+allen.starterPoints)/cole.pointsFor)+' percent of Cole’s total team scoring from just two starters. This is not a balanced attack. This is a two-man rescue operation with nine other employees taking credit at the press conference.',
 'His WR1 and WR2 slots have produced '+N(slot(9,'WR1')+slot(9,'WR2'))+' points combined. Meanwhile, Cole is '+cole.wins+'–'+cole.losses+'. The record is excellent. The roster construction looks like somebody used the entire salary cap on a luxury yacht and then asked the receiving corps to swim behind it.',
 'The same man who asks for triple sour cream at Chipotle has apparently applied that philosophy to roster building: maximum indulgence, absolutely no regard for structural integrity. Gibbs and Allen are incredible. This duo has me about to bust through the press box. They are carrying this team like two exhausted parents carrying a screaming toddler through an airport. The rest of the lineup owes them an apology.'
 ],N(100*(gibbs.starterPoints+allen.starterPoints)/cole.pointsFor)+'% FROM TWO PLAYERS');
 if(m&&jsn)push('THE FRAUD WATCH','Madar Is Winning. The Schedule Has Some Explaining to Do.','A six-win contender, an absurdly reliable weekly floor, and a luck index that deserves a subpoena.','MADAR / MR. CALENDAR','roast',[
 'Ben Madar has finally emerged from the government facility where they confiscate his phone, and the league has discovered something deeply upsetting: the human skyscraper is actually good at fantasy football.',
 'Madar is '+m.wins+'–'+m.losses+' while averaging '+N(m.averagePoints)+' points per game. His weekly scoring standard deviation is '+N(m.pointsPerWeekStdDev)+', among the lowest in the league. This team is not chaotic. It shows up, clocks in, does the work, and leaves the building at exactly 5:01.',
 'But the schedule has also been suspiciously accommodating. Madar’s luck index is +'+N(m.luck)+' wins relative to schedule-neutral expectation. This does not invalidate the record. It does mean the league should consider investigating who is responsible for assigning this Georgia Tech tower of a man such favorable circumstances.',
 'Jaxon Smith-Njigba has scored '+N(jsn.starterPoints)+' starter points across '+jsn.starts+' starts. Delicious. Gorgeous. The kind of production that makes an analyst loosen his tie and whisper “oh yes, keep feeding him.” If Madar wins the championship, the sexy-calendar punishment from a prior season will be reclassified as the origin story of a dynasty. Until then, the fraud department remains open.'
 ],'+'+N(m.luck)+' SCHEDULE LUCK');
 if(l&&puka)push('THE GLAZE FACTORY','The Ghost Has Arrived, and His Receivers Are Disgustingly Good','Luke rarely answers a text. His roster, however, has been sending the entire league a very clear message.','LUKE / THE GHOST','glaze',[
 'Ladies and gentlemen, please dim the lights. Clear the runway. Remove the velvet rope. The Ghost of the League has arrived, and the receiver production is so beautiful it should be displayed behind museum glass.',
 'Luke is '+l.wins+'–'+l.losses+' with '+N(l.averagePoints)+' points per game. His WR1 and WR2 slots have delivered '+N(slot(6,'WR1')+slot(6,'WR2'))+' points, while FLEX has added another '+N(slot(6,'FLEX'))+'. That is real production, not a vibes-based scouting report.',
 'Puka Nacua has supplied '+N(puka.starterPoints)+' points in '+puka.starts+' starts. I am about to nut watching this receiver room operate. This is a statistical obscenity. Every target is a love letter. Every reception is a warm bath for a fantasy manager who otherwise responds to league messages approximately once per presidential administration.',
 'There is something profoundly annoying about a manager who can disappear from the group chat, go play pickleball, and return to find his receivers casually building a cathedral out of PPR points. Luke, you beautiful, unresponsive phantom. The league hates how much it respects this roster.'
 ],N(l.averagePoints)+' POINTS PER WEEK');
 if(durk)push('THE CHAMPIONSHIP DESK','Thanos Has the Stones. Everybody Else Has Excuses.','Durk’s offense is the highest-scoring operation in the league. The self-appointed expert may, regrettably, have a point.','DURK / THREE-RING THANOS','glaze',[
 'We regret to inform the public that Sean Durkin is not merely talking. The man has numbers. This is devastating news for everyone who has spent years hoping that the three-ring supervillain would finally be exposed as a fraud.',
 'Durk is '+durk.wins+'–'+durk.losses+' and averaging '+N(durk.averagePoints)+' points per week, the highest in the current ESPN snapshot. His tight end slot has contributed '+N(slot(10,'TE'))+' points. That is an absurd luxury at a position where other managers are trying to scrape together six points and a prayer.',
 'The self-declared fantasy genius who bets on his own players has assembled a lineup that is genuinely frightening. That tight end production has me about to bust. I'm staring at the numbers like a man who has forgotten how to behave in public. So rich. So velvety. You could pour it over pancakes. This is the kind of offense that makes a grown commissioner stare at his own roster and reconsider every decision since draft night.',
 'Does this mean Durk is guaranteed a championship? Absolutely not. It means the rest of the league must find a way to beat a man who will become completely unbearable if he gets another trophy. The stakes could not be higher.'
 ],N(durk.averagePoints)+' LEAGUE-BEST PPG');
 const roster=d.currentRosters||[];
 const owner=term=>{const matches=roster.filter(p=>p.playerName?.toLowerCase().includes(term.toLowerCase()));return matches.length===1?matches[0].teamId:null;};
 const taylorOwner=owner('Jonathan Taylor');
 const completedTx=(d.advanced?.transactions||[]).filter(tx=>tx.type==='TRADE'&&['EXECUTED','PROCESSED','COMPLETE','COMPLETED'].includes(String(tx.status||'').toUpperCase()));
 const taylorTx=completedTx.find(tx=>(tx.items||[]).some(i=>Number(i.playerId)===4242335&&Number(i.toTeamId)===1));
 const tradeDetails=(()=>{if(!taylorTx)return null;const items=taylorTx.items||[];const incoming=items.filter(i=>Number(i.toTeamId)===1&&Number(i.fromTeamId)>0).map(i=>i.playerName).filter(Boolean);
 const outgoing=items.filter(i=>Number(i.fromTeamId)===1&&Number(i.toTeamId)>0).map(i=>i.playerName).filter(Boolean);
 if(!incoming.includes('Jonathan Taylor')||!outgoing.length)return null;
 return {incoming,outgoing};})();

 if(taylorOwner===1&&t[1])push('BREAKING / TRADE DESK','The Commissioner Just Acquired Jonathan Taylor. The League Is on Notice.','Mike has added Jonathan Taylor to his current ESPN roster. Is this a rescue mission or a very expensive rearrangement of the deck chairs?','MIKE / THE COMMISSIONER','glaze',[
 'The Sunday Funday Times can confirm from the latest ESPN roster snapshot that Jonathan Taylor now belongs to Mike. That is current ownership, not a guess based on which team started Taylor in earlier weeks. The commissioner has made his move, and the rest of the league is required to act impressed for at least fifteen seconds.',
 'Mike enters the latest completed standings at '+t[1].wins+'–'+t[1].losses+', averaging '+N(t[1].averagePoints)+' points per week. Taylor is a major name to add to a team looking for momentum. This move has me about to bust. The commissioner just dropped a trade so filthy I need to close the spreadsheet and collect myself. The upside. The promise. The possibility of the commissioner finally administering a competent fantasy roster instead of just administering everybody else’s suffering.',
 tradeDetails?'The verified ESPN transaction record shows Mike received '+tradeDetails.incoming.join(', ')+' and sent away '+tradeDetails.outgoing.join(', ')+'. Now THAT is a move worth dissecting. The transaction tells us who moved; the next several weeks will tell us who won.':'The trade is confirmed by current ownership, but ESPN has not yet supplied a complete executed transaction record showing every player exchanged. We will not invent the outgoing players or declare a winner without that evidence. Nor will we credit Mike with Taylor’s points from games played for a previous fantasy manager.',
 'The commissioner is now on the clock. A shiny new running back is wonderful; a shiny new running back attached to another loss is just an expensive accessory. The league will judge this acquisition by what happens next.'
 ],'CURRENT ROSTER: MIKE + JONATHAN TAYLOR');
 if(ginny&&taylorOwner===1)push('AFTERMATH / BABY WATCH','Ginny Lost Jonathan Taylor. The Record Was Already a Crime Scene.','The Ginster has watched a star leave the building while the schedule continues its campaign of personal harassment.','GINNY / MCDIVOTS','roast',[
 'Ryan McGinnis spends his professional life researching who owns land. Unfortunately, he can no longer claim ownership of Jonathan Taylor. The latest ESPN roster lists Taylor with Mike. A landman losing the title deed to his best-known running back is a level of occupational irony that deserves its own county record.',
 'Ginny is '+ginny.wins+'–'+ginny.losses+' and averaging '+N(ginny.averagePoints)+' points per game. The season has been difficult enough without an editorial department holding a magnifying glass over the transactions.',
 'His luck index is '+N(ginny.luck)+', meaning schedule luck has played a part in the misery. That is a real mitigating factor, not an excuse that will convince the Baby Bar Crawl committee to cancel the diaper order.',
 'We cannot grade the trade without knowing the full return. But the headline is real: Taylor is no longer on Ginny’s current roster. McDivots, a man with a professional interest in ownership records, has lost the deed.'
 ],ginny.wins+'–'+ginny.losses+' RECORD');
 if(ginny&&taylorOwner===4)push('THE BASEMENT REPORT','Ginny Has Jonathan Taylor and a Two-Win Nightmare','A talented player, a brutal record and a schedule that refuses to cooperate.','GINNY / MCDIVOTS','roast',[
 'Ryan McGinnis spends his professional life researching land ownership. We recommend he begin with the ownership rights to the bottom of the fantasy standings.',
 'The latest ESPN roster confirms Jonathan Taylor is still on Ginny’s team. The Ginster is '+ginny.wins+'–'+ginny.losses+' despite averaging '+N(ginny.averagePoints)+' points per game.',
 'His luck index is '+N(ginny.luck)+'. The schedule has not been kind, but the Baby Bar Crawl committee does not accept that as a legal defense.',
 'The league acknowledges the injustice and also finds it incredibly funny. The milk is chilling.'
 ],ginny.wins+'–'+ginny.losses+' RECORD');
 if(bottom&&!out.some(a=>a.subject.startsWith(manager[bottom.id].toUpperCase())))push('BABY BAR CRAWL','The Diaper Watch Has a New Headline','The last-place race is not an abstract statistic. It is a public wardrobe crisis.','THE LEAGUE / PUNISHMENT WATCH','roast',[
 manager[bottom.id]+' is currently '+bottom.wins+'–'+bottom.losses+' and at the bottom of the league table. The standings are not final, but the pressure is real.',
 'The last-place manager faces the Baby Bar Crawl: dressing as a baby and ordering milk while the rest of the league watches. This is the kind of institutional tradition that makes fantasy football a deeply unserious activity practiced with terrifying seriousness.',
 'There is still time to escape. But every week without a win brings the diaper aisle closer. This newsroom will report the outcome when the season actually ends, not before.'
 ],bottom.wins+'–'+bottom.losses+' CURRENTLY');
 return out.sort((a,b)=>(a.tag.startsWith('BREAKING')?-2:0)-(b.tag.startsWith('BREAKING')?-2:0)).slice(0,5);
}
function init(d){
 const updated=Date.parse(d.updatedAt||'');const stale=!Number.isFinite(updated)||Date.now()-updated>36*60*60*1000;const stories=stale?[]:articles(d);
 const old=document.getElementById('sfsn-newsroom');if(old)old.style.display='none';
 const main=document.querySelector('main');if(!main)return;
 const root=document.createElement('section');root.id='sfsn-paper';if(!stories.length){root.innerHTML='<div class="paper-heading"><div><span>THE SUNDAY FUNDAY TIMES</span><h2>NEWSROOM AWAITING FRESH DATA.</h2></div></div><p class="paper-footer">The latest ESPN sync is over 36 hours old or unavailable. We will not publish outdated articles as breaking news.</p>';main.insertBefore(root,main.firstChild);return;}
 const card=(s,i)=>'<button class="paper-story '+(i===0?'paper-lead':'')+'" data-paper-open="'+i+'"><span class="paper-tag">'+E(s.tag)+'</span><span class="paper-title">'+E(s.title)+'</span><span class="paper-dek">'+E(s.dek)+'</span><span class="paper-byline">'+E(s.subject)+' · '+E(s.stat)+' · READ FULL STORY →</span></button>';
 root.innerHTML='<div class="paper-heading"><div><span>THE SUNDAY FUNDAY TIMES</span><h2>THE FRONT PAGE.</h2></div><p>The biggest verified stories.<br>Full-length reporting. Merciless editorial opinion.<br>ESPN-backed numbers.<br>Roster as of week '+E(d.currentRosterAsOfWeek||'unverified')+' · Synced '+E(new Date(d.updatedAt).toLocaleString())+'</p></div><div class="paper-grid">'+stories.map(card).join('')+'</div><div class="paper-footer">ALL STORIES ARE SATIRE. STATS REFLECT COMPLETED ESPN WEEKS. NO FAKE TRANSACTIONS OR INJURY REPORTS.</div><div class="paper-reader" id="paper-reader" hidden><div class="paper-reader-backdrop" data-paper-close></div><article class="paper-sheet" role="dialog" aria-modal="true" aria-label="Full newspaper story"><button class="paper-close" data-paper-close aria-label="Close article">✕ CLOSE</button><div id="paper-article"></div></article></div>';
 main.insertBefore(root,main.firstChild);
 const reader=root.querySelector('#paper-reader'),content=root.querySelector('#paper-article');let lastFocus=null;
 function close(){reader.hidden=true;document.body.classList.remove('paper-reading');lastFocus?.focus();}
 root.querySelectorAll('[data-paper-open]').forEach(b=>b.addEventListener('click',()=>{const s=stories[Number(b.dataset.paperOpen)];lastFocus=b;content.innerHTML='<div class="paper-article-brand">SFSN <span>THE SUNDAY FUNDAY TIMES</span></div><div class="paper-article-tag">'+E(s.tag)+' · '+E(s.subject)+'</div><h1>'+E(s.title)+'</h1><p class="paper-article-dek">'+E(s.dek)+'</p><div class="paper-article-meta">BY THE SFSN INVESTIGATIONS DESK · 2026 SEASON · '+E(s.stat)+'</div>'+s.paragraphs.map((p,i)=>'<p'+(i===0?' class="paper-first"':'')+'>'+E(p)+'</p>').join('')+'<div class="paper-end">◆ &nbsp; END OF REPORT &nbsp; ◆<small>Fantasy satire · verified completed-week statistics</small></div>';reader.hidden=false;document.body.classList.add('paper-reading');reader.querySelector('.paper-close').focus();}));
 root.querySelectorAll('[data-paper-close]').forEach(b=>b.addEventListener('click',close));
 document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!reader.hidden)close();});
}
async function start(){try{const r=await fetch('./data/league.json?paper='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('No data');const d=await r.json();if(d.teams?.length)init(d);}catch(err){/* Original newsroom stays visible. */}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();