import fs from 'fs';
import path from 'path';

let files: string[] = [];
const buildDirectory = path.resolve(__dirname, '../../build');

const jsDirectory = path.resolve(buildDirectory, 'static/js');
const cssDirectory = path.resolve(buildDirectory, 'static/css');

if (fs.existsSync(jsDirectory)) {
  const jsFiles = fs
    .readdirSync(jsDirectory)
    .filter((file) => file.endsWith('.js'))
    .map((file) => `js:${file}`);
  files = [...files, ...jsFiles];
}

if (fs.existsSync(cssDirectory)) {
  const cssFiles = fs
    .readdirSync(cssDirectory)
    .filter((file) => file.endsWith('.css'))
    .map((file) => `css:${file}`);
  files = [...files, ...cssFiles];
}

fs.writeFileSync(path.resolve(buildDirectory, 'files.txt'), files.join('\n'));
