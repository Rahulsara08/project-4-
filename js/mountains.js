/* Amer Fort section: the layers wait below the ground and, the first time the section's top passes 70% of the screen
   (or the whole section is in view - on tall phones it sits at the very end of the page and its top may never get that
   high), rise one after another (timings and order in css/garden.css). Plays once; scrolling back does not replay it.
   With reduced motion everything simply shows in place. */
(function(){
  var sec=document.getElementById('pg9');if(!sec)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  sec.classList.add('mt-wait');
  var played=false;
  function check(){
    if(played)return;
    var r=sec.getBoundingClientRect(),vh=innerHeight;
    if(r.top<vh*.7||(r.top<vh&&r.bottom<=vh+2))play();
  }
  function play(){
    played=true;removeEventListener('scroll',check);removeEventListener('resize',check);
    sec.classList.add('mt-play');                       // give the layers their transitions first...
    setTimeout(function(){sec.classList.remove('mt-wait')},30);   // ...then let them rise
    var last=sec.querySelector('.m-g1'),t;
    function done(e){if(e&&e.target!==last)return;last.removeEventListener('transitionend',done);clearTimeout(t);
      sec.classList.remove('mt-play');if(window.parallaxRefresh)parallaxRefresh()}
    last.addEventListener('transitionend',done);t=setTimeout(done,9000);
  }
  addEventListener('scroll',check,{passive:true});addEventListener('resize',check);check();
})();
