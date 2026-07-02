const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  const tableRegex = /(<table[^>]*>[\s\S]*?<\/table>)/gi;
  
  content = content.replace(tableRegex, (match, tableContent, offset, fullString) => {
    // check if it's already wrapped in overflow-x-auto
    const beforeTable = fullString.substring(Math.max(0, offset - 100), offset);
    if (beforeTable.includes('overflow-x-auto')) {
      return match;
    }
    // Also skip TableSkeleton
    if (file.includes('TableSkeleton.tsx')) {
       return match;
    }
    return `<div className="overflow-x-auto w-full">\n${match}\n</div>`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
    modifiedCount++;
  }
});

console.log(`Modified ${modifiedCount} files.`);
