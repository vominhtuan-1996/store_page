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
const nodeId = '253:259'; // Notification

async function analyzeNode() {
  try {
    const response = await fetch(`${FIGMA_API_BASE}/files/${fileKey}/nodes?ids=${nodeId}`, {
      headers: { 'X-Figma-Token': token },
    });
    const data = await response.json();
    console.log(JSON.stringify(data.nodes[nodeId].document, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

analyzeNode();
