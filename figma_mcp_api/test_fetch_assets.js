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

async function fetchAssets() {
  try {
    // Fetch Components
    const compRes = await fetch(`${FIGMA_API_BASE}/files/${fileKey}/components`, {
      headers: { 'X-Figma-Token': token },
    });
    const comps = await compRes.json();

    // Fetch Styles
    const styleRes = await fetch(`${FIGMA_API_BASE}/files/${fileKey}/styles`, {
      headers: { 'X-Figma-Token': token },
    });
    const styles = await styleRes.json();

    console.log('--- Components Found ---');
    (comps.meta?.components || []).slice(0, 10).forEach(c => console.log(`- ${c.name}`));
    if (comps.meta?.components?.length > 10) console.log(`... and ${comps.meta.components.length - 10} more.`);

    console.log('\n--- Styles Found ---');
    (styles.meta?.styles || []).slice(0, 10).forEach(s => console.log(`- ${s.name} (${s.style_type})`));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchAssets();
