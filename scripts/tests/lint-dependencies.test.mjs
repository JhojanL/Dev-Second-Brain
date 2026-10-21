import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const markdownlintRequire = createRequire(import.meta.resolve('markdownlint'));

test('the lint math extension renders inline and block expressions with the KaTeX override', async () => {
  const { micromark } = await import(markdownlintRequire.resolve('micromark'));
  const { math, mathHtml } = await import(markdownlintRequire.resolve('micromark-extension-math'));
  const html = micromark('Inline $E = mc^2$.\n\n$$\nx^2 + y^2 = z^2\n$$\n', {
    extensions: [math()], htmlExtensions: [mathHtml({ trust: false })],
  });
  assert.match(html, /<math\b/);
  assert.match(html, /display="block"/);
  assert.ok(html.includes('E = mc^2'));
  assert.ok(html.includes('x^2 + y^2 = z^2'));
  assert.ok(!html.includes('katex-error'), 'Both math forms must render without a KaTeX error.');
});
