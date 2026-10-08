// Builds index.html from src/index.html by inlining the section partials:
//   <!-- @include sections/01-hero.html -->
// Run: npm run build   (npm start runs it automatically)
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

function build() {
  const template = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  const html = template.replace(/<!-- @include ([\w./-]+) -->/g, (_, file) => {
    const full = path.join(SRC, file);
    if (!fs.existsSync(full)) throw new Error(`Missing section: src/${file}`);
    return fs.readFileSync(full, 'utf8').trimEnd();
  });
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
  return html.length;
}

if (require.main === module) {
  const size = build();
  console.log(`Built index.html (${(size / 1024).toFixed(1)} KB)`);
}

module.exports = build;
