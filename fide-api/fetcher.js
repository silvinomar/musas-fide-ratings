import fetch from 'node-fetch';
import https from 'https';

const MAX_RETRIES = 4;        // 5 tentativas no total
const TIMEOUT_MS = 20000;     // um pedido pendurado não bloqueia o script
const BASE_DELAY_MS = 1000;   // espera: 1 s, 2 s, 4 s, 8 s (+ aleatoriedade)

// Sem keep-alive: evita reutilizar ligações que a FIDE já fechou ("socket hang up")
const agent = new https.Agent({ keepAlive: false });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Erros que não vale a pena repetir (ex.: ID inexistente)
class PermanentError extends Error {}

const fetchOnce = async (url, fideId) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      agent,
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; musas-ratings-updater)' },
    });

    if (!response.ok) {
      const message = `Failed to fetch FIDE profile for ID: ${fideId} (HTTP ${response.status})`;
      // 429 e 5xx são temporários; os restantes 4xx não adianta repetir
      if (response.status === 429 || response.status >= 500) throw new Error(message);
      throw new PermanentError(message);
    }

    // O corpo também pode ser cortado a meio, por isso é lido dentro do try
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
};

export const fetchFideProfile = async (fideId) => {
  const url = `https://ratings.fide.com/profile/${fideId}/chart`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fetchOnce(url, fideId);
    } catch (error) {
      if (error instanceof PermanentError || attempt === MAX_RETRIES) throw error;

      const wait = BASE_DELAY_MS * 2 ** attempt + Math.random() * 300;
      console.warn(
        `ID ${fideId}: ${error.message} — attempt ${attempt + 1}/${MAX_RETRIES + 1}, retrying in ${Math.round(wait)} ms`
      );
      await sleep(wait);
    }
  }
};