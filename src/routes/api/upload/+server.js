// src/routes/api/upload/+server.js
import fs from 'fs';
import path from 'path';
import { json } from '@sveltejs/kit';
import sharp from 'sharp';
import JSZip from 'jszip';

export async function POST({ request }) {
  const formData = await request.formData();
  const images = formData.getAll('images');
  const widths = formData.getAll('widths').map(Number);

  const zip = new JSZip();
  const outputDir = 'static/output';

  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }

  fs.mkdirSync(outputDir, { recursive: true });

  for (const image of images) {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = path.extname(image.name).toLowerCase();

    const originalMetadata = await sharp(buffer).metadata();
    const originalWidth = originalMetadata.width;

    // Add the original file to the zip
    zip.file(`${path.parse(image.name).name}-original${ext}`, buffer);

    for (const width of widths) {
      if (width < originalWidth) {
        const resizedBuffer = await sharp(buffer).resize({ width }).toBuffer();
        const filename = `${path.parse(image.name).name}--${width}w${ext}`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, resizedBuffer);
        zip.file(filename, resizedBuffer);
      }
    }
  }

  const zipPath = path.join(outputDir, 'image-derivates.zip');
  fs.writeFileSync(zipPath, await zip.generateAsync({ type: 'nodebuffer' }));

  return json({ zipPath: `/output/image-derivates.zip` });
}