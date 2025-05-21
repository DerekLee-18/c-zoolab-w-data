// utils/cleanRootData.js
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'data');
const rootDir = process.cwd();

// Read all JSON files in /data
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

for (const filename of files) {
  const rootPath = path.join(rootDir, filename);
  if (fs.existsSync(rootPath)) {
    fs.unlinkSync(rootPath);
    console.log(`Deleted root copy: ${filename}`);
  }
}
