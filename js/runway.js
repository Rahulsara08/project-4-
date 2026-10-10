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
  var notes=[].slice.call(track.querySelectorAll('.rw-note')),qStart=document.getElementById('rqStart'),qEnd=document.getElementById('rqEnd'),lotus=qEnd?[].slice.call(qEnd.querySelectorAll('.rq-lotus')):[];
  var line=track.querySelector('.rw-line'),dist=0,way=[],stageH=0,lastP=-1,dir=1,active=-1,ticking=false,cur=-1;

  function measure(){
    stageH=stage.offsetHeight;
    dist=Math.max(0,track.scrollWidth-innerWidth);
    sec.style.height=(stageH+dist*SPEED)+'px';
    // waypoints in track pixels; y is measured from the gold line (negative = up)
    var cs=getComputedStyle(track),ph=photos[1].offsetHeight,stem=parseFloat(cs.getPropertyValue('--stem'))||24;
    var amp=stem+ph*SWOOP;
    // the plane starts just after the first photo, swoops past each photo in between, and lands just before the last
    var first=steps[0],last=steps[steps.length-1],gap=parseFloat(cs.getPropertyValue('--gap'))||60;
    var x0=first.offsetLeft+first.offsetWidth/2,x1=last.offsetLeft+last.offsetWidth/2;
    var cap=first.querySelector('.rw-photo').offsetWidth/2+gap*.35;
    // the plane takes off from the opening "Jaipur", passes the first photo, swoops past each photo, passes the last
    // photo and lands on the closing "Jaipur" (way[i].s = the photo it belongs to)
    var tr=track.getBoundingClientRect(),mid=track.offsetHeight/2;
    function at(el,side){if(!el)return null;var r=el.getBoundingClientRect();return {x:r.left-tr.left+r.width/2+side*r.width/2,y:r.top-tr.top+r.height/2-mid,s:-1}}
    way=[];var a0=at(qStart&&qStart.querySelector('.rq-logo'),1);if(a0)way.push(a0);
    way.push({x:x0+cap,y:0,s:-1});
    steps.slice(1,-1).forEach(function(s,i){way.push({x:s.offsetLeft+s.offsetWidth/2,y:s.classList.contains('up')?-amp:amp,s:i+1})});
    way.push({x:x1-cap,y:0,s:-1});
    var a1=at(qEnd&&qEnd.querySelector('.rq-logo'),-1);if(a1)way.push(a1);
    line.style.left=x0+'px';line.style.width=(x1-x0)+'px';  // the gold line from the first photo to the last
    lastP=-1;cur=-1;update();
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
  function secOn(){var r=sec.getBoundingClientRect();return r.top<innerHeight*.6&&r.bottom>innerHeight*.4}
  function target(){var range=sec.offsetHeight-stageH;return range>0?Math.max(0,Math.min(1,(scrollY-sec.offsetTop)/range)):0}
  var lastT=0;
  function update(now){
    var t=target(),dt=Math.min(.05,((now||performance.now())-lastT)/1000||.016);lastT=now||performance.now();
    cur=cur<0?t:cur+(t-cur)*(1-Math.exp(-dt*9));             // tweak: 9 = how quickly it catches up (higher = snappier)
    if(Math.abs(t-cur)<.0004)cur=t;
    var p=cur;
    track.style.transform='translate3d('+(-p*dist).toFixed(1)+'px,0,0)';
    var f=flight(p);
    plane.style.transform='translate3d('+f.x.toFixed(1)+'px,'+f.y.toFixed(1)+'px,0) rotate('+f.a.toFixed(1)+'deg)';
    // turn round when the scrolling changes direction
    if(lastP>=0&&p!==lastP){var d=p<lastP?-1:1;if(d!==dir){dir=d;flip.classList.toggle('back',dir<0)}}
    lastP=p;
    // the photo the plane is passing lights up
    var best=-1,bd=1e9;for(var i=0;i<way.length;i++){if(way[i].s<0)continue;var dd=Math.abs(way[i].x-f.x);if(dd<bd){bd=dd;best=way[i].s}}
    if(best!==active){if(active>=0)steps[active].classList.remove('on');active=best;if(active>=0)steps[active].classList.add('on')}
    // the quotes: each comes in as it is on screen; the closing quote's lotus grows over the last part of the runway
    var vw=innerWidth;
    [qStart,qEnd].forEach(function(q){if(!q)return;var r=q.getBoundingClientRect(),vis=r.right>vw*.12&&r.left<vw*.88&&secOn();
      if(vis&&!q.classList.contains('in')){q.classList.add('in');setTimeout(measure,1300)}});   // re-aim the plane once the logo has settled
    notes.forEach(function(n){if(n.classList.contains('in'))return;var r=n.getBoundingClientRect();if(r.right>vw*.1&&r.left<vw*.9&&secOn())n.classList.add('in')});
    if(lotus.length&&qEnd){var r=qEnd.getBoundingClientRect(),k=Math.max(0,Math.min(1,(vw-r.left)/Math.max(1,r.width)));k=k*k*(3-2*k);
      lotus.forEach(function(l){l.style.setProperty('--reveal',(6+104*k).toFixed(1));l.style.setProperty('--ls',(.92+.08*k).toFixed(3));l.classList.toggle('grown',k>=.999)})}
    if(cur!==t)requestAnimationFrame(update);else ticking=false;
  }
  function kick(){if(!ticking){ticking=true;lastT=performance.now();requestAnimationFrame(update)}}
  addEventListener('scroll',kick,{passive:true});
  var rt=0;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(measure,120)});
  addEventListener('load',measure);
  [].forEach.call(document.querySelectorAll('#pgc .rq-logo'),function(im){if(!im.complete)im.addEventListener('load',measure,{once:true})});
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
