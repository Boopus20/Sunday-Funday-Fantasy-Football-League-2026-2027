/* Independent editorial presentation; no changes to legacy analytics functions. */
(function(){
'use strict';
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number.isFinite(+n)?Number(n).toFixed(1):'—';
const LORE=[
{key:'Cole',tag:'THE GIBBS MERCHANT',title:'Cole’s offense is a one-man Gibbs appreciation society',copy:'The man has built a brand around one running back. The next question is how much of the actual scoring comes from Gibbs versus everybody else.'},
{key:'Luke',tag:'THE GLAZE FACTORY',title:'Luke’s receiver room deserves its own velvet rope',copy:'The league can argue about records all it wants. If Luke’s starting receivers are actually dominating, the data will get the last word.'},
{key:'Mike',tag:'TRADE TRIBUNAL',title:'Mike’s Jonathan Taylor bet goes on trial',copy:'Taylor staying in Indianapolis changes the trade narrative. Whether Mike actually lost value depends on the players exchanged and their production since the deal.'}
];
function buildStories(d){
const teams=Array.isArray(d?.teams)?d.teams:[];
const name=t=>t?.name||t?.shortName||'Unknown manager';
const sorted=[...teams].sort((a,b)=>(b.wins||0)-(a.wins||0)||(b.pointsFor||0)-(a.pointsFor||0));
const best=sorted[0],worst=sorted.at(-1);
const scoring=[...teams].sort((a,b)=>(b.averagePoints||0)-(a.averagePoints||0))[0];
const stories=[];
if(best)stories.push({tag:'THE LEAGUE LEADER',title:name(best)+' holds the throne. For now.',copy:name(best)+' leads at '+(best.wins??0)+'–'+(best.losses??0)+'. The crown is real. Whether the roster survives the stretch run is another story.',source:'ESPN league snapshot'});
if(scoring)stories.push({tag:'THE GLAZE FACTORY',title:name(scoring)+' owns the scoring crown',copy:'At '+fmt(scoring.averagePoints)+' points per week, '+name(scoring)+' has the most productive offense by average fantasy points.',source:'ESPN league snapshot'});
if(worst&&teams.length>1)stories.push({tag:'BABY BAR CRAWL WATCH',title:name(worst)+' is staring directly at the diaper aisle',copy:'Currently last at '+(worst.wins??0)+'–'+(worst.losses??0)+'. The punishment is real; the standings are not final.',source:'ESPN league snapshot'});
for(const l of LORE){const t=teams.find(t=>name(t).toLowerCase().includes(l.key.toLowerCase()));stories.push({...l,source:t?'Manager lore • verify player ownership':'League lore • editorial opinion'});}
return stories;
}
function render(stories,updated){
const main=document.querySelector('main');if(!main)return;
let root=document.getElementById('sfsn-newsroom');
if(!root){root=document.createElement('section');root.id='sfsn-newsroom';main.insertBefore(root,main.firstChild);}
const [lead,...rest]=stories;
root.innerHTML='<div class="sfsn-mast"><strong>SFSN <span> / THE SUNDAY FUNDAY WIRE</span></strong><span>INDEPENDENT FANTASY JOURNALISM • '+escapeHTML(updated)+'</span></div>'+
'<div class="sfsn-hero"><article class="sfsn-feature"><div class="sfsn-kicker">'+escapeHTML(lead.tag)+'</div><h2>'+escapeHTML(lead.title)+'</h2><p>'+escapeHTML(lead.copy)+'</p><div class="sfsn-meta">'+escapeHTML(lead.source)+'</div></article>'+
'<aside class="sfsn-side"><div class="sfsn-kicker">EDITOR’S DESK</div><h3>Every win has a witness. Every loss has receipts.</h3><p>Original weekly reporting, fantasy fraud investigations, player news, and roster breakdowns—grounded in league data, never imaginary statistics.</p><p>Explore the full analytics command center below. All existing tabs remain available.</p></aside></div>'+
'<div class="sfsn-toolbar"><h2>AROUND THE LEAGUE</h2><span class="sfsn-kicker">EDITORIAL BOARD</span></div><div class="sfsn-grid">'+rest.map(s=>'<article class="sfsn-article"><div class="sfsn-kicker">'+escapeHTML(s.tag)+'</div><h3>'+escapeHTML(s.title)+'</h3><p>'+escapeHTML(s.copy)+'</p><div class="sfsn-meta">'+escapeHTML(s.source)+'</div></article>').join('')+'</div>';
}
async function refresh(){
try{const response=await fetch('./data/league.json?editorial='+Date.now(),{cache:'no-store'});if(!response.ok)throw Error('snapshot unavailable');const d=await response.json();if(!Array.isArray(d.teams)||!d.teams.length)throw Error('no teams');render(buildStories(d),d.updatedAt?new Date(d.updatedAt).toLocaleString():'latest snapshot');}
catch(e){render([{tag:'NEWSROOM ONLINE',title:'The league never sleeps.',copy:'The latest verified ESPN snapshot is unavailable. Your existing analytics dashboard remains below; no scores or stories have been fabricated.',source:'Awaiting sync'},...LORE.map(x=>({...x,source:'Editorial angle • unverified'}))],'AWAITING VERIFIED DATA');}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
})();
