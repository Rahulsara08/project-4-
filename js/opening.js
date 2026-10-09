/* Opening: the guest's name on velvet curtains with a gold rod of garlands and lanterns. Tap to Open: the decorations
   fade, the curtains part, a gold arch stage appears with page 1 of the site inside it, and the camera moves slowly
   into the arch until page 1 fills the screen; then the site carries on. The velvet is drawn with WebGL. */
(function(){
  window.__opReady=true;
  var root=document.documentElement,op=document.getElementById('op');
  function finish(){var nm=document.querySelector('.names');if(nm&&op)nm.style.animation='none'; // don't replay page 1's CSS fade
    root.classList.remove('op-on','op-lock');if(op&&op.parentNode)op.parentNode.removeChild(op);
    window.__opDone=true;try{document.dispatchEvent(new Event('opening:done'))}catch(e){}}
  if(!op){finish();return}
  var $=function(i){return document.getElementById(i)};
  // test aid: #op-skip goes straight to the site, #op-skip=pg6,-200 then scrolls to an element (and by an offset)
  var sk=/op-skip(?:=([\w-]+)(?:,(-?\d+))?)?/.exec(location.hash);
  if(sk){finish();if(sk[1])setTimeout(function(){var el=$(sk[1]);if(el){el.scrollIntoView();if(sk[2])scrollBy(0,+sk[2])}},700);return}
  var front=$('opFront'),stage=$('opStage'),hang=$('opHang'),dim=$('opDim'),black=$('opBlack'),chS=$('opChand'),arch=$('opArch'),win=$('opWin');
  var corners=[].slice.call(front.querySelectorAll('.op-corner')),props=[].slice.call(stage.querySelectorAll('.op-urn,.op-lotus-c'));
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
      size:function(){var r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,opts.flat?1:1.25);
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

  var vFront,vBack;
  try{vFront=Velvet($('opCurtain'),{valance:true,foldPx:44});vBack=Velvet($('opVelvet'),{flat:true,pleats:9})}catch(e){finish();return}
  chS.innerHTML=chandelier('chs');

  /* ---------- page 1 of the site, copied into the arch's window ---------- */
  var hero=$('stage'),clone=null,G=null;
  function makeClone(){
    if(clone||!hero)return;
    clone=hero.cloneNode(true);clone.removeAttribute('id');
    [].forEach.call(clone.querySelectorAll('[id]'),function(e){e.removeAttribute('id')});
    clone.classList.add('op-clone');clone.style.width=hero.offsetWidth+'px';clone.style.height=hero.offsetHeight+'px';
    win.appendChild(clone);
  }
  // geometry in the stage layer's own px (the layer is the full screen before it is transformed)
  function geo(){
    var tf=stage.style.transform;stage.style.transform='none';
    var ar=arch.getBoundingClientRect(),sr=stage.getBoundingClientRect();stage.style.transform=tf;
    var sw=ar.width,ah=ar.height,ax=ar.left-sr.left,ay=ar.top-sr.top;
    var ix0=ax+sw*.078,ix1=ax+sw*.926,iy0=ay+sw*.178,iy1=ay+ah-sw*.0758;   // the opening inside the gold arch
    var W=hero?hero.offsetWidth:innerWidth,H=hero?hero.offsetHeight:innerHeight,k0=Math.max((ix1-ix0)/W,(iy1-iy0)/H);
    var sy0=ay+sw*.695;  // below the arch's curve the opening is a straight-sided rectangle; the zoom ends when it covers the screen
    G={ax:ax,ay:ay,W:W,H:H,icx:(ix0+ix1)/2,icy:(iy0+iy1)/2,fy:(sy0+iy1)/2,k0:k0,S1:1/k0,Sout:Math.max(1.2/k0,W/(ix1-ix0)*1.1,H/(iy1-sy0)*1.1)};
  }

  /* ---------- timeline ---------- */
  function cl(x){return x<0?0:x>1?1:x}
  function io(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
  function eo(t){return 1-Math.pow(1-t,3)}
  function seg(t,a,b,f){return (f||io)(cl((t-a)/(b-a)))}
  function lerp(a,b,k){return a+(b-a)*k}
  var t0=0,started=false,done=false,start=performance.now(),seek=null;
  window.__opSeek=function(sec){seek=sec;if(!started){started=true;op.classList.add('go');makeClone()}geo();paint(performance.now())}; // test aid: freeze at a moment

  function paint(now){
    var T=(now-start)/1000,t=seek!=null?seek:started?(now-t0)/1000:0,cx=innerWidth/2,cy=innerHeight/2;
    // 1. the rod with its garlands and lanterns fades, then the curtains part and the camera moves through them
    var hk=1-seg(t,.15,1.1);hang.style.opacity=hk.toFixed(3);corners.forEach(function(c){c.style.opacity=hk.toFixed(3)});
    vFront.o=seg(t,.35,2.6)*1.75;
    var fs=lerp(1,1.28,seg(t,.7,2.8,function(k){return k*k}));
    front.style.transform='translate3d('+((1-fs)*cx).toFixed(1)+'px,'+((1-fs)*cy).toFixed(1)+'px,0) scale('+fs.toFixed(4)+')';
    front.style.opacity=(1-seg(t,2.4,2.85)).toFixed(3);
    // 2. the stage lights up; page 1 fades in inside the arch while the chandelier fades away
    dim.style.opacity=(.6*(1-seg(t,.35,2.2))).toFixed(3);
    chS.style.opacity=(1-seg(t,2.3,3.1)).toFixed(3);
    if(clone)clone.style.opacity=seg(t,2.2,3.3).toFixed(3);
    var pk=(1-seg(t,4.1,5.2)).toFixed(3);props.forEach(function(e){e.style.opacity=pk});   // the flowers in front of the arch step aside
    // 3. slow zoom into the arch: its opening glides to the centre and grows until page 1 fills the screen,
    //    while the frame, pillars and flowers move out past the edges
    if(G){
      var Spre=lerp(.9,1,seg(t,.35,2.7,eo)),S=Spre*Math.exp(Math.log(G.Sout)*seg(t,3.9,6.7));
      var v=cl(Math.log(Math.max(1,S))/Math.log(G.S1));v=v*v*(3-2*v);
      var w=S>G.S1?cl(Math.log(S/G.S1)/Math.log(G.Sout/G.S1)):0;w=w*w*(3-2*w);
      var Fy=lerp(G.icy,G.fy,w);   // after page 1 fits, the camera centres on the straight part of the opening
      var Pcx=lerp(cx+Spre*(G.icx-cx),G.W/2,v),Pcy=lerp(cy+Spre*(G.icy-cy),G.H/2,v);
      var Tx=Pcx-S*G.icx,Ty=Pcy-S*Fy;
      stage.style.transform='translate3d('+Tx.toFixed(2)+'px,'+Ty.toFixed(2)+'px,0) scale('+S.toFixed(5)+')';
      if(clone){ // page 1 stays in the arch until it fits the screen exactly, then holds still while the arch moves past
        var K=Math.min(1,S*G.k0),Ax=K<1?Tx+S*G.icx-K*G.W/2:0,Ay=K<1?Ty+S*G.icy-K*G.H/2:0;
        clone.style.transform='translate3d('+((Ax-Tx)/S-G.ax).toFixed(2)+'px,'+((Ay-Ty)/S-G.ay).toFixed(2)+'px,0) scale('+(K/S).toFixed(5)+')';
      }
    }
    // 4. the real page 1 is underneath in the same place: fade the opening away and hand over
    op.style.opacity=started?(1-seg(t,6.7,7.2)).toFixed(3):'';
    if(!started||t<2.9)vFront.draw(T);
    if(started&&t>=7.25&&seek==null){done=true;finish();return false}
    return true;
  }
  function frame(now){if(!done&&paint(now))requestAnimationFrame(frame)}

  function go(){
    if(started)return;started=true;t0=performance.now();op.classList.add('go');makeClone();geo();
    if(reduce){done=true;op.style.transition='opacity .7s';op.style.opacity='0';setTimeout(finish,750)}
  }
  var hs=/op-seek=([\d.]+)/.exec(location.hash);if(hs)setTimeout(function(){__opSeek(+hs[1])},400);
  op.addEventListener('click',go);
  op.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});

  function resize(){vFront.size();vBack.size();vBack.draw(0);geo();
    if(clone&&hero){clone.style.width=hero.offsetWidth+'px';clone.style.height=hero.offsetHeight+'px'}}
  addEventListener('resize',resize);
  resize();

  // fade in from black once the scene's pictures are ready (or after 2.5 s at the latest)
  var imgs=[].slice.call(op.querySelectorAll('img')),left=imgs.length,shown=false;
  function show(){if(shown)return;shown=true;black.style.opacity='0';setTimeout(function(){op.classList.add('ready');try{$('opTap').focus({preventScroll:true})}catch(e){}},700)}
  imgs.forEach(function(im){if(im.complete)left--;else{im.addEventListener('load',function(){if(--left<=0)show()});im.addEventListener('error',function(){if(--left<=0)show()})}});
  if(left<=0)show();setTimeout(show,2500);
  requestAnimationFrame(frame);
})();
