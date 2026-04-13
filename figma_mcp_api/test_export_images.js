import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const token = process.env.FIGMA_ACCESS_TOKEN;
const fileKey = 'MO4JcMsNudV8vtIwmCPGoc';
const nodeIds = '253:18,253:259,257:80'; // scan-qrcode, notification, search-object

async function exportImages() {
  try {
    const response = await fetch(`${FIGMA_API_BASE}/images/${fileKey}?ids=${nodeIds}&format=png&scale=2`, {
      headers: { 'X-Figma-Token': token },
    });
    
    const data = await response.json();
    if (data.err) {
      console.error('Error:', data.err);
      return;
    }
    console.log('--- Image URLs ---');
    console.log(JSON.stringify(data.images, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

exportImages();
