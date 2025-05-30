import coreRules from './rules.json';

export async function loadRules(): Promise<any[]> {
  // Core-Regeln
  return coreRules;
}