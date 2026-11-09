/* Sunday Funday: ESPN score integrity desk */
(function(){
  const nav=document.querySelector('.tabs');
  if(!nav)return;
  const button=document.createElement('button');
  button.textContent='Score Audit';
  button.dataset.tab='audit';
  nav.appendChild(button);
  const num=x=>Number.isFinite(Number(x))?Number(x):null;
  const score=x=>x==null?'—':Number(x).toFixed(2);
  const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function audit(){
    const content=document.getElementById('content'),title=document.getElementById('sectionTitle');
    title.textContent='ESPN Score Integrity Desk';
    if(!data?.teams?.length){content.textContent='No ESPN snapshot available to audit.';return;}
    const fixtures=data.fixtures||[],teams=data.teams||[],issues=[],seen=new Set();
    let checked=0;
    const byId=new Map(teams.map(t=>[String(t.id),t]));
    for(const f of fixtures){
      if(!f.completed)continue;
      checked++;
      const key=[f.week,...[f.homeId,f.awayId].map(String).sort()].join(':');
      if(seen.has(key))issues.push(['Duplicate completed fixture','Week '+f.week,key]);
      seen.add(key);
      const home=byId.get(String(f.homeId)),away=byId.get(String(f.awayId));
      if(!home||!away){issues.push(['Missing manager','Week '+f.week,key]);continue;}
      const hw=(home.weeklyScores||[]).find(w=>Number(w.week)===Number(f.week));
      const aw=(away.weeklyScores||[]).find(w=>Number(w.week)===Number(f.week));
      if(!hw||!aw){issues.push(['Missing weekly score','Week '+f.week,home.name+' vs '+away.name]);continue;}
      if(num(hw.opponentId)!=null&&String(hw.opponentId)!==String(away.id))issues.push(['Wrong opponent','Week '+f.week,home.name]);
      if(num(aw.opponentId)!=null&&String(aw.opponentId)!==String(home.id))issues.push(['Wrong opponent','Week '+f.week,away.name]);
      if(num(hw.points)==null||num(aw.points)==null)issues.push(['Non-numeric score','Week '+f.week,home.name+' vs '+away.name]);
      if(num(hw.opponentPoints)!=null&&Math.abs(num(hw.opponentPoints)-num(aw.points))>0.011)issues.push(['Score disagreement','Week '+f.week,home.name+' '+score(hw.opponentPoints)+' vs '+away.name+' '+score(aw.points)]);
      if(num(aw.opponentPoints)!=null&&Math.abs(num(aw.opponentPoints)-num(hw.points))>0.011)issues.push(['Score disagreement','Week '+f.week,away.name+' '+score(aw.opponentPoints)+' vs '+home.name+' '+score(hw.points)]);
    }
    const timestamp=Date.parse(data.updatedAt),age=Number.isFinite(timestamp)?Math.round((Date.now()-timestamp)/60000):null;
    const freshness=age==null?'Unknown':age<0?'Timestamp is in the future':age<60?age+' minutes ago':Math.round(age/60)+' hours ago';
    const status=issues.length?'Review '+issues.length+' data inconsistencies':'No inconsistencies detected in checked fixtures';
    content.innerHTML='<div class="cards" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))"><div class="card"><small>Completed games checked</small><strong>'+checked+'</strong></div><div class="card"><small>Issues found</small><strong>'+issues.length+'</strong></div><div class="card"><small>Last snapshot</small><strong style="font-size:18px">'+safe(freshness)+'</strong></div></div><div class="notice"><b>'+safe(status)+'</b><p>Checks compare completed fixtures with each team’s saved weekly scores. A clean audit does not independently verify ESPN API accuracy or live projections.</p></div>'+(issues.length?'<table><thead><tr><th>Issue</th><th>Week</th><th>Details</th></tr></thead><tbody>'+issues.slice(0,100).map(x=>'<tr>'+x.map(v=>'<td>'+safe(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>':'<p>All available completed matchups passed the cross-team consistency checks.</p>')+'<p class="muted">Live ESPN scores may change until games finalize. Do not include incomplete weeks in season statistics.</p>';
  }
  button.addEventListener('click',()=>{tab='audit';document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===button));audit();});
})();