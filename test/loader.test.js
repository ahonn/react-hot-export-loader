import fs from 'fs';
import path from 'path';
import prettier from 'prettier';

import compiler from './helpers/compiler.js';

const format = (code) => prettier.format(code, { parser: 'babel' });

async function testLoaderFixture(fixture, options) {
  const stats = await compiler(path.join(fixture, 'input.js'), options);
  const { modules } = stats.toJson();

  const output = modules[modules.length - 1].source;
  const correct = fs.readFileSync(path.join(fixture, 'output.js'), 'utf-8');
  console.log(output);
  expect(format(output)).toBe(format(correct));
}

test('export default App', async () => {
  const fixture = path.join(__dirname, './fixtures/basic');
  await testLoaderFixture(fixture);
});

test('export default class App {}', async () => {
  const fixture = path.join(__dirname, './fixtures/class');
  await testLoaderFixture(fixture);
});

test('module.export = function App() {}', async () => {
  const fixture = path.join(__dirname, './fixtures/function');
  await testLoaderFixture(fixture);
});

test('options.identifier', async () => {
  const fixture = path.join(__dirname, './fixtures/identifier');
  await testLoaderFixture(fixture, { identifier: '__REACT_HOT_LOADER__' });
});

test('options.filter', async () => {
  const fixture = path.join(__dirname, './fixtures/filter');
  await testLoaderFixture(fixture, { filter: () => false });
});
