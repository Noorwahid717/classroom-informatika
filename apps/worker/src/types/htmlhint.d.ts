declare module "htmlhint" {
  interface VerifyOptions {
    [rule: string]: unknown;
  }

  interface Hint {
    rule: string;
    message: string;
    evidence: string;
    line: number;
    col: number;
  }

  interface HTMLHintModule {
    verify(source: string, ruleset?: VerifyOptions): Hint[];
  }

  const htmlHint: HTMLHintModule;
  export default htmlHint;
}
