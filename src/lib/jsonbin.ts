import type { Script, Character } from '../types';

export interface SharedData {
  customScripts: Script[];
  customCharacters: Character[];
}

// JSONBin.io credentials
// API key stored as base64 in .env to avoid issues with $ in dotenv
const API_KEY = atob(import.meta.env.VITE_JSONBIN_API_KEY_B64 as string);
const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID as string;
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

console.log(API_KEY)

const HEADERS = {
  'Content-Type': 'application/json',
  'X-Master-Key': API_KEY,
};

export async function loadSharedData(): Promise<SharedData> {
  const res = await fetch(`${BASE_URL}/latest`, { headers: HEADERS });
  if (!res.ok) throw new Error(`JSONBin GET error: ${res.status}`);
  const json = await res.json();
  return json.record as SharedData;
}

export async function saveSharedData(data: SharedData): Promise<void> {
  const res = await fetch(BASE_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`JSONBin PUT error: ${res.status}`);
}
