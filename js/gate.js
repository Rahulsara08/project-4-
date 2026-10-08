(function(){
  var $=function(i){return document.getElementById(i)};
  var track=$('gtrack'),gate=$('gate'),gstage=$('gstage'),gnote=$('gnote');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AR=1075/806,MINH=1.4,OV=76; // image aspect, min image height (viewports), px the gate stacks onto the road (~2cm)
  var FY=.051,sl=[].slice.call(gstage.querySelectorAll('.sl')),seen=false,shown=false; // finial line (fraction of gate height) that Shubh / Laabh sit on
  var cur=0,qCur=1,qTarget=1,last=0,running=false;
  function cl(x){return Math.min(1,Math.max(0,x))}
  function es(t){return t*t*(3-2*t)}
  function layout(){
    var vh=innerHeight,w=innerWidth*1.375,nh=w*AR;
    gate.style.setProperty('--nh',nh.toFixed(1)+'px');
    var need=gnote?nh*.2+gnote.offsetHeight+nh*.24:0;   // the gate grows (pillars stretch) to hold the invitation
    var h=Math.max(nh,MINH*vh,need);
    gate.style.height=h+'px';
    var th=0;sl.forEach(function(e){th=Math.max(th,e.offsetHeight)});
    gstage.style.setProperty('--slt',(nh*FY).toFixed(1)+'px');
    var room=Math.max(0,th+10+OV-nh*FY);                     // just enough free space for Shubh / Laabh under the road
    track.style.marginTop=(room-OV)+'px';
  }
  function read(){
    var vh=innerHeight,g=track.getBoundingClientRect().top;
    qTarget=es(cl((g-vh*.45)/(vh*.55)));              // 1 = still below the screen, 0 = docked on the road
  }
  function render(){
    gate.style.transform='translate3d(-50%,'+(qCur*innerHeight*.22).toFixed(2)+'px,0)';
    maybeShow();
  }
  function loop(now){
    var dt=Math.min(.05,(now-last)/1000||.016);last=now;
    qCur+=(qTarget-qCur)*(1-Math.exp(-dt*10));
    if(Math.abs(qTarget-qCur)<.001)qCur=qTarget;
    render();
    if(qCur!==qTarget)requestAnimationFrame(loop);else running=false;
  }
  function kick(){read();if(reduce){qCur=qTarget;render();return}if(!running){running=true;last=performance.now();requestAnimationFrame(loop)}}
  var lw2=0,lh2=0;
  addEventListener('scroll',kick,{passive:true});
  addEventListener('resize',function(){if(innerWidth===lw2&&innerHeight===lh2)return;lw2=innerWidth;lh2=innerHeight;layout();kick()});
  addEventListener('load',function(){layout();kick()});
  lw2=innerWidth;lh2=innerHeight;
  layout();read();qCur=qTarget;render();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){layout();kick()});
  // Shubh / Laabh: a plain fade-in (no movement) once they are on screen and the gate has settled under them, then stay
  function maybeShow(){if(shown||!seen)return;shown=true;sl.forEach(function(e){e.classList.add('in')})}
  if(reduce||!('IntersectionObserver' in window)){seen=true;qCur=0;maybeShow()}
  else{var io=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting})){seen=true;io.disconnect();maybeShow()}},{threshold:.25});sl.forEach(function(e){io.observe(e)})}
})();
