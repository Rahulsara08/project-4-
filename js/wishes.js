/* Last page: the Wishing Wall. Wish cards slide inside the gold arch on their own (pausing while a guest reads or
   swipes); a guest's own wish joins the wall as a new card. Wishes are kept on the guest's phone (localStorage);
   if WEDDING.wishesUrl is set, they are also shared with everyone through that web address. */
(function(){
  var track=document.getElementById('wlTrack'),form=document.getElementById('wishForm');
  if(!track||!form)return;
  var C=window.WEDDING||{},KEY='sa-wishes',URL_=C.wishesUrl||'';
  var count=document.getElementById('wlCount'),msg=document.getElementById('wfMsg');
  var nameIn=document.getElementById('wfName'),wishIn=document.getElementById('wfWish');
  var prev=track.parentNode.querySelector('.prev'),next=track.parentNode.querySelector('.next');
  var seen={},total=0;

  function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
  function save(list){try{localStorage.setItem(KEY,JSON.stringify(list.slice(-50)))}catch(e){}}
  function clean(s,n){return String(s||'').replace(/\s+/g,' ').trim().slice(0,n)}

  function card(w,isNew){
    var name=clean(w.name,40),wish=clean(w.wish,600),k=name.toLowerCase()+'|'+wish.toLowerCase();
    if(!name||!wish||seen[k])return null;seen[k]=1;
    var el=document.createElement('article');el.className='wc'+(isNew?' new':'');el.setAttribute('aria-label','Wish from '+name);
    var p=document.createElement('p');p.textContent=wish;
    var b=document.createElement('b');b.textContent=name;
    el.appendChild(p);el.appendChild(b);total++;return el;
  }
  function add(w,first,isNew){var el=card(w,isNew);if(!el)return null;if(first)track.insertBefore(el,track.firstChild);else track.appendChild(el);return el}
  function setCount(){if(count)count.textContent=total+(total===1?' wish':' wishes')+'  ·  swipe to read'}

  // guests' own wishes first (newest first), then the family's
  load().slice().reverse().forEach(function(w){add(w)});
  (C.wishes||[]).forEach(function(w){add(w)});
  setCount();

  // shared wall (optional)
  if(URL_&&window.fetch)fetch(URL_).then(function(r){return r.json()}).then(function(list){
    if(!Array.isArray(list))return;list.slice().reverse().forEach(function(w){add(w)});setCount();nav()}).catch(function(){});

  /* ---- sliding ---- */
  function cards(){return track.children}
  function step(){var c=cards();return c.length>1?c[1].offsetLeft-c[0].offsetLeft:track.clientWidth}
  function idx(){return Math.round(track.scrollLeft/Math.max(1,step()))}
  function maxScroll(){return track.scrollWidth-track.clientWidth}
  function go(i){var c=cards();if(!c.length)return;i=Math.max(0,Math.min(c.length-1,i));
    var el=c[i],x=el.offsetLeft-(track.clientWidth-el.offsetWidth)/2;track.scrollTo({left:Math.max(0,Math.min(maxScroll(),x)),behavior:reduce?'auto':'smooth'})}
  function nav(){var m=maxScroll();if(prev)prev.disabled=track.scrollLeft<=4;if(next)next.disabled=track.scrollLeft>=m-4}
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  prev&&prev.addEventListener('click',function(){hold();go(idx()-1)});
  next&&next.addEventListener('click',function(){hold();go(idx()+1)});
  track.addEventListener('scroll',function(){nav()},{passive:true});
  track.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();hold();go(idx()+1)}else if(e.key==='ArrowLeft'){e.preventDefault();hold();go(idx()-1)}});

  // auto-slide: one card every few seconds while the wall is on screen; any touch pauses it for a while
  var visible=false,pausedUntil=0,timer=null;
  function hold(){pausedUntil=Date.now()+7000}
  ['pointerdown','touchstart','wheel','focusin'].forEach(function(t){track.addEventListener(t,hold,{passive:true})});
  track.addEventListener('mouseenter',function(){pausedUntil=Infinity});
  track.addEventListener('mouseleave',function(){pausedUntil=Date.now()+2500});
  function tick(){if(!visible||reduce||document.hidden||Date.now()<pausedUntil)return;
    if(track.scrollLeft>=maxScroll()-4)track.scrollTo({left:0,behavior:'smooth'});else go(idx()+1)}
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting},{threshold:.4}).observe(track);else visible=true;
  timer=setInterval(tick,3600);
  addEventListener('resize',nav);nav();

  /* ---- form ---- */
  var q=new URLSearchParams(location.search),guest=clean(q.get('to')||q.get('guest'),40);
  if(guest&&nameIn&&!nameIn.value)nameIn.value=guest;
  wishIn.addEventListener('input',function(){wishIn.parentNode.classList.remove('err')});
  nameIn.addEventListener('input',function(){nameIn.parentNode.classList.remove('err')});
  function say(t,bad){msg.textContent=t;msg.classList.toggle('bad',!!bad)}

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var w={name:clean(nameIn.value,40),wish:clean(wishIn.value,600)};
    nameIn.parentNode.classList.toggle('err',!w.name);wishIn.parentNode.classList.toggle('err',w.wish.length<2);
    if(!w.name){say('Please write your name.',1);nameIn.focus();return}
    if(w.wish.length<2){say('Please write your wish.',1);wishIn.focus();return}
    var el=add(w,true,true);
    if(!el){say('This wish is already on the wall. Thank you!');return}
    var list=load();list.push({name:w.name,wish:w.wish,t:Date.now()});save(list);
    setCount();wishIn.value='';hold();
    track.scrollTo({left:0,behavior:reduce?'auto':'smooth'});
    say('Thank you, '+w.name+'! Your blessing is on the wall.');
    if(URL_&&window.fetch)fetch(URL_,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(w)}).catch(function(){});
  });
})();
