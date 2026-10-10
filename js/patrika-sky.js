/* page 4: the cloud-shader sky behind the Patrika Gate (WebGL); only drawn while the page is on screen.
   The couple's scroll animation is separate (js/patrika-couple.js) and unchanged. */
(function(){
  var cv=document.getElementById('p4real'),st=document.getElementById('p4stage');if(!cv||!st)return;
  var gl=cv.getContext('webgl',{alpha:false,antialias:false,premultipliedAlpha:false,preserveDrawingBuffer:true});if(!gl)return;
  var VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  // the cloud shader (in the style of Aceternity's CloudShader): sky gradient with horizon haze and a soft sun glow,
  // faint cirrus near the top, and dome-shaped billowing clouds in three depth layers (far, middle, near) drifting
  // sideways and wrapping around; each cloud is darker underneath (a second sample towards the sun) and far ones fade
  var FS=['#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nuniform vec2 R;uniform float T;',
   'const vec3 SKY_TOP=vec3(.22,.463,.729),SKY_BOT=vec3(.549,.749,.91),CLOUD=vec3(.984,.973,.949);',   // #3876ba, #8cbfe8, #fbf8f2
   'float h(vec2 p){p=mod(p,289.);vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}',
   'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
   'float fb(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<4;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}',
   'float bil(vec2 p){float v=0.,a=.55;for(int i=0;i<5;i++){v+=a*abs(n(p)*2.-1.);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}',
   'float cloud(vec2 uv,vec2 c,vec2 s,float sd){',
   ' vec2 d=(uv-c)/s;if(d.y<0.)d.y*=2.4;',                       // flatter base, rounded dome on top
   ' float e=1.-length(d);if(e<-.35)return 0.;',
   ' vec2 q=uv*3.2/s.y*.17+sd;q+=vec2(fb(q*.55+T*.03),fb(q*.55+7.3-T*.02))*.9;',   // domain-warped billows
   ' return smoothstep(.0,.32,e+(bil(q)-.42)*.6);}',
   'void main(){vec2 uv=gl_FragCoord.xy/R.y;float asp=R.x/R.y,y=gl_FragCoord.y/R.y;',
   ' vec3 sky=mix(SKY_BOT,SKY_TOP,smoothstep(0.,1.,y));',
   ' sky=mix(sky,vec3(.9,.94,.97),exp(-y*5.5)*.55);',                                   // horizon haze
   ' sky+=vec3(1.,.95,.84)*exp(-length(uv-vec2(asp*.8,.9))*3.2)*.32;',                 // sun glow
   ' float ci=smoothstep(.56,.9,fb(vec2(uv.x*.55+T*.004,uv.y*5.2)))*smoothstep(.5,1.,y)*.32;sky=mix(sky,vec3(1.),ci);',   // cirrus
   ' vec3 col=sky;',
   ' for(int L=0;L<3;L++){float fl=float(L),k=.42+fl*.2,sp=.006+fl*.007,yb=.9-fl*.1;   // clouds in the sky above the gate',   // far -> near
   '  for(int j=0;j<2;j++){float sd=fl*3.7+float(j)*11.3,span=asp+1.3*k;',
   '   float cx=mod(fract(sd*.618)*span+T*sp,span)-.65*k;',
   '   vec2 c=vec2(cx,yb+.05*sin(sd*2.1)),s=vec2(.44,.17)*k;',
   '   float dn=cloud(uv,c,s,sd);if(dn<=.001)continue;',
   '   float d2=cloud(uv+vec2(.025,.045)*k,c,s,sd);',                                   // towards the sun: shade the underside
   '   vec3 cc=mix(vec3(.64,.7,.8),CLOUD,clamp(1.05-d2*.62,0.,1.));',
   '   cc=mix(cc,sky,(2.-fl)*.17);',                                                    // distant clouds fade into the sky
   '   col=mix(col,cc,dn*.97);}}',
   ' gl_FragColor=vec4(col,1.);}'].join('\n');
  function sh(t,src){var s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null}
  var vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS);if(!vs||!fs)return;
  var pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;
  gl.useProgram(pr);
  var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  var uR=gl.getUniformLocation(pr,'R'),uT=gl.getUniformLocation(pr,'T');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,on=false,raf=0,t0=performance.now()-40000;
  function size(){var k=Math.min(1,(window.devicePixelRatio||1))*.6;var w=Math.max(2,Math.round(cv.clientWidth*k)),h=Math.max(2,Math.round(cv.clientHeight*k));
    if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;gl.viewport(0,0,w,h)}gl.uniform2f(uR,cv.width,cv.height)}
  function draw(now){raf=0;size();gl.uniform1f(uT,(now-t0)/1000);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);if(on&&!reduce)raf=requestAnimationFrame(draw)}
  st.classList.add('real');
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){on=es[0].isIntersecting;if(on&&!raf)raf=requestAnimationFrame(draw)}).observe(st);
  else on=true;
  addEventListener('resize',function(){if(!raf)raf=requestAnimationFrame(draw)});
  draw(performance.now());
})();
