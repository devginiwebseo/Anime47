import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_UPLOAD_DIR = path.join(process.cwd(), 'public', 'upload', 'image');

async function main() {
  console.log("Checking for corrupted HTML images in the upload folder...");
  
  let corruptedCount = 0;
  
  // Recursively find all files in upload directory
  function scanDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else {
        // Check if file is small enough to be a 403 or HTML page
        if (stat.size < 100000) { // arbitrary size limit
          try {
             const buffer = fs.readFileSync(fullPath);
             const text = buffer.toString('utf-8', 0, Math.min(stat.size, 500)).toLowerCase();
             if (text.includes('<!doctype html>') || text.includes('<html') || stat.size === 0) {
               console.log(`Corrupted file found: ${fullPath}`);
               corruptedCount++;
               
               // Delete the file
               fs.unlinkSync(fullPath);
               
               // Get relative path for DB
               const relativePath = '/' + path.relative(path.join(process.cwd(), 'public'), fullPath).replace(/\\/g, '/');
               
               // Find any stories using this image and reset them so crawler will redownload
               prisma.stories.updateMany({
                 where: { coverImage: relativePath },
                 data: { coverImage: null }
               }).then(res => {
                 if (res.count > 0) {
                   console.log(`  -> Reset coverImage for ${res.count} stories in DB.`);
                 }
               });
             }
          } catch(e) {}
        }
      }
    }
  }

  scanDir(BASE_UPLOAD_DIR);
  
  console.log(`\nScan complete. Found and deleted ${corruptedCount} corrupted image files.`);
  console.log(`Please run your crawler again (e.g. npx tsx scripts/crawl-anime.ts) to re-download these images properly.`);
  
  // wait for DB queries to finish
  setTimeout(async () => {
    await prisma.$disconnect();
  }, 2000);
}

main().catch(console.error);
