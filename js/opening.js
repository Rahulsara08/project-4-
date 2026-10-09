/* Opening: tap to open the velvet curtains, the stage and its chandelier, the stage curtains part, the velvet backdrop
   with the gold oval, then page 1 rises from the bottom (text first, then Hawa Mahal) and the site scrolls as usual.
   The velvet (folds, sheen, the swagged valance with its gold fringe and tassels) is drawn with WebGL. */
(function(){
  window.__opReady=true;
  var root=document.documentElement,op=document.getElementById('op');
  function finish(){var nm=document.querySelector('.names');if(nm&&op)nm.style.animation='none'; // already brought in; don't replay the CSS fade
    root.classList.remove('op-on','op-lock');if(op&&op.parentNode)op.parentNode.removeChild(op);
    if(window.heroIntro)heroIntro.set({stage:0,names:0,hawa:0,op:1})}
  if(!op){finish();return}
  var $=function(i){return document.getElementById(i)};
  var front=$('opFront'),stage=$('opStage'),fin=$('opFinal'),dim=$('opDim'),black=$('opBlack'),oval=$('opOval'),chF=$('opChandF'),chS=$('opChand');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  scrollTo(0,0);

  /* ---------- velvet shader ---------- */
  var VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS=[
  'precision highp float;',
  'uniform vec2 R;uniform float T,O,N,VAL,FLAT,LIT,SW;',
  'float h2(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
  'vec3 vel(float ph,float amp){',
  ' float h=sin(ph)*.6+sin(ph*2.13+1.3)*.24+sin(ph*.53+.4)*.16;',
  ' float d=cos(ph)*.6+.5112*cos(ph*2.13+1.3)+.0848*cos(ph*.53+.4);',
  ' vec3 n=normalize(vec3(-d*amp,0.,1.));',
  ' float dif=max(dot(n,normalize(vec3(.3,-.25,1.))),0.);',
  ' float sh=pow(clamp(1.-n.z,0.,1.),1.2);',
  ' float ao=.22+.78*smoothstep(-1.,.9,h);',
  ' return (vec3(.36,.008,.03)*(.12+1.35*dif*dif)+vec3(1.,.22,.24)*sh*.7)*ao;}',
  'vec3 gold(float t){return mix(vec3(.4,.23,.05),vec3(1.,.87,.52),clamp(t,0.,1.));}',
  'void main(){',
  ' vec2 fc=gl_FragCoord.xy;vec2 uv=fc/R;uv.y=1.-uv.y;float x=uv.x,y=uv.y,asp=R.x/R.y;',
  ' float spot=exp(-(pow((x-.5)*asp,2.)*3.2+pow(y-.5,2.)*2.6));',
  ' float lit=(.3+1.*spot)*LIT*(.55+.45*smoothstep(1.2,.25,length(vec2((x-.5)*1.3,y-.5))));vec3 col;float a=1.;',
  ' float gr=(h2(floor(fc))-.5)*.05;',
  ' if(FLAT>.5){float ph=fc.x/R.y*N*6.2832;col=vel(ph+sin(y*2.+T*.3)*.15,.5)*lit;col*=.78+.22*smoothstep(1.,.55,y);gl_FragColor=vec4(col*(1.+gr),1.);return;}',
  ' if(VAL>.5){',
  '  float sx=fract(x*SW),si=floor(x*SW);',
  '  float vb=.072+.058*pow(sin(3.14159*sx),.85),fr=.017;',
  '  float dj=min(sx,1.-sx)/SW*asp,ty=(y-.03)/.15;',
  '  float tw=ty<.45?.0028:ty<.52?.007:.006+.009*smoothstep(.52,1.,ty);',
  '  if(dj<tw&&ty>0.&&ty<1.){float k=dj/tw;col=gold(.3+.6*(1.-k*k)*(ty>.52?.75+.25*sin(fc.x*2.3):1.))*(.65+.35*lit);if(ty>.94)col*=.7;gl_FragColor=vec4(col,1.);return;}',
  '  if(y<.014){col=gold(.3+.55*sin(y/.014*3.14159))*(.7+.3*lit);gl_FragColor=vec4(col,1.);return;}',
  '  if(y<vb){float v=(y-.014)/(vb-.014);col=vel(v*4.5*6.2832+sx*1.2,.9)*(.5+.55*lit)*(.68+.32*v)*(.72+.28*sin(3.14159*sx));gl_FragColor=vec4(col*(1.+gr),1.);return;}',
  '  if(y<vb+fr){float k=(y-vb)/fr,rag=.8+.35*h2(vec2(floor(fc.x/2.),si));',
  '   if(k<rag){col=gold(.2+.65*(.55+.45*sin(fc.x*1.7))*(1.-.5*k))*(.65+.35*lit);gl_FragColor=vec4(col,1.);return;}}',
  ' }',
  ' float xs=x<.5?x:1.-x;',
  ' float prof=smoothstep(-.12,.85,y);',
  ' float g=.5*(O*(.1+.9*prof)+max(0.,O-1.)*1.6);',
  ' float e=.5-g;',
  ' if(xs>e){float d=(xs-max(e,0.))*R.x;a=e>0.?.55*exp(-d/(R.x*.03)):0.;gl_FragColor=vec4(0.,0.,0.,a);return;}',
  ' float u=xs/e,comp=.5/max(e,.03);',
  ' float ph=u*N*6.2832+(x<.5?0.:2.1)+sin(y*2.6+T*.7)*.18*(1.-min(O,1.)*.6);',
  ' col=vel(ph,1.35+.4*log(comp))*lit;',
  ' col*=mix(1.,.5,smoothstep(.9,1.,u));',
  ' col+=vec3(.6,.08,.1)*smoothstep(.975,1.,u)*.35*lit;',
  ' col*=.72+.28*smoothstep(1.02,.7,y);col*=.8+.2*smoothstep(0.,.25,y);',
  ' gl_FragColor=vec4(col*(1.+gr),1.);}'
  ].join('\n');

  function Velvet(canvas,opts){
    var gl=canvas.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false})||canvas.getContext('experimental-webgl');
    if(!gl)throw new Error('no webgl');
    function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o}
    var pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
    if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error('link');
    gl.useProgram(pr);
    var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    var l=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);
    var U={};['R','T','O','N','VAL','FLAT','LIT','SW'].forEach(function(k){U[k]=gl.getUniformLocation(pr,k)});
    var self={o:0,lit:1,cssW:1,
      size:function(){var r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,opts.flat?1:1.5);
        self.cssW=r.width||1;var w=Math.max(2,Math.round(r.width*d)),h=Math.max(2,Math.round(r.height*d));
        if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}gl.viewport(0,0,w,h)},
      draw:function(t){
        var folds=opts.flat?opts.pleats:Math.max(4,Math.min(14,self.cssW/2/(opts.foldPx||44)));
        gl.uniform2f(U.R,canvas.width,canvas.height);gl.uniform1f(U.T,t);gl.uniform1f(U.O,self.o);gl.uniform1f(U.N,folds);
        gl.uniform1f(U.VAL,opts.valance?1:0);gl.uniform1f(U.FLAT,opts.flat?1:0);gl.uniform1f(U.LIT,self.lit);
        gl.uniform1f(U.SW,self.cssW<520?2:self.cssW<1000?3:4);
        gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3)}};
    return self;
  }

  /* ---------- the crystal chandelier ---------- */
  function chandelier(id){
    var g='url(#'+id+'g)',bd='url(#'+id+'b)',s=[];
    s.push('<svg viewBox="-112 -2 224 272" aria-hidden="true"><defs>',
      '<radialGradient id="'+id+'b" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#fbf1df"/><stop offset="1" stop-color="#b99a66"/></radialGradient>',
      '<linearGradient id="'+id+'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a4f12"/><stop offset=".45" stop-color="#f7dc8a"/><stop offset="1" stop-color="#9a6a1c"/></linearGradient>',
      '<radialGradient id="'+id+'f"><stop offset="0" stop-color="#fffbe6"/><stop offset=".45" stop-color="#ffd36b"/><stop offset="1" stop-color="#ff8a1e" stop-opacity="0"/></radialGradient>',
      '<radialGradient id="'+id+'h"><stop offset="0" stop-color="#fff6dc" stop-opacity=".85"/><stop offset=".3" stop-color="#ffd58a" stop-opacity=".38"/><stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/></radialGradient>',
      '</defs>');
    s.push('<circle class="ch-halo" cx="0" cy="130" r="150" fill="url(#'+id+'h)"/><circle class="ch-halo" cx="0" cy="140" r="70" fill="url(#'+id+'h)"/>');
    for(var y=0;y<40;y+=6)s.push('<ellipse cx="0" cy="'+(y+3)+'" rx="2.1" ry="3.3" fill="none" stroke="'+g+'" stroke-width="1.3"/>');
    s.push('<path d="M-16 42Q0 33 16 42L10 50Q0 55-10 50Z" fill="'+g+'"/>');
    // body profile: widening bowl of crystal strands, then tapering to the drop
    function rad(y){if(y<150){var k=(y-50)/100;return 14+72*Math.sin(k*Math.PI/2)}var q=(y-150)/84;return 86*(1-q)*(1-q*.35)+6*q}
    var j,phi,yy,x,dep,k;
    for(var pass=0;pass<2;pass++){
      for(j=-6;j<=6;j++){
        phi=(j+(pass?0:.5))/6*1.35;if(pass===0&&j===6)continue;
        dep=Math.cos(phi);
        for(yy=54+((j+7)%2)*3.1;yy<=232;yy+=6.2){x=rad(yy)*Math.sin(phi)*(1+.05*Math.sin((yy-54)/178*Math.PI));
          s.push('<circle cx="'+x.toFixed(1)+'" cy="'+yy.toFixed(1)+'" r="'+(pass?1.7+.8*dep:1.4).toFixed(2)+'" fill="'+bd+'" opacity="'+(pass?.55+.45*dep:.32).toFixed(2)+'"/>')}
      }
    }
    // gold rings with bead swags and candles
    [[78,5,.8],[112,0,0],[150,9,1.1]].forEach(function(t){var y0=t[0],r=rad(y0);
      s.push('<ellipse cx="0" cy="'+y0+'" rx="'+r.toFixed(1)+'" ry="'+(r*.13).toFixed(1)+'" fill="none" stroke="'+g+'" stroke-width="2.2"/>');
      for(k=0;k<=24;k++){var a=k/24*Math.PI,bx=-Math.cos(a)*r,by=y0+Math.sin(a)*r*.13+Math.sin(a*6)*4;
        s.push('<circle cx="'+bx.toFixed(1)+'" cy="'+(by+4).toFixed(1)+'" r="1.7" fill="'+bd+'"/>')}
      var n=t[1];for(k=0;k<n;k++){var cx=(n===1?0:-r*.95+k*(r*1.9/(n-1))),cy=y0+Math.sqrt(Math.max(0,1-(cx*cx)/(r*r)))*r*.13,sz=t[2];
        s.push('<path d="M'+(cx-4*sz).toFixed(1)+' '+cy.toFixed(1)+'h'+(8*sz).toFixed(1)+'l-1.5 '+(-4*sz).toFixed(1)+'h'+(-5*sz).toFixed(1)+'Z" fill="'+g+'"/>',
          '<rect x="'+(cx-1.7*sz).toFixed(1)+'" y="'+(cy-16*sz).toFixed(1)+'" width="'+(3.4*sz).toFixed(1)+'" height="'+(12*sz).toFixed(1)+'" rx="1" fill="#fff6e4"/>',
          '<circle cx="'+cx.toFixed(1)+'" cy="'+(cy-21*sz).toFixed(1)+'" r="'+(11*sz).toFixed(1)+'" fill="url(#'+id+'h)"/>',
          '<ellipse class="ch-fl" style="animation-delay:-'+(k*.37).toFixed(2)+'s" cx="'+cx.toFixed(1)+'" cy="'+(cy-20.5*sz).toFixed(1)+'" rx="'+(2.4*sz).toFixed(1)+'" ry="'+(4.8*sz).toFixed(1)+'" fill="url(#'+id+'f)"/>')}
    });
    // festoons of crystal looping between the candle arms
    for(k=0;k<8;k++){var xa=-81+k*20.25,xb=xa+20.25;for(var m=1;m<8;m++){var q=m/8,fx=xa+(xb-xa)*q,fy=153+Math.sin(q*Math.PI)*12+Math.cos(fx/86*1.4)*3;
      s.push('<circle cx="'+fx.toFixed(1)+'" cy="'+fy.toFixed(1)+'" r="1.9" fill="'+bd+'"/>')}}
    // prisms hanging from the widest ring
    for(k=-5;k<=5;k++){var px=k*15.5,py=156+Math.cos(k/5*1.3)*8;
      s.push('<path d="M'+px+' '+py+'q3.2 6.5 0 13q-3.2-6.5 0-13Z" fill="'+bd+'" opacity=".95"/>')}
    s.push('<circle cx="0" cy="236" r="5" fill="'+g+'"/><path d="M0 240q5 10 0 22q-5-12 0-22Z" fill="'+bd+'"/>');
    // sparkles
    for(k=0;k<16;k++){var sy=60+Math.random()*170,sx=(Math.random()*2-1)*rad(sy)*.9,r2=2.5+Math.random()*3;
      s.push('<path class="ch-sp" style="animation-delay:'+(Math.random()*2.6).toFixed(2)+'s" d="M'+sx.toFixed(1)+' '+(sy-r2).toFixed(1)+'L'+(sx+.8).toFixed(1)+' '+(sy-.8).toFixed(1)+'L'+(sx+r2).toFixed(1)+' '+sy.toFixed(1)+'L'+(sx+.8).toFixed(1)+' '+(sy+.8).toFixed(1)+'L'+sx.toFixed(1)+' '+(sy+r2).toFixed(1)+'L'+(sx-.8).toFixed(1)+' '+(sy+.8).toFixed(1)+'L'+(sx-r2).toFixed(1)+' '+sy.toFixed(1)+'L'+(sx-.8).toFixed(1)+' '+(sy-.8).toFixed(1)+'Z" fill="#fff"/>')}
    s.push('</svg>');return s.join('');
  }

  /* ---------- the gold oval frame ---------- */
  function ovalFrame(){
    var s=['<defs><linearGradient id="ovg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a5a14"/><stop offset=".3" stop-color="#f8e08e"/><stop offset=".55" stop-color="#b07a22"/><stop offset=".8" stop-color="#f3d27a"/><stop offset="1" stop-color="#7a4c10"/></linearGradient></defs>',
      '<ellipse cx="150" cy="230" rx="146" ry="226" fill="none" stroke="url(#ovg)" stroke-width="2"/>',
      '<ellipse cx="150" cy="230" rx="139" ry="219" fill="none" stroke="url(#ovg)" stroke-width="9"/>',
      '<ellipse cx="150" cy="230" rx="139" ry="219" fill="none" stroke="#fff3c4" stroke-opacity=".35" stroke-width="1.2"/>',
      '<ellipse cx="150" cy="230" rx="130" ry="210" fill="none" stroke="#f3d27a" stroke-width="2.6" stroke-linecap="round" stroke-dasharray=".1 6.5"/>',
      '<ellipse cx="150" cy="230" rx="125" ry="205" fill="none" stroke="url(#ovg)" stroke-width="1.6"/>'];
    // scrolls around the frame
    for(var i=0;i<12;i++){var a=i/12*Math.PI*2,x=150+Math.cos(a)*139,y=230+Math.sin(a)*219,deg=a*180/Math.PI+90;
      s.push('<g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+') rotate('+deg.toFixed(1)+')"><path d="M-9 0C-9-7-2-9 0-4 2-9 9-7 9 0 5-3 2-1 0 4-2-1-5-3-9 0Z" fill="url(#ovg)"/><circle r="2.2" cy="-1" fill="#fff3c4" opacity=".7"/></g>')}
    s.push('<g transform="translate(150 6)"><path d="M0-14C6-6 14-4 20 2 12 2 6 6 0 12-6 6-12 2-20 2-14-4-6-6 0-14Z" fill="url(#ovg)"/><circle r="3.2" cy="-1" fill="#c8304f"/></g>');
    return s.join('');
  }

  var vFront,vInner,vBack;
  try{
    vFront=Velvet($('opCurtain'),{valance:true,foldPx:44});
    vInner=Velvet($('opInner'),{valance:true,foldPx:26});
    vBack=Velvet($('opVelvet'),{flat:true,pleats:9});
  }catch(e){finish();return}
  chS.innerHTML=chandelier('chs');chF.innerHTML=chandelier('chf');
  $('opOvalSvg').innerHTML=ovalFrame();

  /* ---------- page 1 starts below the screen; it rises at the end ---------- */
  var vh=innerHeight;
  function heroAt(p1,p2,p3){if(window.heroIntro)heroIntro.set({stage:(1-p1)*vh,names:(1-p2)*vh*.42,op:p2,hawa:(1-p3)*vh})}
  heroAt(0,0,0);

  /* ---------- timeline ---------- */
  function cl(x){return x<0?0:x>1?1:x}
  function io(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
  function eo(t){return 1-Math.pow(1-t,3)}
  function seg(t,a,b,f){return (f||io)(cl((t-a)/(b-a)))}
  function lerp(a,b,k){return a+(b-a)*k}
  var t0=0,started=false,done=false,start=performance.now(),seek=null;
  var decor=[].slice.call(front.querySelectorAll('.op-gar,.op-lamp,.op-corner'));
  window.__opSeek=function(sec){seek=sec;started=true;op.classList.add('go');paint(performance.now())}; // test aid: freeze the opening at a moment

  function frame(now){if(!done&&paint(now))requestAnimationFrame(frame)}
  function paint(now){
    var T=(now-start)/1000,t=seek!=null?seek:started?(now-t0)/1000:0;
    // front curtains part from the middle, the camera moves in
    var fo=seg(t,.25,2.5);vFront.o=fo*1.75;
    var fs=lerp(1,1.32,seg(t,.6,2.7,function(k){return k*k}));
    front.style.transform='scale('+fs.toFixed(4)+')';
    var dk=seg(t,.5,1.7);decor.forEach(function(d){d.style.opacity=(1-dk).toFixed(3)});front.style.opacity=(1-seg(t,2.3,2.75)).toFixed(3);
    // the stage: lights come up, slow approach, then the camera moves into the arch
    var ss=lerp(.9,1,seg(t,.3,2.6,eo))*lerp(1,1.04,seg(t,2.6,3.8,function(k){return k}))*lerp(1,1.95,seg(t,3.8,5.7));
    stage.style.transform='scale('+ss.toFixed(4)+')';
    dim.style.opacity=(.6*(1-seg(t,.3,2.2))).toFixed(3);
    chS.style.setProperty('--glow',(.7+.3*seg(t,2.4,3.4)).toFixed(3));
    vInner.o=seg(t,3.6,5.5)*1.75;
    stage.style.opacity=(1-seg(t,5,5.9)).toFixed(3);
    // the velvet backdrop with the oval
    fin.style.transform='scale('+lerp(1.16,1,seg(t,3.8,6.1,eo)).toFixed(4)+')';
    oval.style.opacity=seg(t,4.6,5.7).toFixed(3);
    chF.style.opacity=(seg(t,5.5,6.1)*(1-seg(t,6.6,7.3))).toFixed(3);
    // page 1 rises from the bottom: the page, its text, then Hawa Mahal
    var p1=seg(t,7.3,8.6),p2=seg(t,7.7,8.9,eo),p3=seg(t,8.1,9.5,eo);
    op.style.background=started&&t>7.2?'transparent':'';
    if(started&&t>7.2){vh=innerHeight;fin.style.transform='translate3d(0,'+(-p1*vh).toFixed(1)+'px,0)';heroAt(p1,p2,p3)}

    if(!started||t<2.8)vFront.draw(T);
    if(!started||t<6)vInner.draw(T);
    if(!started||t<7.3||!vBack.drawn){vBack.draw(T);vBack.drawn=true}
    if(started&&t>=9.6&&seek==null){done=true;finish();return false}
    return true;
  }

  function go(){
    if(started)return;started=true;t0=performance.now();op.classList.add('go');
    if(reduce){ // no camera moves: a soft fade straight to page 1
      done=true;op.style.transition='opacity .7s';op.style.opacity='0';heroAt(1,1,1);setTimeout(finish,750)}
  }
  var hs=/op-seek=([\d.]+)/.exec(location.hash);if(hs)setTimeout(function(){__opSeek(+hs[1])},400);
  op.addEventListener('click',go);
  op.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});

  function resize(){vFront.size();vInner.size();vBack.size();vBack.drawn=false;if(!started){vh=innerHeight;heroAt(0,0,0)}}
  addEventListener('resize',resize);
  resize();

  // fade in from black once the scene's pictures are ready (or after 2.5 s at the latest)
  var imgs=[].slice.call(op.querySelectorAll('img')),left=imgs.length,shown=false;
  function show(){if(shown)return;shown=true;black.style.opacity='0';setTimeout(function(){op.classList.add('ready');try{$('opTap').focus({preventScroll:true})}catch(e){}},700)}
  imgs.forEach(function(im){if(im.complete)left--;else im.addEventListener('load',function(){if(--left<=0)show()}),im.addEventListener('error',function(){if(--left<=0)show()})});
  if(left<=0)show();setTimeout(show,2500);
  requestAnimationFrame(frame);
})();
