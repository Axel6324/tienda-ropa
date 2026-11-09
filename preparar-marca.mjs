import {readFile, writeFile} from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const logo = await readFile(new URL('logo-imperio-lobos.jpg', root));
let mime;
if (logo[0] === 0xff && logo[1] === 0xd8 && logo[2] === 0xff) mime = 'image/jpeg';
else if (logo.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) mime = 'image/png';
else if (logo.subarray(0,4).toString() === 'RIFF' && logo.subarray(8,12).toString() === 'WEBP') mime = 'image/webp';
else throw new Error('El logo debe ser una imagen JPG, PNG o WebP válida.');
const uri = 'data:' + mime + ';base64,' + logo.toString('base64');
let source = await readFile(new URL('index.js', root), 'utf8');
for (const name of ['page','loginPage']) {
  const pattern = new RegExp('^const ' + name + ' = (.+);$', 'm');
  const match = source.match(pattern);
  if (!match) throw new Error('No se encontró el HTML de ' + name + '.');
  const html = JSON.parse(match[1]);
  let count = 0;
  const updated = html.replace(/(<img\b[^>]*\bdata-brand-logo\b[^>]*\bsrc=")[^"]*(")/g, (_match, start, end) => {count++; return start + uri + end;});
  if (!count) throw new Error('No se encontró el logo en ' + name + '.');
  source = source.replace(pattern, () => 'const ' + name + ' = ' + JSON.stringify(updated) + ';');
}
await writeFile(new URL('index.js',root), source);
console.log('Logo original incorporado en la aplicación y el ingreso.');
