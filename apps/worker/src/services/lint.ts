import HTMLHint from "htmlhint";
import stylelint from "stylelint";
import { ESLint } from "eslint";

interface SubmissionContext {
  repositoryUrl: string | null;
}

export async function lintHtml(submission: SubmissionContext) {
  const htmlResults = HTMLHint.verify("<html></html>", {});
  const cssResults = await stylelint.lint({ code: "body { color: red; }" });
  const eslint = new ESLint({ useEslintrc: false, baseConfig: { extends: ["eslint:recommended"] } });
  const jsResults = await eslint.lintText("const a = 1");
  return {
    html: htmlResults,
    css: cssResults.results,
    js: jsResults
  };
}
