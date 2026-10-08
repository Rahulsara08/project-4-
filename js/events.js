(function(){
  var root=document.getElementById('events');if(!root)return;
  var track=document.getElementById('evTrack'),slides=[].slice.call(track.children);
  var n=slides.length,GAP=5500,cur=0,timer=0,resumeT=0,hold=false,visible=true,drag=null;
  // dots under the card
  var dots=document.createElement('div');dots.className='ev-dots';dots.setAttribute('role','tablist');
  slides.forEach(function(s,i){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Show '+(s.getAttribute('aria-label')||('event '+(i+1))));
    b.addEventListener('click',function(){show(i);userStart();userEnd()});dots.appendChild(b)});
  track.parentNode.insertBefore(dots,track.nextSibling);
  function show(i){
    cur=(i+n)%n;
    slides.forEach(function(s,k){var on=k===cur;s.classList.toggle('is-on',on);s.setAttribute('aria-hidden',on?'false':'true')});
    [].forEach.call(dots.children,function(b,k){b.setAttribute('aria-current',k===cur?'true':'false')});
    track.setAttribute('data-on',slides[cur].getAttribute('data-theme')||'');
  }
  function arm(){clearInterval(timer);timer=setInterval(function(){if(hold||!visible||document.hidden)return;show(cur+1)},GAP)}
  function userStart(){hold=true;clearTimeout(resumeT)}
  function userEnd(){clearTimeout(resumeT);resumeT=setTimeout(function(){hold=false;arm()},700)}
  track.addEventListener('mouseenter',userStart);
  track.addEventListener('mouseleave',function(){if(!drag)userEnd()});
  track.addEventListener('focusin',userStart);
  track.addEventListener('focusout',userEnd);
  track.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();show(cur+1)}else if(e.key==='ArrowLeft'){e.preventDefault();show(cur-1)}});
  /* swipe (touch) or drag (mouse): the card does not move, it just fades to the next / previous one */
  track.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;if(e.target.closest('a'))return;drag={x:e.clientX,y:e.clientY};userStart();if(e.pointerType==='mouse')track.classList.add('drag')});
  function endDrag(e){if(!drag)return;var dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag=null;track.classList.remove('drag');
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))show(cur+(dx<0?1:-1));userEnd()}
  track.addEventListener('pointerup',endDrag);track.addEventListener('pointercancel',function(){drag=null;track.classList.remove('drag');userEnd()});
  track.addEventListener('wheel',function(e){if(Math.abs(e.deltaX)>Math.abs(e.deltaY)&&Math.abs(e.deltaX)>20){e.preventDefault();if(!track._wl){track._wl=1;show(cur+(e.deltaX>0?1:-1));setTimeout(function(){track._wl=0},600)}}},{passive:false});
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting},{threshold:.35}).observe(root);
  show(0);arm();
})();
