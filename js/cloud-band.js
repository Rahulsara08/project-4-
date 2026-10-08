/* bottom of page 3: a bank of realistic clouds over the seam between the events wall and the sky, drifting slowly */
(function(){
  var cv=document.getElementById('p4band'),gap=document.getElementById('p4gap');if(!cv)return;
  var gl=cv.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false});if(!gl){cv.style.display='none';return}
  var VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS=['#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nuniform vec2 R;uniform float T;',
   'float h(vec2 p){p=mod(p,289.);vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}',
   'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
   'float fb(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<6;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}',
   'void main(){vec2 u=gl_FragCoord.xy/R;',
   ' vec2 q=vec2(gl_FragCoord.x/R.y*.9,u.y*1.6)+vec2(T*.02,0.);',
   ' float w=fb(q*.8+vec2(T*.007,3.));float d=fb(q+w*.8);',
   ' float band=exp(-pow((u.y-.5)/.2,2.));',                       /* dense in the middle, wispy at the edges */
   ' float c=smoothstep(.62-.42*band,.80-.42*band,d);',
   ' c*=smoothstep(.0,.22,u.y)*smoothstep(1.,.7,u.y);',
   ' c=max(c,smoothstep(.16,.04,abs(u.y-.5)));',                    /* always solid across the middle: hides the seam */
   ' float d2=fb(q+w*.8+vec2(-.04,-.08));float lit=clamp(.55+(d-d2)*5.+.25*(u.y-.5),0.,1.);',
   ' vec3 cc=mix(vec3(.74,.80,.88),vec3(1.,.995,.985),lit);',
   ' gl_FragColor=vec4(cc*c,c);}'].join('\n');
  function sh(t,src){var s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null}
  var vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS);if(!vs||!fs){cv.style.display='none';return}
  var pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){cv.style.display='none';return}
  gl.useProgram(pr);
  var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  var uR=gl.getUniformLocation(pr,'R'),uT=gl.getUniformLocation(pr,'T');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,on=false,raf=0,t0=performance.now()-20000;
  function size(){var k=Math.min(1,(window.devicePixelRatio||1))*.7;var w=Math.max(2,Math.round(cv.clientWidth*k)),h=Math.max(2,Math.round(cv.clientHeight*k));
    if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;gl.viewport(0,0,w,h)}gl.uniform2f(uR,cv.width,cv.height)}
  function draw(now){raf=0;size();gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(uT,(now-t0)/1000);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);if(on&&!reduce)raf=requestAnimationFrame(draw)}
  gap.classList.add('real');
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){on=es[0].isIntersecting;if(on&&!raf)raf=requestAnimationFrame(draw)}).observe(cv);
  else on=true;
  addEventListener('resize',function(){if(!raf)raf=requestAnimationFrame(draw)});
  draw(performance.now());
})();
