/* Meet the Bride & Groom photo runway (based on the "Work Process" runway): while the page scrolls past this section
   its stage stays on screen, the photos travel from right to left, and a paper plane flies along a smooth
   Catmull-Rom curve that swoops towards each photo, tilting with the curve. Scrolling back up runs it all in reverse
   and the plane turns round. Tap a photo to open it large over a blurred page. No scroll pinning library: the section
   is simply made taller than the screen and the stage is position:sticky, so normal scrolling (and phones) just work. */
(function(){
  var sec=document.getElementById('pgc'),stage=document.getElementById('rwStage'),track=document.getElementById('rwTrack'),
      plane=document.getElementById('rwPlane'),flip=document.getElementById('rwFlip');
  if(!sec||!stage||!track||!plane)return;
  var SPEED=1.15;        // tweak: scrolling needed per pixel of runway travel (bigger = slower)
  var SWOOP=.42;         // tweak: how far the plane swoops towards each photo (share of the photo height)
  var steps=[].slice.call(track.querySelectorAll('.rw-step')),photos=steps.map(function(s){return s.querySelector('.rw-photo')});
  var dist=0,way=[],stageH=0,lastP=-1,dir=1,active=-1,ticking=false;

  function measure(){
    stageH=stage.offsetHeight;
    dist=Math.max(0,track.scrollWidth-innerWidth);
    sec.style.height=(stageH+dist*SPEED)+'px';
    // waypoints in track pixels; y is measured from the gold line (negative = up)
    var cs=getComputedStyle(track),ph=photos[0].offsetHeight,stem=parseFloat(cs.getPropertyValue('--stem'))||24;
    var amp=stem+ph*SWOOP,step=steps.length>1?steps[1].offsetLeft-steps[0].offsetLeft:300;
    way=steps.map(function(s,i){return {x:s.offsetLeft+s.offsetWidth/2,y:i%2===0?-amp:amp}});
    way.unshift({x:way[0].x-step,y:0});                       // enters before the first photo
    way.push({x:way[way.length-1].x+step,y:0});               // and settles after the last
    lastP=-1;update();
  }
  // Catmull-Rom position and tangent angle along the waypoints, t in 0..1
  function flight(t){
    var n=way.length-1,p=Math.max(0,Math.min(1,t))*n,i=Math.min(Math.floor(p),n-1),u=p-i;
    var p0=way[Math.max(0,i-1)],p1=way[i],p2=way[Math.min(n,i+1)],p3=way[Math.min(n,i+2)],u2=u*u,u3=u2*u;
    function c(a,b,cc,d){return .5*(2*b+(-a+cc)*u+(2*a-5*b+4*cc-d)*u2+(-a+3*b-3*cc+d)*u3)}
    function dv(a,b,cc,d){return .5*((-a+cc)+2*(2*a-5*b+4*cc-d)*u+3*(-a+3*b-3*cc+d)*u2)}
    var dx=dv(p0.x,p1.x,p2.x,p3.x),dy=dv(p0.y,p1.y,p2.y,p3.y);
    return {x:c(p0.x,p1.x,p2.x,p3.x),y:c(p0.y,p1.y,p2.y,p3.y),a:Math.atan2(dy,dx)*180/Math.PI};
  }
  function update(){
    ticking=false;
    var range=sec.offsetHeight-stageH,p=range>0?Math.max(0,Math.min(1,(scrollY-sec.offsetTop)/range)):0;
    track.style.transform='translate3d('+(-p*dist).toFixed(1)+'px,0,0)';
    var f=flight(p);
    plane.style.transform='translate3d('+f.x.toFixed(1)+'px,'+f.y.toFixed(1)+'px,0) rotate('+f.a.toFixed(1)+'deg)';
    // turn round when the scrolling changes direction
    if(lastP>=0&&p!==lastP){var d=p<lastP?-1:1;if(d!==dir){dir=d;flip.classList.toggle('back',dir<0)}}
    lastP=p;
    // the photo the plane is passing lights up
    var best=-1,bd=1e9;for(var i=1;i<way.length-1;i++){var dd=Math.abs(way[i].x-f.x);if(dd<bd){bd=dd;best=i-1}}
    if(best!==active){if(active>=0)steps[active].classList.remove('on');active=best;if(active>=0)steps[active].classList.add('on')}
  }
  function kick(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
  addEventListener('scroll',kick,{passive:true});
  var rt=0;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(measure,120)});
  addEventListener('load',measure);
  photos.forEach(function(ph){var im=ph.querySelector('img');if(!im.complete)im.addEventListener('load',function(){kick()},{once:true})});
  measure();

  // ---- tap to view ----
  var lb=document.getElementById('rwLb'),lbImg=document.getElementById('rwLbImg'),root=document.documentElement,opener=null;
  if(!lb)return;
  document.body.appendChild(lb);                        // outside the section, so its clipping cannot cut the full-screen view
  function open(btn){
    var im=btn.querySelector('img');opener=btn;lbImg.src=im.currentSrc||im.src;lbImg.alt=im.alt;
    lb.hidden=false;root.classList.add('rw-lock');requestAnimationFrame(function(){lb.classList.add('in')});lb.focus&&lb.setAttribute('tabindex','-1');lb.focus();
  }
  function close(){
    if(lb.hidden)return;lb.classList.remove('in');root.classList.remove('rw-lock');
    setTimeout(function(){lb.hidden=true},350);if(opener)opener.focus({preventScroll:true});
  }
  photos.forEach(function(btn){btn.addEventListener('click',function(){open(btn)})});
  lb.addEventListener('click',close);
  addEventListener('keydown',function(e){if(e.key==='Escape')close()});
})();
