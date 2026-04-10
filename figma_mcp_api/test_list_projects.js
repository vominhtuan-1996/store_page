import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const token = process.env.FIGMA_ACCESS_TOKEN;
const teamId = '1270431951558180290';

async function listProjects() {
  try {
    const url = `${FIGMA_API_BASE}/teams/${teamId}/projects`;
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Error:', err);
      process.exit(1);
    }

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Fatal Error:', error.message);
    process.exit(1);
  }
}

listProjects();
