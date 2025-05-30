export class RuleEngine {
    constructor(rules) {
        this.rules = [];
        this.rules = rules;
    }
    evaluate(context) {
        const results = [];
        for (const rule of this.rules) {
            let hit = false;
            try {
                // eslint-disable-next-line no-new-func
                hit = Function(...Object.keys(context), `return (${rule.condition});`)(...Object.values(context));
            }
            catch (e) {
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
