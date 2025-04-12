import { fetchFideProfile } from './fetcher.js';
import { parseFideProfile } from './parser.js';
import fs from 'fs/promises';

// Load FIDE IDs from an external file
import fideIds from '../src/data/musas-fideIds.js'; 

const fetchAndSaveProfiles = async () => {
  const results = {};

  for (const fideId of fideIds) {
    try {
      const profileHtml = await fetchFideProfile(fideId);
      const parsedData = parseFideProfile(profileHtml, fideId);
      console.log('Parsed Data:', parsedData); // Check parsed data
      Object.assign(results, parsedData);
    } catch (error) {
      console.error(`Error processing ID ${fideId}:`, error.message);
    }
  }

  console.log('Final Results Before Save:', results); // Check final results
  await fs.writeFile('../src/data/musas-data.json', JSON.stringify(results, null, 2));
  console.log('Data saved to ../src/data/musas-data.json');
};


fetchAndSaveProfiles();
