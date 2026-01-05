/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type {
  API,
  Collection,
  FileInfo,
  VariableDeclarator,
} from 'jscodeshift';

import { isPropsVariableEmpty } from './i18-next/check-props-empty';
import { refactorFunctionAndCalls } from './i18-next/refactor-functions';
import { removeImport } from './i18-next/utils';

export default function transformer(file: FileInfo, api: API): string {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Remove i18next imports
  removeImport(root, j, 'i18next');
  removeImport(root, j, 'react-i18next');
  // Remove the `useTranslation` import
  removeImport(root, j, 'next-i18next');
  // Remove `nextI18NextConfig` import
  removeImport(root, j, '@/next-i18next.config');

  // Remove `const { i18n } = require('./next-i18next.config');`
  root
    .find(j.VariableDeclarator)
    .filter((path) => {
      const { id, init } = path.node;
      return (
        id.type === 'ObjectPattern' &&
        id.properties.some(
          (prop) =>
            prop.type === 'ObjectProperty' &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 'i18n'
        ) &&
        init?.type === 'CallExpression' &&
        init.callee.type === 'Identifier' &&
        init.callee.name === 'require' &&
        init.arguments?.length > 0 &&
        init.arguments[0]?.type === 'StringLiteral' &&
        init.arguments[0].value === './next-i18next.config'
      );
    })
    .forEach((path) => {
      j(path.parent).remove();
    });

  // Remove `i18n` property from `nextConfig`
  root
    .find(j.ObjectExpression)
    .filter((path) => {
      return (
        path.parent.node.type === 'VariableDeclarator' &&
        path.parent.node.id.type === 'Identifier' &&
        path.parent.node.id.name === 'nextConfig'
      );
    })
    .forEach((path) => {
      const { properties } = path.node;
      const filteredProperties = properties.filter(
        (prop) =>
          !(
            prop.type === 'ObjectProperty' &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 'i18n'
          )
      );

      if (properties.length !== filteredProperties.length) {
        path.node.properties = filteredProperties;
      }
    });

  // Remove `const { t } = useTranslation();`
  root
    .find(j.VariableDeclaration)
    .filter((path) => {
      return path.node.declarations.some((decl): decl is VariableDeclarator => {
        if (decl.type !== 'VariableDeclarator') return false;

        const { id, init } = decl;

        // Check if `id` is an ObjectPattern
        if (id.type !== 'ObjectPattern') return false;

        // Ensure `init` is a CallExpression
        if (!init || init.type !== 'CallExpression') return false;

        // Check the `callee` and `arguments` of the CallExpression
        if (
          init.callee.type !== 'Identifier' ||
          init.callee.name !== 'useTranslation' ||
          init.arguments.length > 0
        ) {
          return false;
        }

        // Check for `t` property in the ObjectPattern
        return id.properties.some((prop) => {
          return (
            prop.type === 'ObjectProperty' &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 't'
          );
        });
      });
    })
    .forEach((path) => {
      j(path).remove();
    });

  // Find CallExpressions inside JSXExpressions
  root
    .find(j.JSXExpressionContainer)
    .filter((path) => {
      const { expression } = path.node;

      // Match t('string with {{...}}', { ... })
      return (
        expression.type === 'CallExpression' &&
        expression.callee.type === 'Identifier' &&
        expression.callee.name === 't' &&
        expression.arguments.length === 2 &&
        !!expression.arguments[0] &&
        !!expression.arguments[1] &&
        expression.arguments[0].type === 'StringLiteral' &&
        expression.arguments[1].type === 'ObjectExpression'
      );
    })
    .forEach((path) => {
      const { expression } = path.node;
      let replacedString = '';

      const dynamicParts: any[] = [];
      if (expression.type === 'CallExpression') {
        if (
          expression.arguments[0] &&
          expression.arguments[0].type === 'StringLiteral'
        ) {
          const templateString = expression.arguments[0].value;
          replacedString = templateString;
        }

        if (
          expression.arguments[1] &&
          expression.arguments[1].type === 'ObjectExpression'
        ) {
          const variables = expression.arguments[1].properties;

          // Parse the string and replace {{name}} with `{variable}`
          variables.forEach((prop) => {
            if (
              prop.type === 'ObjectProperty' &&
              prop.key.type === 'Identifier'
            ) {
              const variableName = prop.key.name;
              const placeholder = `{{${variableName}}}`;
              if (replacedString.includes(placeholder)) {
                replacedString = replacedString.replace(
                  placeholder,
                  `{{${dynamicParts.length}}}`
                );
                dynamicParts.push(
                  j.jsxExpressionContainer(j.identifier(variableName))
                );
              }
            }
          });
        }
      }

      // Create the final JSX children array
      const parts = replacedString
        .split(/{{(\d+)}}/)
        .map((part, index) => {
          if (index % 2 === 0) {
            // Static text, ensure space is preserved
            return j.jsxText(
              part.trim() + (index + 1 < replacedString.length ? ' ' : '')
            );
          }
          // Dynamic parts, ensure space is preserved
          return [
            dynamicParts[parseInt(part, 10)],
            j.jsxText(' '), // Add space after the variable
          ];
        })
        .flat();

      // Replace the JSXExpressionContainer with a JSXFragment containing the parts
      j(path).replaceWith(
        j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), parts)
      );
    });

  // Replace `t(...)` calls with their default values
  root
    .find(j.CallExpression)
    .filter((path) => {
      return (
        path.node.callee.type === 'Identifier' && path.node.callee.name === 't'
      );
    })
    .forEach((path) => {
      if (
        path.node.arguments.length === 1 &&
        path.node.arguments[0] &&
        path.node.arguments[0].type === 'StringLiteral'
      ) {
        j(path).replaceWith(path.node.arguments[0]);
      } else {
        j(path).replaceWith(j.literal(''));
      }
    });

  // Step 4: Replace `<Trans>` with its children content
  root
    .find(j.JSXElement)
    .filter((path) => {
      return (
        path.node.openingElement.name.type === 'JSXIdentifier' &&
        path.node.openingElement.name.name === 'Trans'
      );
    })
    .forEach((path) => {
      const { children } = path.node;

      const parentNode = path.parent.node;
      const isInObject = parentNode.type === 'ObjectProperty';
      const isInVariable = parentNode.type === 'VariableDeclarator';

      if (children && children.length === 1) {
        const child = children[0];

        if (child && child.type === 'JSXText') {
          const { value } = child;

          if (isInObject) {
            // For configuration objects, wrap the text in single quotes
            j(path).replaceWith(j.literal(value.trim()));
          } else if (isInVariable || parentNode.type === 'ReturnStatement') {
            // For variables or assignments, wrap the text in quotes
            j(path).replaceWith(j.literal(value.trim()));
          } else {
            // For JSX, preserve raw text exactly as it is
            let rawValue = value;
            if ('extra' in child) {
              if (
                typeof child.extra === 'object' &&
                child.extra !== null &&
                'raw' in child.extra
              ) {
                rawValue = (child.extra as { raw: string }).raw;
              }
            }
            j(path).replaceWith(j.jsxText(rawValue));
          }
        } else {
          // Replace with the single child directly (non-text JSX node)
          j(path).replaceWith(child);
        }
      } else if (children && children.length > 1) {
        // Handle multiple children (e.g., fragments or combinations of text/JSX)
        j(path).replaceWith(
          j.jsxFragment(
            j.jsxOpeningFragment(),
            j.jsxClosingFragment(),
            children
          )
        );
      } else {
        // Handle empty <Trans> tags
        j(path).replaceWith(j.literal(''));
      }
    });

  // Remove `t` from function parameters
  root
    .find(j.ArrowFunctionExpression)
    .filter((path) => {
      return path.node.params.some(
        (param) => param.type === 'Identifier' && param.name === 't'
      );
    })
    .forEach((path) => {
      path.node.params = path.node.params.filter(
        (param) => param.type === 'Identifier' && param.name !== 't'
      );
    });

  // Remove `t` from dependency arrays
  root
    .find(j.ArrayExpression)
    .filter((path) => {
      return path.node.elements.some(
        (el) => el && el.type === 'Identifier' && el.name === 't'
      );
    })
    .forEach((path) => {
      path.node.elements = path.node.elements.filter(
        (el) => el && !(el.type === 'Identifier' && el.name === 't')
      );
    });

  // Remove `t` from object type declarations (like `UseColumnsProps`)
  root
    .find(j.TSPropertySignature)
    .filter(
      (path) =>
        path.node.key.type === 'Identifier' && path.node.key.name === 't'
    )
    .forEach((path) => {
      j(path).remove();
    });

  root.find(j.ObjectExpression).forEach((path) => {
    path.node.properties = path.node.properties.filter(
      (prop) =>
        !(
          prop.type === 'ObjectProperty' &&
          prop.key.type === 'Identifier' &&
          prop.key.name === 't'
        )
    );
  });

  // Remove `t` from function parameters
  root
    .find(j.ArrowFunctionExpression)
    .filter((path) => {
      const firstParam = path.node.params[0];
      return (
        firstParam?.type === 'ObjectPattern' &&
        firstParam.properties.some(
          (prop) =>
            prop.type === 'ObjectProperty' &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 't'
        )
      );
    })
    .forEach((path) => {
      const firstParam = path.node.params[0] as any;
      firstParam.properties = firstParam.properties.filter(
        (prop: { key: { name: string }; type: string }) =>
          !(prop.key.name === 't' && prop.type === 'ObjectProperty')
      );
    });

  // Remove `appWithTranslation` declaration
  root
    .find(j.VariableDeclaration)
    .filter((path) => {
      return (
        path.node.declarations.length > 0 &&
        !!path.node.declarations[0] &&
        path.node.declarations[0].type === 'VariableDeclarator' &&
        path.node.declarations[0].id.type === 'Identifier' &&
        path.node.declarations[0].id.name === 'AppWithI18n'
      );
    })
    .forEach((path) => {
      j(path).remove();
    });

  // Replace `AppWithI18n` with `App` in JSX
  root
    .find(j.JSXElement)
    .filter((path) => {
      return (
        path.node.openingElement.name.type === 'JSXIdentifier' &&
        path.node.openingElement.name.name === 'AppWithI18n'
      );
    })
    .forEach((path) => {
      if (path.node.openingElement.name.type === 'JSXIdentifier') {
        path.node.openingElement.name.name = 'App';
      }

      // Check if there is a closing element
      if (
        path.node.closingElement &&
        path.node.closingElement.name.type === 'JSXIdentifier'
      ) {
        path.node.closingElement.name.name = 'App';
      }
    });

  // Refactor multiple functions with the same behavior
  const functionsToRefactor = [
    { name: 'getLocalizedColumnName', param: 't' },
    { name: 'getUserRoleName', param: 't' },
    { name: 'handleAction', param: 't' },
  ];

  functionsToRefactor.forEach(({ name, param }) => {
    refactorFunctionAndCalls(root, j, name, param);
  });

  // Find and remove the /language-toggle export
  root
    .find(j.ExportAllDeclaration)
    .filter((path) => path.node.source.value === './language-toggle')
    .forEach((path) => {
      j(path).remove();
    });

  // Find and remove  <LanguageSelector /> components
  root
    .find(j.JSXElement)
    .filter((path) => {
      return (
        path.node.openingElement.name.type === 'JSXIdentifier' &&
        path.node.openingElement.name.name === 'LanguageSelector'
      );
    })
    .forEach((path) => {
      const parentDiv = path.parent.node;

      if (
        parentDiv.type === 'JSXElement' &&
        parentDiv.openingElement.name.type === 'JSXIdentifier' &&
        parentDiv.openingElement.name.name === 'div'
      ) {
        const children = parentDiv.children.filter(
          (child: { type: string }) => child.type === 'JSXElement'
        );
        if (children.length === 1 && children[0] === path.node) {
          // If <LanguageSelector /> is the only child, remove the entire parent <div>
          j(path.parent).remove();
        } else {
          // Otherwise, just remove <LanguageSelector />
          j(path).remove();
        }
      }
    });

  // Remove the `LanguageSelector` import
  root
    .find(j.ImportDeclaration)
    .filter((path) => {
      if (path.node.specifiers) {
        return path.node.specifiers.some(
          (specifier) =>
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.name === 'LanguageSelector'
        );
      }
      return false;
    })
    .forEach((path) => {
      if (path.node.specifiers && path.node.specifiers.length === 1) {
        j(path).remove();
      } else {
        path.node.specifiers = path.node.specifiers?.filter(
          (specifier) =>
            !(
              specifier.type === 'ImportSpecifier' &&
              specifier.imported.name === 'LanguageSelector'
            )
        );
      }
    });

  // Remove `IfStatement` containing `serverSideTranslations`
  root
    .find(j.IfStatement)
    .filter((path) => {
      // Check if the if-statement contains `serverSideTranslations`
      return j(path).toSource().includes('serverSideTranslations');
    })
    .forEach((path) => {
      j(path).remove();
    });

  // Check for redundant `getServerSideProps`
  root
    .find(j.VariableDeclaration)
    .filter((path) => {
      const declaration = path.node.declarations[0];
      return (
        !!declaration &&
        declaration.type === 'VariableDeclarator' &&
        declaration.id.type === 'Identifier' &&
        declaration.id.name === 'getServerSideProps'
      );
    })
    .forEach((path) => {
      let arrowFunction;
      if (
        path.node.declarations[0]?.type === 'VariableDeclarator' &&
        path.node.declarations[0].init
      ) {
        arrowFunction = path.node.declarations[0].init;
      }

      if (arrowFunction?.type === 'ArrowFunctionExpression') {
        const { body } = arrowFunction;

        if (body.type === 'BlockStatement') {
          const statements = body.body;

          const propsDeclaration = statements.find(
            (stmt) =>
              stmt.type === 'VariableDeclaration' &&
              stmt.declarations.length === 1 &&
              stmt.declarations[0] &&
              stmt.declarations[0].type === 'VariableDeclarator' &&
              stmt.declarations[0].id.type === 'Identifier' &&
              stmt.declarations[0].id.name === 'props'
          );

          let propsVariableName = '';

          if (
            propsDeclaration &&
            propsDeclaration.type === 'VariableDeclaration' &&
            propsDeclaration.declarations[0] &&
            propsDeclaration.declarations[0].type === 'VariableDeclarator' &&
            propsDeclaration.declarations[0].id
          ) {
            if (propsDeclaration.declarations[0].id.type === 'Identifier') {
              propsVariableName = propsDeclaration.declarations[0].id.name;
            }
          }

          const hasSessionLogic = statements.some((stmt) => {
            return (
              stmt.type === 'VariableDeclaration' &&
              stmt.declarations.some((decl) => {
                return (
                  decl.type === 'VariableDeclarator' &&
                  decl.init?.type === 'AwaitExpression' &&
                  decl.init.argument?.type === 'CallExpression' &&
                  decl.init.argument.callee?.type === 'Identifier' &&
                  decl.init.argument?.callee?.name === 'getServerSession'
                );
              })
            );
          });

          if (hasSessionLogic) {
            return; // Do not remove this function if it contains session logic
          }

          if (
            propsVariableName &&
            isPropsVariableEmpty(propsVariableName, statements)
          ) {
            const lastStatement = statements[statements.length - 1];
            if (
              lastStatement &&
              lastStatement.type === 'ReturnStatement' &&
              lastStatement.argument?.type === 'ObjectExpression' &&
              lastStatement.argument.properties.length === 1 &&
              lastStatement.argument.properties[0] &&
              j.ObjectProperty.check(lastStatement.argument.properties[0]) &&
              j.Identifier.check(lastStatement.argument.properties[0].key) &&
              lastStatement.argument.properties[0].key.name === 'props' &&
              lastStatement.argument.properties[0].value.type ===
                'Identifier' &&
              lastStatement.argument.properties[0].value.name ===
                propsVariableName
            ) {
              j(path).remove();
            }
          }
        }
      }
    });

  // Remove empty export declarations
  root
    .find(j.ExportNamedDeclaration)
    .filter((path) => {
      const { declaration } = path.node;
      return (
        declaration == null &&
        !!path.node.specifiers &&
        path.node.specifiers.length === 0
      );
    })
    .forEach((path) => {
      j(path).remove();
    });

  // Remove initializeI18n async function declaration
  const initializeI18nDeclaration = root
    .find(j.FunctionDeclaration)
    .filter((path) => {
      const isTargetFunction =
        path.node.async === true &&
        !!path.node.id &&
        path.node.id.name === 'initializeI18n';

      return isTargetFunction;
    });

  initializeI18nDeclaration.remove();

  // Remove initializeI18n if it's a variable declaration
  const initializeI18nVariable = root
    .find(j.VariableDeclarator)
    .filter((path) => {
      const isTargetVariable =
        j.Identifier.check(path.node.id) &&
        path.node.id.name === 'initializeI18n';

      return isTargetVariable;
    });
  initializeI18nVariable.closest(j.VariableDeclaration).remove();

  // Remove `initializeI18n` call expressions and their parent declarations
  root
    .find(j.CallExpression)
    .filter((path) => {
      return (
        j.Identifier.check(path.node.callee) &&
        path.node.callee.name === 'initializeI18n'
      );
    })
    .forEach((path) => {
      const variableDeclarator = (j(path) as Collection<any>).closest(
        j.VariableDeclarator
      );
      if (variableDeclarator.size() > 0) {
        variableDeclarator.remove();
      } else {
        const expressionStatement = (j(path) as Collection<any>).closest(
          j.ExpressionStatement
        );
        if (expressionStatement.size() > 0) {
          expressionStatement.remove();
        }
      }
    });

  // Remove I18nextProvider in render
  root
    .find(j.JSXElement)
    .filter((path) => {
      return (
        j.JSXIdentifier.check(path.node.openingElement.name) &&
        path.node.openingElement.name.name === 'I18nextProvider'
      );
    })
    .replaceWith((path) => path.node.children);

  // Remove `it` blocks entirely related to `i18next` or `initializeI18n`
  root
    .find(j.CallExpression)
    .filter((path) => {
      const calleeName = j.Identifier.check(path.node.callee)
        ? path.node.callee.name
        : null;

      if (calleeName === 'it') {
        const testFunction = path.node.arguments[1]; // The test function
        if (
          testFunction &&
          testFunction.type === 'ArrowFunctionExpression' &&
          testFunction.body
        ) {
          const bodyStatements = j.BlockStatement.check(testFunction.body)
            ? testFunction.body.body
            : [];
          return bodyStatements.every((statement) => {
            // Ensure every statement in the body is related to `initializeI18n`
            return (
              j(statement)
                .find(j.Identifier, { name: 'initializedI18n' })
                .size() > 0
            );
          });
        }
      }
      return false;
    })
    .forEach((path) => {
      j(path).remove();
    });

  // Check and remove unnecessary async in `it` blocks
  root
    .find(j.CallExpression)
    .filter((path) => {
      return (
        j.Identifier.check(path.node.callee) && path.node.callee.name === 'it'
      );
    })
    .forEach((path) => {
      const testFunction = path.node.arguments[1]; // The test function
      if (
        testFunction &&
        testFunction.type === 'ArrowFunctionExpression' &&
        testFunction.async
      ) {
        const containsAwait =
          j(testFunction.body).find(j.AwaitExpression).size() > 0;

        if (!containsAwait) {
          testFunction.async = false;
        }
      }
    });

  // Remove `jest.mock('next-i18next', ...)`
  root
    .find(j.CallExpression)
    .filter((path) => {
      return (
        path.node.callee.type === 'MemberExpression' &&
        j.Identifier.check(path.node.callee.object) &&
        path.node.callee.object.name === 'jest' &&
        j.Identifier.check(path.node.callee.property) &&
        path.node.callee.property.name === 'mock' &&
        j.StringLiteral.check(path.node.arguments[0]) &&
        path.node.arguments[0].value === 'next-i18next'
      );
    })
    .forEach((path) => {
      j(path).remove();
    });

  // Return the transformed source
  return root
    .toSource({ quote: 'single', reuseWhitespace: true })
    .replace(/('use client';);/g, "'use client';");
}
