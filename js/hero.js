(function(){
  var $=function(i){return document.getElementById(i)};
  var track=$('track'),sky=$('sky'),hawa=$('hawa'),tl=$('tl'),tr=$('tr'),hint=$('hint'),names=document.querySelector('.names');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur=0,target=0,last=0,running=false,T=1,vh=innerHeight;
  function cl(x){return Math.min(1,Math.max(0,x))}
  function es(t){return t*t*(3-2*t)}
  function setVars(){
    var st=document.getElementById('stage'),W=st.clientWidth||innerWidth,H=innerHeight;
    st.style.setProperty('--hw',Math.max(W*1.02,1.3*H)+'px');
    if(hawa.naturalWidth)st.style.setProperty('--har',(hawa.naturalHeight/hawa.naturalWidth*1.18).toFixed(4));
    st.style.setProperty('--th',Math.min(.74*H,1.18*W)+'px');
    st.style.height=H+'px';
  }
  var lw=0,lh=0,rq=0;
  function doRefit(){rq=0;setVars();layout();readTarget();cur=target;render(cur)}
  function refit(){if(rq)return;rq=requestAnimationFrame(doRefit)}
  function onSize(){if(innerWidth!==lw||innerHeight!==lh){lw=innerWidth;lh=innerHeight;refit()}}
  function layout(){
    vh=innerHeight;
    var H=hawa.offsetHeight||vh*1.5;
    T=Math.max(1,H-0.4*vh-3);                          // distance the building travels = scroll distance (1:1)
    track.style.height=(vh+T)+'px';
  }
  function readTarget(){
    var s=scrollY-track.offsetTop;
    target=reduce?T:Math.min(T,Math.max(0,s));      // clamp: building stops (is fixed) once fully scrolled
  }
  function render(s){
    var H=hawa.offsetHeight||vh*1.5;
    // Hawa Mahal scrolls exactly with the page, then holds at the bottom
    hawa.style.transform='translate3d(0,'+(vh*0.6-s).toFixed(2)+'px,0)';
    // trees: slide in from the left and right at the bottom of Hawa Mahal, complete at the end
    var e=es(cl((s-0.4*T)/(0.55*T)));
    tl.style.transform='translate3d('+(-(1-e)*105).toFixed(2)+'%,0,0)';
    tr.style.transform='translate3d('+((1-e)*105).toFixed(2)+'%,0,0)';
    sky.style.transform='translate3d(0,'+(-(s/T)*12).toFixed(2)+'%,0)';
    // text slides down with the scroll and disappears behind the building (no blur / fade)
    names.style.transform='translate3d(0,'+Math.min(s*0.6,vh).toFixed(2)+'px,0)';
    hint.style.opacity=cl(1-s/(vh*0.15));
  }
  function loop(now){
    var dt=Math.min(0.05,(now-last)/1000||0.016);last=now;
    cur+=(target-cur)*(1-Math.exp(-dt*14));
    if(Math.abs(target-cur)<0.3)cur=target;
    render(cur);
    if(cur!==target)requestAnimationFrame(loop);else running=false;
  }
  function kick(){readTarget();if(!running){running=true;last=performance.now();requestAnimationFrame(loop)}}
  addEventListener('scroll',kick,{passive:true});
  addEventListener('resize',onSize);addEventListener('orientationchange',function(){setTimeout(onSize,120)});
  hawa.addEventListener('load',function(){lw=0;onSize()});
  lw=innerWidth;lh=innerHeight;
  setVars();layout();readTarget();cur=target;render(cur);
})();
