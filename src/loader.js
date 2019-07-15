const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const loaderUtils = require('loader-utils');

const DEFAULT_IDENTIFIER = '__HOT__';
const parseOptions = { sourceType: 'module', plugins: ['jsx'] };

function isModuleExport(node) {
  if (t.isMemberExpression(node)) {
    return (
      t.isIdentifier(node.object) &&
      node.object.name === 'module' &&
      t.isIdentifier(node.property) &&
      node.property.name === 'exports'
    );
  }
  return false;
}

function ReactHotExportLoader(source) {
  const options = loaderUtils.getOptions(this) || {};
  const { identifier = DEFAULT_IDENTIFIER, filter } = options;

  const isProductionEnv = () => process.env.NODE_ENV === 'production';
  const shouldSkip = () => typeof filter === 'function' && !filter(this);

  if (!source || isProductionEnv() || shouldSkip()) {
    return source;
  }

  const ast = parse(source, parseOptions);

  // insert `import { hot as ${identifier} } from 'react-hot-loader';`
  const importReactHotLoaderDeclaration = t.importDeclaration(
    [t.importSpecifier(t.identifier(identifier), t.identifier('hot'))],
    t.stringLiteral('react-hot-loader')
  );
  ast.program.body.unshift(importReactHotLoaderDeclaration);

  traverse(ast, {
    // change `export default xxx` to `export default ${identifier}(module)(xxx)`
    ExportDefaultDeclaration: (path) => {
      path.node.declaration = t.callExpression(
        t.callExpression(t.identifier(identifier), [t.identifier('module')]),
        [path.node.declaration]
      );
    },
    // change `module.exports = xxx` to `module.exports = ${identifier}(module)(xxx)`
    ExpressionStatement: (path) => {
      const { expression } = path.node;
      if (expression.operator === '=' && isModuleExport(expression.left)) {
        path.node.expression.right = t.callExpression(
          t.callExpression(t.identifier(identifier), [t.identifier('module')]),
          [path.node.expression.right]
        );
      }
    },
  });

  const { code } = generate(ast);
  return code;
}

module.exports = ReactHotExportLoader;
