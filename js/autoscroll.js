/* 3 s after the opening hands over, page 1 scrolls slowly by itself (Hawa Mahal rises) down to the invitation.
   Any touch, wheel, key or click stops it at once, so the guest is always in control. */
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||/op-skip|op-seek/.test(location.hash))return;
  var started=false,stop=false,raf=0;
  function cancel(){stop=true;if(raf)cancelAnimationFrame(raf);off()}
  var EV=['wheel','touchstart','pointerdown','keydown'];
  function on(){EV.forEach(function(e){addEventListener(e,cancel,{passive:true})})}
  function off(){EV.forEach(function(e){removeEventListener(e,cancel,{passive:true})})}
  function run(){
    if(started||stop)return;started=true;
    var gate=document.getElementById('p2');if(!gate)return;
    var from=scrollY,to=gate.offsetTop,dist=to-from;if(dist<40)return;
    var dur=Math.min(16000,Math.max(6000,dist/110*1000)),t0=performance.now();
    on();
    function step(now){
      if(stop)return;
      var k=Math.min(1,(now-t0)/dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      scrollTo(0,from+dist*e);
      if(k<1)raf=requestAnimationFrame(step);else off();
    }
    raf=requestAnimationFrame(step);
  }
  function later(){setTimeout(run,3000)}
  if(window.__opDone)later();else document.addEventListener('opening:done',later,{once:true});
})();
