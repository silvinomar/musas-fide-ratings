import { fetchFideProfile } from './fetcher.js';
import { parseFideProfile } from './parser.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fideIdsPath = path.resolve(__dirname, '../src/data/musas-fideIds.js');
const fideIdsUrl = pathToFileURL(fideIdsPath).href;
const { default: fideIds } = await import(fideIdsUrl);
const outputPath = path.resolve(__dirname, '../src/data/musas-data.json');

const fetchAndSaveProfiles = async () => {
  const results = {};

  for (const fideId of fideIds) {
    try {
      const profileHtml = await fetchFideProfile(fideId);
      const parsedData = parseFideProfile(profileHtml, fideId);
      console.log('Parsed Data:', parsedData);
      Object.assign(results, parsedData);
    } catch (error) {
      console.error(`Error processing ID ${fideId}:`, error.message);
    }
  }

  console.log('Final Results Before Save:', results);
  await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
  console.log(`Data saved to ${outputPath}`);
};

fetchAndSaveProfiles();
