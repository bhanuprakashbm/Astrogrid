const fs = require('fs');
const path = require('path');
const https = require('https');

const IMAGES = [
  {
    name: 'communication-satellite.webp',
    url: 'https://www.isro.gov.in/media_isro/image/Sapcecraft/commlarge.png.webp'
  },
  {
    name: 'earth-observation.webp',
    url: 'https://www.isro.gov.in/media_isro/image/Sapcecraft/eolarge.png.webp'
  },
  {
    name: 'scientific.webp',
    url: 'https://www.isro.gov.in/media_isro/image/Sapcecraft/scilarge.png.webp'
  },
  {
    name: 'navigation.webp',
    url: 'https://www.isro.gov.in/media_isro/image/Sapcecraft/navlarge.png.webp'
  },
  {
    name: 'experimental.webp',
    url: 'https://www.isro.gov.in/media_isro/image/Sapcecraft/srelarge.png.webp'
  },
  {
    name: 'small-satellite.webp',
    url: 'https://www.isro.gov.in/media_isro/image/Sapcecraft/smalllarge.png.webp'
  },
  {
    name: 'student-satellite.webp',
    url: 'https://www.isro.gov.in/media_isro/image/Sapcecraft/studlarge.png.webp'
  }
];

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const imagesDir = path.join(__dirname, '../public/images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const filePath = path.join(imagesDir, filename);
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      console.error(`Error downloading ${filename}:`, err.message);
      reject(err);
    });
  });
};

async function downloadAllImages() {
  try {
    for (const image of IMAGES) {
      await downloadImage(image.url, image.name);
    }
    console.log('All images downloaded successfully!');
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

downloadAllImages(); 