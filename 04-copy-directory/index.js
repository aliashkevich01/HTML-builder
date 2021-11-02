const fs = require('fs/promises');
const fsPromises = require('fs/promises');
const path = require('path');

const newFolderPath = path.join(__dirname, 'files-copied');
const baseFolderPath = path.join(__dirname, 'files');

async function copyFolder() {
  try {
    await fsPromises.access(newFolderPath, fs.constants.W_OK);
    const oldCopyFiles = await fsPromises.readdir(newFolderPath);
    oldCopyFiles.forEach(async (file) => {
      const pathToFile = path.join(newFolderPath, file);
      fsPromises.unlink(pathToFile);
    });
  } catch {
    await fsPromises.mkdir(newFolderPath, { recursive: true });
  }

  const files = await fsPromises.readdir(baseFolderPath);

  files.forEach(async (file) => {
    const baseFile = path.join(__dirname, 'files', file);
    const newFile = path.join(__dirname, 'files-copied', file);
    await fsPromises.copyFile(baseFile, newFile);
  });
}

copyFolder();
