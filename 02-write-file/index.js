const fs=require('fs');
const path=require('path');
const readline = require('readline');
const process = require('process');
const input = process.stdin;
const output = process.stdout;
const textPath = path.join(__dirname, 'text.txt');
let writeableStream = fs.createWriteStream(textPath);
const rline = readline.createInterface({input, output});
setTimeout(()=>{rline.write('Please, input text (for ruin the process write exit or check combination CTLR+C):\n');},100);
rline.addListener('line', (input)=>{if(input=='exit'){process.exit(0);}writeableStream.write(input + '\n');});

rline.addListener('close', () => { process.exit(0);});