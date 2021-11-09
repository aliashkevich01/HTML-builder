const fs = require('fs');
const fsProm = require('fs/promises');
const path = require('path');

const pathToCss = path.join(__dirname, 'styles');
const pathToHtml = path.join(__dirname, 'template.html');
const pathToAssets = path.join(__dirname, 'assets');
const pathToComponents = path.join(__dirname, 'components');
const pathToBuild = path.join(__dirname, 'project-dist');
const pathToCssBundle = path.join(__dirname, 'project-dist', 'style.css');
const pathToAssetsBundle = path.join(__dirname, 'project-dist', 'assets');
const pathToHtmlBundle = path.join(__dirname, 'project-dist', 'index.html');


async function cleanBundleFolder(pathBundle) {
  await fsProm.rm(pathBundle, { recursive: true, force: true });
  await fsProm.mkdir(pathBundle, { recursive: true });
}

async function createHtmlBundle() {
  const allFiles = await fsProm.readdir(pathToComponents);
  const files = allFiles.filter(file => path.extname(file) === '.html');
  const readable = fs.createReadStream(pathToHtml, 'utf8');
  readable.on('data', async (htmlTemplate) => {
    let htmlBundle = htmlTemplate.toString();
    for (const componentName of files) {
      const componentPath = path.join(pathToComponents, componentName);
      const component = await fsProm.readFile(componentPath);
      const name = path.basename(componentName, '.html');
      htmlBundle = htmlBundle.replace(`{{${name}}}`, component);
    }
    await fsProm.writeFile(pathToHtmlBundle, htmlBundle, 'utf8');
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

  const currentFile = path.resolve(pathToCss, files.pop());
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

async function copyAssets(pathBundle, pathSource) {
  await fsProm.mkdir(pathBundle, { recursive: true });
  const files = await fsProm.readdir(pathSource);

  files.forEach(async (file) => {
    const baseFile = path.join(pathSource, file);
    const newFile = path.join(pathBundle, file);
    const stat = await fsProm.stat(baseFile);
    if (stat.isDirectory()) {
      copyAssets(newFile, baseFile);
    } else {
      await fsProm.copyFile(baseFile, newFile);
    }
  });
}

async function buildPage() {
  await cleanBundleFolder(pathToBuild);
  createHtmlBundle();
  createCssBundle();
  copyAssets(pathToAssetsBundle, pathToAssets);
}

buildPage();