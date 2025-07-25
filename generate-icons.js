const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];

async function generateIcons() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, 'icons', 'icon.svg'));
  
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, 'icons', `icon${size}.png`));
    
    console.log(`Generated ${size}x${size} icon`);
  }
}

generateIcons().catch(console.error); 