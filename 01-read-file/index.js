const fs=require('fs');
const path=require('path');
const textPath=path.join(__dirname,'text.txt');
const readable = fs.createReadStream(textPath, 'utf8');
readable.on('data', (chunk) => {process.stdout.write(chunk);});


