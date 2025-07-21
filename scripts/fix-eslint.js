const fs = require('fs');
const path = require('path');

// Các lỗi ESLint phổ biến cần sửa
const fixes = [
  // Xóa unused imports
  {
    pattern: /import\s+\{[^}]*useAuth[^}]*\}\s+from\s+['"]@\/hooks\/useAuth['"];?\s*$/gm,
    replacement: "// import { useAuth } from '@/hooks/useAuth';",
  },
  {
    pattern: /import\s+\{[^}]*useMediaQuery[^}]*\}\s+from\s+['"]@mui\/material['"];?\s*$/gm,
    replacement: "// import { useMediaQuery } from '@mui/material';",
  },
  {
    pattern: /import\s+\{[^}]*useTranslations[^}]*\}\s+from\s+['"]next-intl['"];?\s*$/gm,
    replacement: "// import { useTranslations } from 'next-intl';",
  },
  {
    pattern: /import\s+\{[^}]*Divider[^}]*\}\s+from\s+['"]@mui\/material['"];?\s*$/gm,
    replacement: "// import { Divider } from '@mui/material';",
  },
  {
    pattern: /import\s+\{[^}]*Image[^}]*\}\s+from\s+['"]next\/image['"];?\s*$/gm,
    replacement: "// import { Image } from 'next/image';",
  },
  {
    pattern: /import\s+\{[^}]*RefreshIcon[^}]*\}\s+from\s+['"]@mui\/icons-material['"];?\s*$/gm,
    replacement: "// import { RefreshIcon } from '@mui/icons-material';",
  },

  // Comment out unused variables
  {
    pattern: /const\s+(\w+)\s*=\s*useState\([^)]+\);?\s*\/\/\s*unused/gm,
    replacement: '// const $1 = useState(...); // unused',
  },

  // Fix any types
  {
    pattern: /:\s*any\s*([,)]|$)/g,
    replacement: ': unknown$1',
  },

  // Fix img tags to use Next.js Image
  {
    pattern: /<img\s+([^>]*)\/>/g,
    replacement: '<Image $1 />',
  },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    fixes.forEach(fix => {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixFile(filePath);
    }
  });
}

// Bắt đầu từ thư mục src
const srcDir = path.join(__dirname, '..', 'src');
console.log('Fixing ESLint errors...');
walkDir(srcDir);
console.log('Done!');
