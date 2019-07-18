import fs from 'fs';
import path from 'path';
import prettier from 'prettier';

import compiler from './helpers/compiler.js';

const format = (code) => prettier.format(code, { parser: 'babel' });

async function testLoaderFixture(fixture) {
  const stats = await compiler(path.join(fixture, 'input.js'));
  const { modules } = stats.toJson();

  const output = modules[modules.length - 1].source;
  const correct = fs.readFileSync(path.join(fixture, 'output.js'), 'utf-8');
  console.log(output);
  expect(format(output)).toBe(format(correct));
}

test('should inserts to the basic code sinppet', async () => {
  const fixture = path.join(__dirname, './fixtures/basic');
  await testLoaderFixture(fixture);
});
