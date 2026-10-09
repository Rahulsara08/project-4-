/* Last pages: the Venue, Save the Date (Add to Calendar) and Replay Invitation, filled from js/config.js */
(function(){
  var C=window.WEDDING||{},d=new Date(C.target||'2026-12-11T21:00:00+05:30'),venue=C.venue||'',city=C.city||'';
  function set(k,v){[].forEach.call(document.querySelectorAll('[data-w="'+k+'"]'),function(e){e.textContent=v})}
  var tz={timeZone:'Asia/Kolkata'};function f(o){return d.toLocaleString('en-GB',Object.assign(o,tz))}
  var day=f({weekday:'long'}),time=f({hour:'numeric',minute:'2-digit',hour12:true}).toUpperCase();
  if(venue)set('venue',venue);if(city)set('city',city);
  set('when','Phere \u00b7 '+day+', '+f({day:'numeric',month:'long',year:'numeric'})+' \u00b7 '+time);
  set('date',f({day:'2-digit'})+' \u00b7 '+f({month:'2-digit'})+' \u00b7 '+f({year:'numeric'}));
  set('day',day+' \u00b7 '+(city.split(',')[0]||''));
  var place=encodeURIComponent(venue+(city?', '+city:''));
  var map=document.getElementById('p8map');if(map&&venue)map.href='https://www.google.com/maps/search/?api=1&query='+place;
  function utc(x){return x.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}
  var cal=document.getElementById('p8cal');
  if(cal)cal.href='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent('Shubh weds Ayushi \u2013 Wedding')+
    '&dates='+utc(d)+'/'+utc(new Date(d.getTime()+4*3600e3))+'&location='+place+
    '&details='+encodeURIComponent('With the blessings of our families, we invite you to celebrate with us. '+location.href.split('#')[0]);
  // contacts: name, role, number and a Call button that dials it
  var box=document.getElementById('p8people');
  if(box)(C.contacts||[]).forEach(function(c,i){
    var tel=String(c.phone||'').replace(/[^\d+]/g,'');if(!tel)return;
    var d=document.createElement('div');d.className='p8-person rv';d.style.transitionDelay=(i*.15)+'s';
    var b=document.createElement('b');b.textContent=c.name||'';
    var r=document.createElement('small');r.textContent=c.role||'';
    var n=document.createElement('span');n.className='num';n.textContent=c.phone;
    var a=document.createElement('a');a.className='p8-call';a.href='tel:'+tel;a.setAttribute('aria-label','Call '+(c.name||c.phone));
    a.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg><span>Call</span>';
    d.appendChild(b);d.appendChild(r);d.appendChild(n);d.appendChild(a);box.appendChild(d);
    if(window.revealAdd)revealAdd(d);
  });
  // replay: back to the top and the opening plays again
  var rp=document.getElementById('p8replay');
  if(rp)rp.addEventListener('click',function(){scrollTo(0,0);location.replace(location.pathname+location.search)});
})();
