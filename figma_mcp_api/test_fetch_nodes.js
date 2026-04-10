import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const token = process.env.FIGMA_ACCESS_TOKEN;
const fileKey = 'MO4JcMsNudV8vtIwmCPGoc';
const nodeId = '0:1'; // Trang sprint 1

async function fetchNodes() {
  try {
    const response = await fetch(`${FIGMA_API_BASE}/files/${fileKey}/nodes?ids=${nodeId}`, {
      headers: { 'X-Figma-Token': token },
    });
    
    if (!response.ok) {
      const err = await response.json();
      console.error('Error:', JSON.stringify(err, null, 2));
      return;
    }

    const data = await response.json();
    const nodeData = data.nodes[nodeId];
    if (!nodeData) {
      console.log(`Node ${nodeId} not found.`);
      return;
    }
    const page = nodeData.document;
    
    console.log(`--- Nodes on Page: ${page.name} ---`);
    if (page.children) {
      page.children.forEach(child => {
        console.log(`- [${child.type}] ${child.name} (ID: ${child.id})`);
      });
    } else {
      console.log('No elements found on this page.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchNodes();
