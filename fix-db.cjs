const fs = require('fs');
const path = require('path');

const targetStr = `const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };`;
const replacement = `import { db } from '@/api/base44Client';`;

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir('./src');
let changed = 0;
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(targetStr)) {
        const newContent = content.replace(targetStr, replacement);
        fs.writeFileSync(file, newContent, 'utf8');
        changed++;
    }
});
console.log('Modified files: ' + changed);
