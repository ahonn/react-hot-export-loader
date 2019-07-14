const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

const reactHotLoaderIdentfierName = 'hot';
const parseOptions = { sourceType: 'module', plugins: ['jsx'] };

const importReactHotLoaderDeclaration = t.importDeclaration(
  [t.importSpecifier(t.identifier(reactHotLoaderIdentfierName), t.identifier('hot'))],
  t.stringLiteral('react-hot-loader')
);

function callHotModuleExpression(args) {
  return t.callExpression(t.callExpression(t.identifier('hot'), [t.identifier('module')]), args);
}

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

function ReactHotEntryLoader(source) {
  if (process.env.NODE_ENV === 'production' || source === '') {
    return source;
  }

  const ast = parse(source, parseOptions);
  ast.program.body.unshift(importReactHotLoaderDeclaration);

  traverse(ast, {
    ExportDefaultDeclaration: (path) => {
      path.node.declaration = callHotModuleExpression([path.node.declaration]);
    },
    ExpressionStatement: (path) => {
      const { expression } = path.node;
      if (expression.operator === '=' && isModuleExport(expression.left)) {
        path.node.expression.right = callHotModuleExpression([path.node.expression.right]);
      }
    },
  });

  const { code } = generate(ast);

  return code;
}

module.exports = ReactHotEntryLoader;
