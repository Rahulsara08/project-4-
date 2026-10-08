/* page 4: realistic sky with soft clouds drifting slowly (WebGL); only drawn while the page is on screen */
(function(){
  var cv=document.getElementById('p4real'),st=document.getElementById('p4stage');if(!cv||!st)return;
  var gl=cv.getContext('webgl',{alpha:false,antialias:false,premultipliedAlpha:false,preserveDrawingBuffer:true});if(!gl)return;
  var VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS=['#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nuniform vec2 R;uniform float T;',
   'float h(vec2 p){p=mod(p,289.);vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}',
   'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
   'float fb(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<6;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}',
   'void main(){float y=gl_FragCoord.y/R.y;',
   ' vec3 top=vec3(.086,.376,.769),hor=vec3(.62,.80,.95);vec3 sky=mix(hor,top,pow(y,.7));',
   ' vec2 q=vec2(gl_FragCoord.x/R.y*1.15,y*2.4)+vec2(T*.018,0.);',
   ' float w=fb(q*.7+vec2(T*.006,0.));float d=fb(q+w*.9);',
   ' float cov=.40+.08*y;float c=smoothstep(cov,cov+.26,d);',
   ' float d2=fb(q+w*.9+vec2(-.05,-.09));float lit=clamp(.55+(d-d2)*5.,0.,1.);',
   ' vec3 cc=mix(vec3(.70,.76,.85),vec3(1.,.995,.98),lit);',
   ' float wisp=smoothstep(.55,.85,fb(vec2(q.x*.5,q.y*3.)+T*.01))*.25*y;',
   ' vec3 col=mix(sky,vec3(1.),wisp);col=mix(col,cc,c*.97);',
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
