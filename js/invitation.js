/* page 2: guest name from the link (?to=Name), countdown, directions and share */
(function(){
  var C=window.WEDDING||{guestDefault:'Family & Friends',target:'2026-12-11T21:00:00+05:30',venue:'Mandap Lawn',city:'Jaipur, Rajasthan'};
  var q=new URLSearchParams(location.search),g=(q.get('to')||q.get('guest')||'').replace(/[<>]/g,'').trim();
  [].forEach.call(document.querySelectorAll('.guest-name'),function(e){e.textContent=g||C.guestDefault});
  var vn=document.getElementById('venueName'),vc=document.getElementById('venueCity'),mp=document.getElementById('venueMap');
  if(vn)vn.textContent=C.venue;if(vc)vc.textContent=C.city;
  if(mp)mp.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(C.venue+', '+C.city);
  // countdown
  var T=new Date(C.target).getTime(),els={};
  [].forEach.call(document.querySelectorAll('.gn-tiles b[data-k]'),function(b){els[b.getAttribute('data-k')]=b});
  function pad(n){return n<10?'0'+n:''+n}
  function set(k,v){var b=els[k];if(!b||b.textContent===v)return;b.textContent=v;b.classList.remove('gn-tick');void b.offsetWidth;b.classList.add('gn-tick')}
  function tick(){var ms=Math.max(0,T-Date.now()),s=Math.floor(ms/1000);
    set('d',pad(Math.floor(s/86400)));set('h',pad(Math.floor(s%86400/3600)));set('m',pad(Math.floor(s%3600/60)));set('s',pad(s%60));
    if(!ms){var n=document.getElementById('cdNote');if(n)n.textContent='The celebrations have begun!'}}
  tick();setInterval(tick,1000);
})();
