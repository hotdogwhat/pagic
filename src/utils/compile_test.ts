import { asserts, path } from '../../deps.ts';

import { compile, compileFile, compilePagicFile } from './compile.ts';

Deno.test('[compile] should remove types', () => {
  const input = `const foo: number = 1;`;
  const output = compile(input);
  asserts.assertEquals(output, 'const foo = 1;\n');
});
Deno.test('[compile] should replace `.tsx` to `.js` in `import` statement', () => {
  const input = `
import foo from './foo.ts';
import bar from './_bar.tsx';
console.log(foo, bar);
  `;
  const output = compile(input);
  asserts.assertEquals(output, `import foo from './foo.js';\nimport bar from './_bar.js';\nconsole.log(foo, bar);\n`);
});
Deno.test('[compile] should remove specific imports', () => {
  const input = `
import { React, ReactDOM, t } from 'https://deno.land/x/pagic/mod.ts';

ReactDOM.render(<div>{t('foo')}</div>, document.getElementById('foo'));
`;
  const output = compile(input);
  asserts.assertEquals(
    output,
    `ReactDOM.render(React.createElement("div", null, t('foo')), document.getElementById('foo'));\n`,
  );
});
Deno.test('[compile] should keep other imports', () => {
  const input = `
import { React, ReactDOM, t, Pagic } from 'https://deno.land/x/pagic/mod.ts';

console.log(Pagic);
ReactDOM.render(<div>{t('foo')}</div>, document.getElementById('foo'));
`;
  const output = compile(input);
  asserts.assertEquals(
    output,
    `import { Pagic } from 'https://deno.land/x/pagic/mod.js';
console.log(Pagic);
ReactDOM.render(React.createElement("div", null, t('foo')), document.getElementById('foo'));
`,
  );
});
Deno.test('[compileFile] should read input file and compile it', async () => {
  const output = await compileFile(path.resolve(Deno.cwd(), 'test/fixtures/react_dom_render_foo.tsx'));
  asserts.assertEquals(
    output,
    `// @ts-ignore\nReactDOM.render(React.createElement("div", null), document.getElementById('foo'));\n`,
  );
});
Deno.test('[compilePagicFile] should compile the input pagic file', async () => {
  const output = await compilePagicFile('test/fixtures/react_dom_render_foo.tsx');
  asserts.assertEquals(
    output,
    `// @ts-ignore\nReactDOM.render(React.createElement("div", null), document.getElementById('foo'));\n`,
  );
});
