const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Add TopNavBar import
content = content.replace(
  "import { Sidebar } from './components/layout/Sidebar';",
  "import { TopNavBar } from './components/layout/TopNavBar';"
);

// We want to replace everything from <header className="border-b border-white/5...
// down to <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 overflow-hidden">
const startRegex = /<header className="border-b border-white\/5 bg-slate-900\/40 backdrop-blur-md sticky top-0 z-30 shadow-lg shadow-black\/20">/;
const endRegex = /<main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 overflow-hidden">/;

const startIndex = content.search(startRegex);
const endIndexMatch = content.match(endRegex);

if (startIndex !== -1 && endIndexMatch) {
  const endIndex = endIndexMatch.index + endIndexMatch[0].length;
  
  const replacement = `
      <TopNavBar />
      <main className="mt-24 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto space-y-gutter">
  `;
  
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  
  // Now remove the closing </div> for the flex wrapper that contained Sidebar
  // It was immediately after </main>
  content = content.replace(/<\/main>[\s\n]*<\/div>/, '</main>');
  
  fs.writeFileSync(appPath, content);
  console.log("Successfully replaced layout in App.tsx");
} else {
  console.log("Could not find layout bounds");
}
