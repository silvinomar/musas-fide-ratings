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

const PAUSE_BETWEEN_REQUESTS_MS = 300;
const PAUSE_BEFORE_SECOND_PASS_MS = 10000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Dados da execução anterior: usados como alternativa se um ID falhar de vez
const loadPreviousData = async () => {
  try {
    return JSON.parse(await fs.readFile(outputPath, 'utf8'));
  } catch {
    return {};
  }
};

// Processa uma lista de IDs e devolve os que falharam
const processIds = async (ids, results) => {
  const failed = [];

  for (const fideId of ids) {
    try {
      const profileHtml = await fetchFideProfile(fideId);
      const parsedData = parseFideProfile(profileHtml, fideId);
      console.log('Parsed Data:', parsedData);  
      Object.assign(results, parsedData);
      console.log(`OK ${fideId}\n`);
    } catch (error) {
      console.error(`Error processing ID ${fideId}:`, error.message);
      failed.push(fideId);
    }
    await sleep(PAUSE_BETWEEN_REQUESTS_MS);
  }

  return failed;
};

const fetchAndSaveProfiles = async () => {
  const previous = await loadPreviousData();
  const fresh = {};

  // 1.ª passagem
  let failed = await processIds(fideIds, fresh);

  // 2.ª passagem: tenta outra vez só os que falharam, depois de uma pausa
  if (failed.length > 0) {
    console.log(`\n${failed.length} ID(s) failed. Retrying them in ${PAUSE_BEFORE_SECOND_PASS_MS / 1000} s...`);
    await sleep(PAUSE_BEFORE_SECOND_PASS_MS);
    failed = await processIds(failed, fresh);
  }

  // Quem falhou de vez mantém os dados anteriores (se existirem) em vez de desaparecer
  const results = { ...previous, ...fresh };
console.log('Final Results Before Save:', results); 

  await fs.writeFile(outputPath, JSON.stringify(results, null, 2));

  console.log(`\nData saved to ${outputPath}`);
  console.log(`Updated: ${fideIds.length - failed.length}/${fideIds.length}`);
  if (failed.length > 0) {
    console.warn(`Not updated (kept previous data if available): ${failed.join(', ')}`);
  }
};

fetchAndSaveProfiles();
