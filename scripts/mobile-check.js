// Mobile / desktop layout check (development tool, not part of the site).
//   node scripts/mobile-check.js [outDir] [viewport names...]
// Opens the site in the locally installed Chrome at several screen sizes, scrolls the whole page taking screenshots,
// captures the opening animation at key moments, and reports: horizontal overflow, stretched images (rendered aspect
// ratio vs natural, for images drawn with object-fit: fill) and console errors. Writes report.json + PNGs to outDir.
const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(p => fs.existsSync(p));

const VIEWPORTS = {
  's320': [320, 568], 's360': [360, 640], 's375': [375, 667], 's390': [390, 844], 's412': [412, 915], 's430': [430, 932],
  'tab768': [768, 1024], 'land844': [844, 390], 'desk1440': [1440, 900],
};

const out = path.resolve(process.argv[2] || 'mobile-check-out');
const only = process.argv.slice(3);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  fs.mkdirSync(out, { recursive: true });
  const handler = require('../server.js');                 // serve the built site on a free port
  const server = http.createServer(handler).listen(0);
  const base = `http://localhost:${server.address().port}/index.html`;
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const report = {};
  for (const [name, [w, h]] of Object.entries(VIEWPORTS)) {
    if (only.length && !only.includes(name)) continue;
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e.message || e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 768, hasTouch: w < 1024 });

    // --- opening animation frames
    for (const t of [0, 1.4, 3.4, 5.4, 6.6]) {
      await page.goto(`${base}?to=Rahul%20Sharma&n=${t}#op-seek=${t}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(2200);
      await page.screenshot({ path: path.join(out, `${name}-open-${t}.png`) });
    }
    // --- the site itself: scroll through everything
    await page.goto(`${base}?to=Rahul%20Sharma&n=site#op-skip`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);
    await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }));
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const shots = [];
    let y = 0, i = 0;
    const stretched = new Map(), overflow = [];
    while (true) {
      await page.evaluate(yy => scrollTo(0, yy), y);
      await sleep(900);
      const file = `${name}-${String(i).padStart(2, '0')}.png`;
      await page.screenshot({ path: path.join(out, file) });
      shots.push(file);
      const m = await page.evaluate(() => {
        const vw = innerWidth, res = { sw: document.documentElement.scrollWidth, bad: [] };
        for (const img of document.querySelectorAll('img')) {
          const r = img.getBoundingClientRect(), cs = getComputedStyle(img);
          if (r.width < 8 || r.height < 8 || !img.naturalWidth || cs.display === 'none' || cs.visibility === 'hidden') continue;
          if (r.bottom < 0 || r.top > innerHeight) continue;
          if (cs.objectFit !== 'fill') continue;              // cover / contain never distort
          // rotation or mirroring keeps the ratio; use the layout box (offsetWidth/Height), not the transformed rect
          const rw = img.offsetWidth, rh = img.offsetHeight, a = rw / rh, n = img.naturalWidth / img.naturalHeight;
          if (Math.abs(a / n - 1) > 0.01) res.bad.push(`${img.getAttribute('src')} ${rw}x${rh} (natural ${img.naturalWidth}x${img.naturalHeight})`);
        }
        return res;
      });
      if (m.sw > w) overflow.push({ y, scrollWidth: m.sw });
      m.bad.forEach(b => stretched.set(b.split(' ')[0], b));
      if (y + h >= total - 2 || i > 60) break;
      y = Math.min(y + Math.round(h * 0.9), total - h);
      i++;
    }
    report[name] = { viewport: [w, h], pageHeight: total, horizontalOverflow: overflow, stretchedImages: [...stretched.values()], consoleErrors: [...new Set(errors)], shots };
    console.log(name, 'height', total, 'overflow', overflow.length, 'stretched', stretched.size, 'errors', errors.length);
    await page.close();
  }
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  server.close();
}
main().catch(e => { console.error(e); process.exit(1); });
