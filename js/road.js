(() => {
  /* ---- OPTIONAL: use your own transparent PNGs ----
     e.g. taxi: 'img/taxi.png', rickshaw: 'img/rickshaw.png'
     Leave '' to use the drawn vehicles. Your reference images face LEFT. */
  const IMAGES = { taxi: '', rickshaw: '' };
  const IMAGE_FACES = 'left';

  const scene = document.getElementById('roadScene');

  /* ---------- taxi (faces right, nobody inside) ---------- */
  const taxiSVG = (body = '#f5b700') => `
  <svg class="veh taxi" viewBox="0 0 300 122" width="260" xmlns="http://www.w3.org/2000/svg" style="--body:${body}">
    <ellipse cx="150" cy="116" rx="136" ry="6" fill="rgba(0,0,0,.28)"/>
    <g class="bobbing">
      <path d="M12 84 Q12 64 30 62 L70 58 L96 26 Q101 21 110 21 L196 21 Q207 21 214 29 L238 58 L268 63 Q290 67 290 85 L290 97 L12 97Z"
            style="fill:var(--body)" stroke="#1b1b1b" stroke-width="2.5" stroke-linejoin="round"/>
      <polygon points="98,31 146,31 146,55 82,55" fill="#bfe6f5" stroke="#1b1b1b" stroke-width="2"/>
      <polygon points="152,31 204,31 226,55 152,55" fill="#bfe6f5" stroke="#1b1b1b" stroke-width="2"/>
      <path d="M104 33 L116 33 L100 53 L90 53Z" fill="#fff" opacity=".45"/>
      <line x1="149" y1="31" x2="149" y2="94" stroke="#1b1b1b" stroke-width="2"/>
      <rect x="132" y="62" width="12" height="4" rx="2" fill="#555"/>
      <rect x="160" y="62" width="12" height="4" rx="2" fill="#555"/>
      <rect x="14" y="70" width="274" height="10" fill="url(#rs-band)" stroke="#1b1b1b" stroke-width="1.2"/>
      <use href="#rs-lotus" x="36" y="56" width="22" height="24"/>
      <use href="#rs-lotus" x="104" y="84" width="14" height="14"/>
      <use href="#rs-lotus" x="176" y="84" width="14" height="14"/>
      <use href="#rs-lotus" x="246" y="54" width="22" height="24"/>
      <use href="#rs-lotus" x="262" y="84" width="14" height="14"/>
      <path d="M28 90 q8 -8 16 0 M214 90 q8 -8 16 0 M60 90 q8 -8 16 0" stroke="#2e8b3d" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <circle cx="285" cy="76" r="7" fill="#fff" stroke="#1b1b1b" stroke-width="2"/>
      <rect x="14" y="74" width="5" height="9" rx="2" fill="#d9261c"/>
      <rect x="268" y="92" width="26" height="6" rx="3" fill="#cfd4d8" stroke="#1b1b1b" stroke-width="1.5"/>
      <rect x="6" y="92" width="24" height="6" rx="3" fill="#cfd4d8" stroke="#1b1b1b" stroke-width="1.5"/>
    </g>
    ${[70,232].map(cx => `
    <circle cx="${cx}" cy="99" r="21" fill="#1b1b1b"/>
    <g class="wheel"><circle cx="${cx}" cy="99" r="17" fill="#2a2a2a" stroke="#000" stroke-width="2"/>
      <circle cx="${cx}" cy="99" r="10.5" fill="#dfe3e6" stroke="#777" stroke-width="1.5"/>
      <path d="M${cx-10} 99 H${cx+10} M${cx} 89 V109" stroke="#888" stroke-width="2"/>
      <circle cx="${cx}" cy="99" r="3.5" fill="#999"/></g>`).join('')}
  </svg>`;

  /* ---------- rickshaw (faces right, nobody inside) ---------- */
  const rickshawSVG = (nose = '#3d8fd6', side = '#5ccf9a') => `
  <svg class="veh rickshaw" viewBox="0 0 210 150" width="185" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="105" cy="145" rx="92" ry="5" fill="rgba(0,0,0,.28)"/>
    <g class="bobbing">
      <rect x="18" y="38" width="112" height="28" fill="#1f5c72"/>
      <rect x="26" y="44" width="50" height="22" rx="4" fill="#f0674f" stroke="#1b1b1b" stroke-width="1.5"/>
      <rect x="82" y="46" width="34" height="20" rx="4" fill="#f0674f" stroke="#1b1b1b" stroke-width="1.5"/>
      <path d="M16 66 L130 66 L132 112 L16 112Z" style="fill:${side}" stroke="#1b1b1b" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M16 84 l9 -7 9 7 9 -7 9 7 9 -7 9 7 9 -7 9 7 9 -7 9 7 9 -7 9 7 9 -7 9 7" fill="none" stroke="#ff9d1c" stroke-width="3.5" stroke-linecap="round"/>
      <g transform="translate(28 88)">
        <rect x="2" y="12" width="4" height="9" fill="#e9695a"/><rect x="22" y="12" width="4" height="9" fill="#e9695a"/>
        <ellipse cx="14" cy="9" rx="14" ry="9" fill="#ee7a68" stroke="#1b1b1b" stroke-width="1.2"/>
        <circle cx="30" cy="5" r="6.5" fill="#ee7a68" stroke="#1b1b1b" stroke-width="1.2"/>
        <path d="M34 8 q6 4 1 13" stroke="#e9695a" stroke-width="3.2" fill="none" stroke-linecap="round"/>
        <rect x="6" y="1" width="16" height="7" rx="2" fill="#2fb7c9"/>
        <circle cx="32" cy="3.5" r="1" fill="#000"/>
      </g>
      <path d="M130 52 Q154 42 168 56 Q184 80 182 110 L132 112Z" style="fill:${nose}" stroke="#1b1b1b" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M142 70 q4 -6 8 0 q4 -6 8 0" stroke="#ffd54a" stroke-width="3" fill="none"/>
      ${[0,1,2,3,4,5].map(i => `<circle cx="${138+i*8}" cy="${92+Math.sin(i*1.05)*4}" r="4" fill="${i%2? '#ff9d1c':'#ffd54a'}" stroke="#c46a00" stroke-width=".8"/>`).join('')}
      <circle cx="177" cy="80" r="6" fill="#fff6c9" stroke="#1b1b1b" stroke-width="2"/>
      <polygon points="134,34 164,33 176,62 138,64" fill="#bfe6f5" stroke="#1b1b1b" stroke-width="2.2"/>
      <path d="M142 60 L162 40" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="173" cy="49" r="3" fill="#333"/>
      <rect x="15" y="26" width="5" height="40" fill="#1b1b1b"/>
      <rect x="94" y="30" width="4" height="36" fill="#1b1b1b"/>
      <rect x="128" y="30" width="5" height="36" fill="#1b1b1b"/>
      <path d="M10 28 Q8 14 40 14 L142 18 Q170 20 170 34 L132 34 L132 30 L14 30Z" fill="#ffc933" stroke="#1b1b1b" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M12 21 Q60 12 140 16 Q166 18 169 30" fill="none" stroke="#3d8fd6" stroke-width="6"/>
      <path d="M20 19 h14 M46 17 h14 M72 16 h14 M98 16 h14" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M22 31 Q56 46 92 31" fill="none" stroke="#ff9d1c" stroke-width="4" stroke-dasharray="4 3"/>
    </g>
    ${[46,172].map(cx => `
    <path d="M${cx-24} 112 Q${cx} 84 ${cx+24} 112Z" style="fill:${cx<100?nose:'#ffc933'}" stroke="#1b1b1b" stroke-width="2.2"/>
    <g class="wheel"><circle cx="${cx}" cy="124" r="19" fill="#26262b" stroke="#000" stroke-width="2"/>
      <circle cx="${cx}" cy="124" r="10" fill="#e0b25a" stroke="#8a5a14" stroke-width="1.6"/>
      <path d="M${cx-10} 124 H${cx+10} M${cx} 114 V134" stroke="#8a5a14" stroke-width="1.6"/>
      <circle cx="${cx}" cy="124" r="3" fill="#8a5a14"/></g>`).join('')}
  </svg>`;

  const vehicleHTML = (type, a, b) =>
    IMAGES[type] ? `<img class="veh-img" src="${IMAGES[type]}" alt="">`
                 : (type === 'taxi' ? taxiSVG(a) : rickshawSVG(a, b));
  const facesRight = type => IMAGES[type] ? IMAGE_FACES === 'right' : true;

  function addMover(lane, html, dir, dur, delay, scale, faceR) {
    const m = document.createElement('div');
    m.className = `mover ${dir}`;
    m.style.setProperty('--dur', dur + 's');
    m.style.setProperty('--delay', delay + 's');
    const flip = document.createElement('div');
    flip.className = 'scale' + ((faceR ? dir === 'rtl' : dir === 'ltr') ? ' flip' : '');
    const inner = document.createElement('div');
    inner.className = 'scale';
    inner.style.transform = `scale(${scale})`;
    inner.innerHTML = html;
    flip.appendChild(inner);
    m.appendChild(flip);
    lane.appendChild(m);
  }

  const laneA = document.getElementById('laneA'), laneB = document.getElementById('laneB');

  // far lane: left → right
  [['taxi','#f5b700'], ['rickshaw','#3d8fd6','#5ccf9a'], ['rickshaw','#e8603c','#ffd54a']]
    .forEach(([t,a,b], i) => addMover(laneA, vehicleHTML(t,a,b), 'ltr', 17, -(i*5.7), .92, facesRight(t)));

  // near lane: right → left
  [['rickshaw','#9b5de5','#3ed1b0'], ['taxi','#f5b700'], ['rickshaw','#3d8fd6','#5ccf9a']]
    .forEach(([t,a,b], i) => addMover(laneB, vehicleHTML(t,a,b), 'rtl', 21, -(i*7), 1.08, facesRight(t)));

  const setW = () => scene.style.setProperty('--w', scene.clientWidth + 'px');
  setW();
  let rw_=0;
  new ResizeObserver(() => { if (rw_) return; rw_ = requestAnimationFrame(() => { rw_ = 0; setW(); }); }).observe(scene);
})();
