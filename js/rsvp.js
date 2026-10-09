/* RSVP: accepting sends sweet pink and red hearts floating up the page */
(function(){
  var btn=document.getElementById('p6yes'),fx=document.getElementById('p6fx'),th=document.getElementById('p6thanks'),sec=document.getElementById('pg6');if(!btn)return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,KINDS=['a','b','a','b','c'];
  function heart(x,y,size,rise,dur,delay){
    var e=document.createElement('i');e.className='p6-h '+KINDS[Math.floor(Math.random()*KINDS.length)];
    e.style.cssText='--x:'+x.toFixed(0)+'px;--y:'+y.toFixed(0)+'px;--s:'+size.toFixed(1)+'px;--rise:'+rise.toFixed(0)+'px;--d:'+dur.toFixed(2)+'s;--dl:'+delay.toFixed(2)+'s;'+
      '--sx:'+(Math.random()*70-35).toFixed(0)+'px;--g:'+(1+Math.random()*.6).toFixed(2)+';--r0:'+(Math.random()*30-15).toFixed(0)+'deg';
    e.addEventListener('animationend',function(){this.remove()});fx.appendChild(e);
  }
  // hearts grow as they float up from the bottom of the page, and a few pop out of the button
  function hearts(){
    if(reduce)return;
    var w=sec.clientWidth,h=sec.clientHeight,sr=sec.getBoundingClientRect(),br=btn.getBoundingClientRect();
    for(var i=0;i<54;i++){var u=Math.random(),x=w*(.5+(u-.5)*Math.abs(u-.5)*2.2+(Math.random()-.5)*.5);
      heart(Math.max(10,Math.min(w-10,x)),h+20,14+Math.random()*22,h*(.45+Math.random()*.55),3.6+Math.random()*2.6,Math.random()*2.6)}
    var cx=br.left+br.width/2-sr.left,cy=br.top+br.height/2-sr.top;
    for(i=0;i<14;i++)heart(cx+(Math.random()-.5)*br.width,cy,9+Math.random()*10,120+Math.random()*160,1.8+Math.random()*1.2,Math.random()*.4);
  }
  function accepted(first){
    btn.classList.add('done');btn.disabled=true;btn.firstChild.textContent='Accepted with Joy ✓';
    th.textContent='Thank you! We can\u2019t wait to celebrate with you.';th.classList.add('in');
    if(first)hearts();
  }
  try{if(localStorage.getItem('sa-rsvp')==='yes')accepted(false)}catch(e){}
  btn.addEventListener('click',function(){accepted(true);try{localStorage.setItem('sa-rsvp','yes')}catch(e){}});
})();
