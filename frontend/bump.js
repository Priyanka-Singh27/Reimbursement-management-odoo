const fs = require('fs');
const path = require('path');

const d = path.join(__dirname, 'src');

function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(f => {
    const p = path.join(dir, f.name);
    return f.isDirectory() ? walk(p) : p;
  });
}

const files = walk(d).filter(f => f.endsWith('.tsx'));

console.log(`Found ${files.length} tsx files`);

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let original = c;
  
  c = c.replace(/text-\[(\d+)px\]/g, (match, p1) => {
    return `text-[${parseInt(p1) + 1}px]`;
  });
  
  c = c.replace(/\btext-5xl\b/g, 'text_TMP6')
       .replace(/\btext-4xl\b/g, 'text_TMP5')
       .replace(/\btext-3xl\b/g, 'text_TMP4')
       .replace(/\btext-2xl\b/g, 'text_TMP3')
       .replace(/\btext-xl\b/g, 'text_TMP2')
       .replace(/\btext-lg\b/g, 'text_TMP1')
       .replace(/\btext-base\b/g, 'text-lg');
       
  c = c.replace(/text_TMP6/g, 'text-6xl')
       .replace(/text_TMP5/g, 'text-5xl')
       .replace(/text_TMP4/g, 'text-4xl')
       .replace(/text_TMP3/g, 'text-3xl')
       .replace(/text_TMP2/g, 'text-2xl')
       .replace(/text_TMP1/g, 'text-xl');

  if (c !== original) {
    fs.writeFileSync(f, c);
    console.log(`Updated ${f}`);
  }
});
