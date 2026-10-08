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
  // share
  var toast;function say(t){if(!toast){toast=document.createElement('div');toast.className='gn-toast';toast.setAttribute('role','status');document.body.appendChild(toast)}
    toast.textContent=t;toast.classList.add('in');clearTimeout(toast._t);toast._t=setTimeout(function(){toast.classList.remove('in')},2200)}
  var sb=document.getElementById('shareBtn');
  if(sb)sb.addEventListener('click',function(){
    var data={title:'Shubh weds Ayushi',text:'You are invited to the wedding of Shubh & Ayushi · 9–12 December 2026 · Jaipur',url:location.href.split('#')[0]};
    if(navigator.share){navigator.share(data).catch(function(){});return}
    var t=data.text+'\n'+data.url;
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){say('Invitation link copied')},function(){say(data.url)});
    else{var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');say('Invitation link copied')}catch(e){say(data.url)}ta.remove()}
  });
})();
