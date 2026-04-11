import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const fileKey = 'MO4JcMsNudV8vtIwmCPGoc';
const token = process.env.FIGMA_ACCESS_TOKEN;

async function getFileData() {
  try {
    const response = await fetch(`${FIGMA_API_BASE}/files/${fileKey}?depth=1`, {
      headers: { 'X-Figma-Token': token },
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Error:', JSON.stringify(err, null, 2));
      return;
    }

    const data = await response.json();
    console.log('--- File Info ---');
    console.log(`Name: ${data.name}`);
    console.log(`Last Modified: ${data.lastModified}`);
    console.log('--- Pages ---');
    data.document.children.forEach(page => {
      console.log(`- ${page.name} (ID: ${page.id})`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getFileData();
