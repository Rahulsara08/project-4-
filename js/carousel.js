/* Meet the Bride & Groom photo carousel: the middle photo at 95%, the others at 85%; moves on its own every 5 s
   (only while on screen), follows a drag or swipe (drag 50 px to change photo), and has a row of thumbnails. */
(function(){
  var root=document.getElementById('tc'),strip=document.getElementById('tcStrip'),dotsBox=document.getElementById('tcDots');
  if(!root||!strip)return;
  var AUTO_DELAY=5000,DRAG_BUFFER=50;                       // tweak: time between slides, drag distance
  var slides=[].slice.call(strip.children),n=slides.length,idx=0,dragX=0,start=null,visible=false,timer=0;
  // thumbnails of every photo under the carousel; tap one to jump to it
  var dots=slides.map(function(sl,i){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Go to photo '+(i+1));
    var im=document.createElement('img');im.src=sl.querySelector('img').getAttribute('src');im.alt='';im.loading='lazy';im.decoding='async';im.draggable=false;b.appendChild(im);
    b.addEventListener('click',function(){go(i);restart()});dotsBox.appendChild(b);return b});
  function render(){
    strip.style.transform='translateX(calc('+(-idx*100)+'% + '+dragX+'px))';
    slides.forEach(function(s,i){s.classList.toggle('on',i===idx);s.setAttribute('aria-hidden',i===idx?'false':'true')});
    dots.forEach(function(d,i){d.classList.toggle('on',i===idx)});
  }
  function go(i){idx=(i+n)%n;render()}
  function restart(){clearInterval(timer);timer=setInterval(function(){if(visible&&!start&&!document.hidden)go(idx+1)},AUTO_DELAY)}
  strip.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;start={x:e.clientX,y:e.clientY,id:e.pointerId,h:null}});
  addEventListener('pointermove',function(e){
    if(!start||e.pointerId!==start.id)return;
    var dx=e.clientX-start.x,dy=e.clientY-start.y;
    if(start.h===null&&(Math.abs(dx)>6||Math.abs(dy)>6))start.h=Math.abs(dx)>Math.abs(dy);
    if(start.h){dragX=dx;strip.classList.add('dragging');render()}
  });
  function end(){
    if(!start)return;
    if(dragX<=-DRAG_BUFFER&&idx<n-1)idx++;else if(dragX>=DRAG_BUFFER&&idx>0)idx--;
    start=null;dragX=0;strip.classList.remove('dragging');render();restart();
  }
  addEventListener('pointerup',end);addEventListener('pointercancel',end);
  root.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){go(idx+1);restart()}else if(e.key==='ArrowLeft'){go(idx-1);restart()}});
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting},{threshold:.3}).observe(root);else visible=true;
  // the photos load as the section comes near, not with the first page
  render();restart();
})();
