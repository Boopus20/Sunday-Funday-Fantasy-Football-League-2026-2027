/* Refresh published ESPN scores without reloading the page. The publisher controls actual update frequency. */
(function(){
 let busy=false;
 async function refresh(){
  if(busy||!data?.teams?.length)return;
  busy=true;
  try{
   const response=await fetch('./data/league.json?ts='+Date.now(),{cache:'no-store'});
   if(!response.ok)throw Error('snapshot unavailable');
   const next=await response.json();
   if(!next.teams?.length)return;
   if(next.updatedAt===data.updatedAt&&next.live?.updatedAt===data.live?.updatedAt)return;
   data=next;
   document.getElementById('status').textContent='Updated '+new Date(next.updatedAt).toLocaleString();
   document.getElementById('week').textContent=next.currentWeek??'—';
   document.getElementById('games').textContent=next.completedMatchups??'—';
   if(tab==='matchups'){
    const week=document.getElementById('matchupWeek')?.value;
    const sort=document.getElementById('matchupSort')?.value;
    render();
    if(week&&document.getElementById('matchupWeek')?.querySelector('option[value="'+week+'"]'))document.getElementById('matchupWeek').value=week;
    if(sort)document.getElementById('matchupSort').value=sort;
    renderMatchupCenter();
   }else if(tab!=='audit')render();
  }catch(e){/* Keep last valid snapshot visible during sync errors. */}
  finally{busy=false;}
 }
 setInterval(refresh,60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();