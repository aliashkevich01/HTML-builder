const fs = require('fs');
const fsProm = require('fs/promises');
const path = require('path');

const pathToCss = path.join(__dirname, 'styles');
const pathToBundle = path.join(__dirname, 'project-dist', 'bundle.css');

async function createCSSBundle() {
  const allFiles = await fsProm.readdir(pathToCss);
  const cssFiles = allFiles.filter(file => path.extname(file) === '.css');
  const stream = fs.createWriteStream(pathToBundle, 'utf8');

  streamMerge(cssFiles, stream);
}

function streamMerge(files = [], fileWriteStream) {
  if (!files.length) {
    return fileWriteStream.end();
  }

  const currentFile = path.resolve(pathToCss, files.shift());
  const currentReadStream = fs.createReadStream(currentFile, 'utf8');

  currentReadStream.pipe(fileWriteStream, { end: false });
  currentReadStream.on('end', function () {
    fileWriteStream.write('\n');
    streamMerge(files, fileWriteStream);
  });

  currentReadStream.on('error', function (error) {
    console.error(error);
    fileWriteStream.close();
  });
}

createCSSBundle();