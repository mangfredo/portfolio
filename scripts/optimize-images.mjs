import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const PUBLIC_DIR = './public';

async function optimizeImages() {
  const files = await readdir(PUBLIC_DIR);
  
  for (const file of files) {
    const filePath = join(PUBLIC_DIR, file);
    const fileStat = await stat(filePath);
    
    if (!fileStat.isFile()) continue;
    
    const ext = file.toLowerCase().split('.').pop();
    
    // Optimize profile.jpg
    if (file === 'profile.jpg') {
      console.log(`Optimizing ${file}...`);
      const originalSize = fileStat.size;
      
      await sharp(filePath)
        .resize(400, 400, { fit: 'cover' })
        .jpeg({ quality: 85, progressive: true })
        .toFile(join(PUBLIC_DIR, 'profile-optimized.jpg'));
      
      // Replace original
      await sharp(join(PUBLIC_DIR, 'profile-optimized.jpg'))
        .toFile(join(PUBLIC_DIR, 'profile-new.jpg'));
      
      const newStat = await stat(join(PUBLIC_DIR, 'profile-optimized.jpg'));
      console.log(`  ${file}: ${(originalSize / 1024).toFixed(1)}KB -> ${(newStat.size / 1024).toFixed(1)}KB`);
    }
    
    // Convert PNGs to WebP
    if (ext === 'png' && file.startsWith('numerra')) {
      console.log(`Converting ${file} to WebP...`);
      const originalSize = fileStat.size;
      const webpPath = filePath.replace('.png', '.webp');
      
      await sharp(filePath)
        .webp({ quality: 85 })
        .toFile(webpPath);
      
      const newStat = await stat(webpPath);
      console.log(`  ${file}: ${(originalSize / 1024).toFixed(1)}KB -> ${(newStat.size / 1024).toFixed(1)}KB (WebP)`);
    }
  }
  
  console.log('\nDone! Now update your code to use the optimized images.');
  console.log('- Rename profile-optimized.jpg to profile.jpg');
  console.log('- Update numerra references from .png to .webp');
}

optimizeImages().catch(console.error);
