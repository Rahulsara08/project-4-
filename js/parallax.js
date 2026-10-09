/* Parallax for every page: [data-par="k"] moves by k x its distance from the screen centre (negative = drifts slower,
   further back; it uses the CSS translate property, so it adds to any animation the element already has);
   [data-par-bg="k"] scrolls a page's patterned background at a different speed, so the frames and text stay put
   while the paper or paisley behind them moves. Layout is measured once and on resize, then only read from cache. */
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var items=[],ticking=false;
  function measure(){
    items=[].map.call(document.querySelectorAll('[data-par],[data-par-bg]'),function(el){
      var bg=el.hasAttribute('data-par-bg');if(!bg)el.style.translate='';
      var r=el.getBoundingClientRect();
      return {el:el,bg:bg,k:parseFloat(el.getAttribute(bg?'data-par-bg':'data-par'))||0,top:r.top+scrollY,h:r.height};
    });
    update();
  }
  function update(){
    ticking=false;
    var sy=scrollY,vh=innerHeight,mid=sy+vh/2;
    for(var i=0;i<items.length;i++){var it=items[i];
      if(it.top+it.h<sy-vh||it.top>sy+vh*2)continue;            // far off screen: leave it
      if(it.bg){var d=sy-it.top;it.el.style.backgroundPositionY=(d*-it.k).toFixed(1)+'px'}
      else it.el.style.translate='0 '+((it.top+it.h/2-mid)*it.k).toFixed(1)+'px';
    }
  }
  function kick(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
  addEventListener('scroll',kick,{passive:true});
  var rt=0;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(measure,150)});
  addEventListener('load',function(){measure();setTimeout(measure,1200)});
  measure();
  window.parallaxRefresh=measure;
})();
