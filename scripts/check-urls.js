#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// URLs cần thay thế
const URL_REPLACEMENTS = {
  'http://localhost:5000': 'https://nidas-be.onrender.com',
  'ws://localhost:5000': 'wss://nidas-be.onrender.com',
  'ws://localhost:3001': 'wss://nidas-be.onrender.com',
      'http://localhost:3000': 'https://nidas-fe.vercel.app'
};

// Thư mục cần kiểm tra
const SEARCH_DIRS = [
  'src',
  'app'
];

// Extensions cần kiểm tra
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function checkAndReplaceUrls(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      checkAndReplaceUrls(fullPath);
    } else if (EXTENSIONS.some(ext => file.name.endsWith(ext))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const [oldUrl, newUrl] of Object.entries(URL_REPLACEMENTS)) {
        if (content.includes(oldUrl)) {
          console.log(`Found ${oldUrl} in ${fullPath}`);
          content = content.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

console.log('Checking for localhost URLs...');
SEARCH_DIRS.forEach(dir => {
  if (fs.existsSync(dir)) {
    checkAndReplaceUrls(dir);
  }
});
console.log('URL check completed!'); 