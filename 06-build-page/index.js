const fs = require('fs');
const fsProm = require('fs/promises');
const path = require('path');

const pathToCss = path.join(__dirname, 'styles');
const pathToHtml = path.join(__dirname, 'template.html');
const pathToAssets = path.join(__dirname, 'assets');
const pathToComponents = path.join(__dirname, 'components');
const pathToCssBundle = path.join(__dirname, 'project-dist', 'style.css');
const pathToAssetsBundle = path.join(__dirname, 'project-dist', 'assets');
const pathToHtmlBundle = path.join(__dirname, 'project-dist', 'index.html');

let htmlFile = '';

async function cleanBundleFolder(pathBundle) {
  const files = await fsProm.readdir(pathBundle);

  files.forEach(async (file) => {
    const baseFile = path.join(pathBundle, file);
    const stat = await fsProm.stat(baseFile);
    if (stat.isDirectory()) {
      await cleanBundleFolder(baseFile);
    } else {
      await fsProm.rm(baseFile);
    }
  });
}

async function createHtmlBundle() {
  const articles = await fsProm.readFile(path.join(pathToComponents, 'articles.html'));
  const footer = await fsProm.readFile(path.join(pathToComponents, 'footer.html'));
  const header = await fsProm.readFile(path.join(pathToComponents, 'header.html'));

  const readable = fs.createReadStream(pathToHtml, 'utf8');

  readable.on('data', (chunk) => {
    htmlFile = chunk.toString().replace('{{header}}', header);
    htmlFile = htmlFile.replace('{{articles}}', articles);
    htmlFile = htmlFile.replace('{{footer}}', footer);
  });

  readable.on('end', async () => {
    await fsProm.writeFile(pathToHtmlBundle, htmlFile, 'utf8');
  });
}

async function createCssBundle() {
  const allFiles = await fsProm.readdir(pathToCss);
  const cssFiles = allFiles.filter(file => path.extname(file) === '.css');
  const stream = fs.createWriteStream(pathToCssBundle, 'utf8');

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
    fileWriteStream.write('\n\n');
    streamMerge(files, fileWriteStream);
  });

  currentReadStream.on('error', function (error) {
    console.error(error);
    fileWriteStream.close();
  });
}

async function crateBuildFolder() {
  const newFolderPath = path.join(__dirname, 'project-dist');
  await fsProm.mkdir(newFolderPath, { recursive: true });
  cleanBundleFolder(newFolderPath);
}

async function copyAssets(pathBundle, pathSource) {
  await fsProm.mkdir(pathBundle, { recursive: true });
  const assets = await fsProm.readdir(pathSource);

  assets.forEach(async (asset) => {
    const baseFile = path.join(pathSource, asset);
    const newFile = path.join(pathBundle, asset);
    const stat = await fsProm.stat(baseFile);
    if (stat.isDirectory()) {
      copyAssets(newFile, baseFile);
    } else {
      await fsProm.copyFile(baseFile, newFile);
    }
  });
}

async function buildSite() {
  await crateBuildFolder();
  createHtmlBundle();
  createCssBundle();
  copyAssets(pathToAssetsBundle, pathToAssets);
}

buildSite();