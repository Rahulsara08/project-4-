// Development helper: screenshot one part of the page at a given size.
//   node scripts/shot.js <out.png> <width> <height> <elementId> [offsetFromElementTop=0] [waitMs=1500]
const http = require('http'), fs = require('fs'), puppeteer = require('puppeteer-core');
const [out, w, h, id, off = '0', wait = '1500'] = process.argv.slice(2);
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => fs.existsSync(p));
(async () => {
  const server = http.createServer(require('../server.js')).listen(0);
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.setViewport({ width: +w, height: +h, isMobile: +w < 768, hasTouch: +w < 1024 });
  await page.goto(`http://localhost:${server.address().port}/index.html?to=Rahul%20Sharma#op-skip`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2500));
  const info = await page.evaluate(async (id, off) => {
    const el = document.getElementById(id); scrollTo(0, scrollY + el.getBoundingClientRect().top + off);
    return { real: !!document.querySelector('.p4-stage.real') };
  }, id, +off);
  await new Promise(r => setTimeout(r, +wait));
  await page.screenshot({ path: out });
  console.log(JSON.stringify({ ...info, errors: errs }));
  await browser.close(); server.close();
})().catch(e => { console.error(e); process.exit(1); });
