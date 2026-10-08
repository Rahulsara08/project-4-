/* RSVP: accepting sets off a burst of rose petals, marigolds, jasmine, leaves and gold sparkles */
(function(){
  var btn=document.getElementById('p6yes'),fx=document.getElementById('p6fx'),th=document.getElementById('p6thanks'),sec=document.getElementById('pg6');if(!btn)return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,KINDS=['rose','rose','mari','mari','leaf','jas','gold'];
  function burst(n){
    if(reduce)return;
    var sr=sec.getBoundingClientRect(),br=btn.getBoundingClientRect(),cx=br.left+br.width/2-sr.left,cy=br.top+br.height/2-sr.top;
    for(var i=0;i<n;i++){
      var e=document.createElement('i'),k=KINDS[i%KINDS.length],a=Math.random()*Math.PI*2,r=80+Math.random()*Math.min(520,sr.width*.55);
      e.className='p6-p '+k;
      e.style.cssText='--x:'+cx+'px;--y:'+cy+'px;--s:'+(9+Math.random()*14).toFixed(1)+'px;--d:'+(2.6+Math.random()*2.2).toFixed(2)+'s;'+
        '--bx:'+(Math.cos(a)*r).toFixed(0)+'px;--by:'+(Math.sin(a)*r*.75-60).toFixed(0)+'px;--dx:'+(Math.random()*120-60).toFixed(0)+'px;'+
        '--fall:'+(260+Math.random()*420).toFixed(0)+'px;--r1:'+(Math.random()*360).toFixed(0)+'deg;--r2:'+(360+Math.random()*540).toFixed(0)+'deg';
      e.addEventListener('animationend',function(){this.remove()});
      fx.appendChild(e);
    }
  }
  function rain(n){            // petals falling from the garlands at the top
    if(reduce)return;
    var w=sec.clientWidth;
    for(var i=0;i<n;i++){
      var e=document.createElement('i'),k=KINDS[i%KINDS.length];e.className='p6-p '+k;
      e.style.cssText='--x:'+(Math.random()*w).toFixed(0)+'px;--y:-20px;--s:'+(8+Math.random()*12).toFixed(1)+'px;--d:'+(4+Math.random()*3).toFixed(2)+'s;animation-delay:'+(Math.random()*1.8).toFixed(2)+'s;'+
        '--bx:0px;--by:'+(sec.clientHeight*.3).toFixed(0)+'px;--dx:'+(Math.random()*160-80).toFixed(0)+'px;--fall:'+(sec.clientHeight*.75).toFixed(0)+'px;--r1:'+(Math.random()*360).toFixed(0)+'deg;--r2:'+(400+Math.random()*500).toFixed(0)+'deg';
      e.addEventListener('animationend',function(){this.remove()});fx.appendChild(e);
    }
  }
  function accepted(first){
    btn.classList.add('done');btn.disabled=true;btn.firstChild.textContent='Accepted with Joy ✓';
    th.textContent='Thank you! We can\u2019t wait to celebrate with you.';th.classList.add('in');
    if(first){burst(90);setTimeout(function(){rain(70)},350);setTimeout(function(){burst(50)},900)}
  }
  try{if(localStorage.getItem('sa-rsvp')==='yes')accepted(false)}catch(e){}
  btn.addEventListener('click',function(){accepted(true);try{localStorage.setItem('sa-rsvp','yes')}catch(e){}});
})();
