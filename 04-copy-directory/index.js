const fs = require('fs');
const path = require('path');

const { access } = require('fs');
const { mkdir } = require('fs');

const { readdir } = require('fs/promises');
const { copyFile } = require('fs/promises');
const { rm } = require('fs/promises');

const fsPromises = fs.promises;

access(path.join(__dirname, 'files-copied'), (err) => {
  if (err) {
    createFolder();
    copyFiles();
  } else {
    removeFiles('files-copied').then(copyFiles());
  }
});

function createFolder() {
  mkdir(path.join(__dirname, 'files-copied'), { recursive: true }, (err) => {
    if (err) {
      throw err;
    }
  });
}

async function removeFiles(dir) {
  const files = await readdir(path.join(__dirname, dir));
  for (const file of files) {
    const currentPathToFile = path.join(__dirname, dir, file);
    await rm(currentPathToFile, { recursive: true, force: true });
  }
  return;
}

async function copyFiles() {
  const files = await readdir(path.join(__dirname, 'files'));
  for (const file of files) {
    const currentPath = path.join(__dirname, 'files', file);
    const pathToCopy = path.join(__dirname, 'files-copied', file);
    const fileStats = await fsPromises.stat(currentPath);
    if (fileStats.isFile()) {
      await copyFile(currentPath, pathToCopy);
    }
  }
}