export type Rule = {
  id?: string;
  condition: string; // Ausdruck als String
  message_key: string;
  priority: 'ok'|'info'|'warn'|'alert';
};

export class RuleEngine {
  private rules: Rule[] = [];

  constructor(rules: Rule[]) {
    this.rules = rules;
  }

  evaluate(context: Record<string, any>): {message_key: string; priority: string}[] {
    const results: any[] = [];
    for (const rule of this.rules) {
      let hit = false;
      try {
        // eslint-disable-next-line no-new-func
        hit = Function(...Object.keys(context), `return (${rule.condition});`)(...Object.values(context));
      } catch (e) {
        // Fehlerhafte Regel ignorieren
        continue;
      }
      if (hit) {
        results.push({ message_key: rule.message_key, priority: rule.priority });
      }
    }
    return results;
  }
}