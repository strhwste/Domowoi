export class RuleEngine {
    constructor(rules) {
        this.rules = [];
        this.rules = rules;
        console.log('[RuleEngine] Initialized with', rules.length, 'rules');
    }
    evaluate(context) {
        // Debug: log available context
        console.log('[RuleEngine] Evaluating rules with context:', context);
        const results = [];
        for (const rule of this.rules) {
            let hit = false;
            try {
                // eslint-disable-next-line no-new-func
                hit = Function(...Object.keys(context), `return (${rule.condition});`)(...Object.values(context));
                console.log(`[RuleEngine] Rule '${rule.id || rule.message_key}' (${rule.condition}) => ${hit}`);
            }
            catch (e) {
                console.warn(`[RuleEngine] Error evaluating rule '${rule.id || rule.message_key}':`, e);
                continue;
            }
            if (hit) {
                results.push({ message_key: rule.message_key, priority: rule.priority });
            }
        }
        console.log('[RuleEngine] Evaluation complete,', results.length, 'rules matched');
        return results;
    }
}
