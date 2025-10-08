declare module 'htmlhint' {
  export interface HTMLHintRule {
    id: string;
    description: string;
    link?: string;
  }

  export interface HTMLHintMessage {
    type: string;
    line: number;
    col: number;
    rule: HTMLHintRule;
    message: string;
    raw: string;
  }

  export class HTMLHint {
    static verify(html: string, rules?: Record<string, boolean | string>): HTMLHintMessage[];
  }
}