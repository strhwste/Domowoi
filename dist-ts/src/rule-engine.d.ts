export type Rule = {
    id?: string;
    condition: string;
    message_key: string;
    priority: 'ok' | 'info' | 'warn' | 'alert';
};
export declare class RuleEngine {
    private rules;
    constructor(rules: Rule[]);
    evaluate(context: Record<string, any>): {
        message_key: string;
        priority: string;
    }[];
}
