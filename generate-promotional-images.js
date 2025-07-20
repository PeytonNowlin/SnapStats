const sharp = require('sharp');
const path = require('path');

async function generatePromotionalImages() {
  console.log('Generating promotional images...');
  
  const iconPath = path.join(__dirname, 'icons', 'icon128.png');
  
  try {
    // Small promotional tile (440x280)
    await sharp({
      create: {
        width: 440,
        height: 280,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite([
      {
        input: iconPath,
        top: 80,
        left: 170
      }
    ])
    .png()
    .toFile('promotional-images/small-tile.png');
    
    console.log('Small promotional tile created: promotional-images/small-tile.png');
    
    // Large promotional tile (920x680)
    await sharp({
      create: {
        width: 920,
        height: 680,
        channels: 4,
        background: { r: 248, g: 250, b: 252, alpha: 1 }
      }
    })
    .composite([
      {
        input: iconPath,
        top: 200,
        left: 396
      }
    ])
    .png()
    .toFile('promotional-images/large-tile.png');
    
    console.log('Large promotional tile created: promotional-images/large-tile.png');
    
    // Marquee promotional tile (1400x560)
    await sharp({
      create: {
        width: 1400,
        height: 560,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite([
      {
        input: iconPath,
        top: 180,
        left: 636
      }
    ])
    .png()
    .toFile('promotional-images/marquee-tile.png');
    
    console.log('Marquee promotional tile created: promotional-images/marquee-tile.png');
    
  } catch (error) {
    console.error('Error generating promotional images:', error);
  }
}

generatePromotionalImages(); 