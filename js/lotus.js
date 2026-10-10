/* Family page: the golden lotus plants grow out of the frame's borders as the page scrolls (the scroll is not pinned or
   changed). Based on lotus-grow.html: reveal 6% -> 110% from the bottom up, scale 0.92 -> 1, then a gentle sway. */
(function(){
  var plants=[].slice.call(document.querySelectorAll('.p5-plant'));if(!plants.length)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var START_REVEAL=6,MAX_REVEAL=110,START_SCALE=.92;   // tweak: visible at first, fully grown, starting size
  var START=1.0,END=.25;     // tweak: growth starts when a plant's foot is at the bottom of the screen (1.0) and is
                             // complete when the foot has risen to 25% from the top (0.25)
  var imgs=plants.map(function(p){return p.querySelector('img')}),ticking=false;
  function eio(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
  function update(){
    ticking=false;var vh=innerHeight;
    plants.forEach(function(p,i){
      var foot=p.getBoundingClientRect().bottom/vh;
      var k=Math.min(1,Math.max(0,(START-foot)/(START-END)));
      imgs[i].style.setProperty('--reveal',(START_REVEAL+(MAX_REVEAL-START_REVEAL)*eio(k)).toFixed(2));
      p.style.setProperty('--pl-s',(START_SCALE+(1-START_SCALE)*(1-Math.pow(1-k,2))).toFixed(4));
      p.classList.toggle('grown',k>=1);
    });
  }
  function kick(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
  addEventListener('scroll',kick,{passive:true});addEventListener('resize',kick);addEventListener('load',kick);update();
})();
