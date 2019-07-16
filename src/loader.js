const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const loaderUtils = require('loader-utils');

const DEFAULT_IDENTIFIER = '__HOT__';

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
  const { identifier = DEFAULT_IDENTIFIER, plugins = [], filter } = options;

  const isProductionEnv = () => process.env.NODE_ENV === 'production';
  const shouldSkip = () => typeof filter === 'function' && !filter(this);

  if (!source || isProductionEnv() || shouldSkip()) {
    return source;
  }

  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', ...plugins],
  });


  let importReactLibrary = false;
  let exportReactComponent = false;
  const insertNodes = [];
  traverse(ast, {
    ImportDeclaration: (path) => {
      const { source } = path.node;
      if (t.isStringLiteral(source) && source.value === 'react') {
        importReactLibrary = true;
      }
    },

    ExportDefaultDeclaration: (path) => {
      const { declaration } = path.node;
      // insert `export default ${identifier}(module)(xxx)`
      if (t.isClassDeclaration(declaration) || t.isFunctionDeclaration(declaration)) {
        if (t.isIdentifier(declaration.id)) {
          path.replaceWith(declaration);
          insertNodes.push(
            t.ExportDefaultDeclaration(
              t.callExpression(
                t.identifier(identifier),
                [declaration.id]
              )
            )
          );
          exportReactComponent = true;
        }
        return;
      }

      // change `export default xxx` to `export default ${identifier}(module)(xxx)`
      if (t.isIdentifier(declaration)) {
        path.node.declaration = t.callExpression(
          t.identifier(identifier),
          [path.node.declaration]
        );
        exportReactComponent = true;
        return;
      }
    },
    ExpressionStatement: (path) => {
      const { expression } = path.node;
      if (!t.isAssignmentExpression(expression)) {
        return;
      }

      const { operator, left, right } = expression;
      if (operator === '=' && isModuleExport(left)) {
        // insert `module.exports = ${identifier}(module)(xxx)`
        if (t.isClassExpression(right) || t.isFunctionExpression(right)) {
          if (t.isIdentifier(right.id)) {
            path.replaceWith(right);
            insertNodes.push(
              t.assignmentExpression(
                '=',
                t.memberExpression(t.identifier('module'), t.identifier('exports')),
                t.callExpression(
                  t.identifier(identifier),
                  [right.id]
                )
              )
            );
            exportReactComponent = true;
          }
          return;
        }

        // change `module.exports = xxx` to `module.exports = ${identifier}(module)(xxx)`
        if (t.isIdentifier(right)) {
          path.node.expression.right = t.callExpression(
            t.identifier(identifier),
            [right]
          );
          exportReactComponent = true;
          return;
        }
      }
    },
  });

  // return origin source when not import react or export component
  if (!(importReactLibrary && exportReactComponent)) {
    return source;
  }

  ast.program.body.unshift(
    // insert `import 'react-hot-loader';`
    t.importDeclaration([], t.stringLiteral('react-hot-loader')),
    // insert `import { hot as ${identifier} } from 'react-hot-loader/root';`
    t.importDeclaration(
      [t.importSpecifier(t.identifier(identifier), t.identifier('hot'))],
      t.stringLiteral('react-hot-loader/root')
    )
  );

  if (insertNodes.length > 0) {
    ast.program.body.push(...insertNodes);
  }

  const { code } = generate(ast);
  return code;
}

module.exports = ReactHotExportLoader;
