export class RuleEngine {
    constructor(rules) {
        this.rules = [];
        this.rules = rules;
    }
    evaluate(context) {
        if (!context || Object.keys(context).length === 0) {
            return [];
        }
        const paramNames = Object.keys(context);
        const paramValues = paramNames.map(name => context[name]);
        const debugEnabled = Boolean(context.debug);
        if (debugEnabled) {
            console.debug('[RuleEngine] Evaluating rules with context:', context);
        }
        const results = [];
        for (const rule of this.rules) {
            let hit = false;
            try {
                // eslint-disable-next-line no-new-func
                hit = Function(...paramNames, `return (${rule.condition});`)(...paramValues);
                if (debugEnabled) {
                    console.debug(`[RuleEngine] Rule '${rule.id || rule.message_key}' (${rule.condition}) => ${hit}`);
                }
            }
            catch (e) {
                if (debugEnabled) {
                    console.warn(`[RuleEngine] Error evaluating rule '${rule.id || rule.message_key}':`, e);
                }
                continue;
            }
            if (hit) {
                results.push({ message_key: rule.message_key, priority: rule.priority });
            }
        }
        if (debugEnabled) {
            console.debug('[RuleEngine] Evaluation complete,', results.length, 'rules matched');
        }
        return results;
    }
}
//# sourceMappingURL=rule-engine.js.map