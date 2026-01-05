/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { API, FileInfo, JSCodeshift, ObjectExpression } from 'jscodeshift';

import { removeMethodDefinition } from './algolia/remove-method-definition';

/**
 * Codemod to remove Algolia-specific logic.
 *
 * Usage:
 *   npx jscodeshift -t ./remove-algolia.ts --extensions=tsx,ts --parser=tsx ./src
 */

export default function (file: FileInfo, api: API): string {
  const j: JSCodeshift = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.VariableDeclaration)
    .filter((path) =>
      path.node.declarations.some(
        (declaration) =>
          declaration.type === 'VariableDeclarator' &&
          declaration.id.type === 'Identifier' &&
          declaration.id.name === 'saveAlgoliaActions'
      )
    )
    .forEach((path) => {
      j(path).remove();
    });

  // Remove all usages of `handleAlgoliaSave`
  root
    .find(j.AwaitExpression, {
      argument: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { name: 'handleAlgoliaSave' },
        },
      },
    })
    .forEach((path) => {
      j(path.parent).remove();
    });

  // Remove all usages of `handleAlgoliaRemove`
  root
    .find(j.AwaitExpression, {
      argument: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { name: 'handleAlgoliaRemove' },
        },
      },
    })
    .forEach((path) => {
      j(path.parent).remove();
    });

  // Find all calls to `handleAlgoliaSaveByPk`
  const nodesToRemove = root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      property: { type: 'Identifier', name: 'handleAlgoliaSaveByPk' },
    },
  });

  nodesToRemove.forEach((path) => {
    // Find the parent `ExpressionStatement` for the current `CallExpression`
    let parentPath = path;
    while (
      parentPath &&
      parentPath.node &&
      !j.ExpressionStatement.check(parentPath.node)
    ) {
      parentPath = parentPath.parentPath;
    }

    if (parentPath) {
      j(parentPath).remove();
    }
  });

  // Remove `algoliaModel` parameter from constructor
  root.find(j.MethodDefinition, { kind: 'constructor' }).forEach((path) => {
    const constructorParams = path.node.value.params;
    path.node.value.params = constructorParams.filter(
      (param) =>
        param.type !== 'TSParameterProperty' ||
        (param.parameter.type === 'Identifier' &&
          param.parameter.name !== 'algoliaModel')
    );

    // Remove `this.algoliaModel` assignments in constructor body
    if (path.node.value.body.type === 'BlockStatement') {
      path.node.value.body.body = path.node.value.body.body.filter(
        (node) =>
          !(
            node.type === 'ExpressionStatement' &&
            node.expression.type === 'AssignmentExpression' &&
            node.expression.left.type === 'MemberExpression' &&
            j.Identifier.check(node.expression.left.property) &&
            node.expression.left.property.name === 'algoliaModel'
          )
      );
    }
  });

  // Remove `await Promise.all(saveAlgoliaActions)`
  root
    .find(j.ExpressionStatement)
    .filter((path) => {
      const { expression } = path.node;
      return (
        expression.type === 'AwaitExpression' &&
        !!expression.argument &&
        expression.argument.type === 'CallExpression' &&
        expression.argument.callee.type === 'MemberExpression' &&
        expression.argument.callee.object.type === 'Identifier' &&
        expression.argument.callee.object.name === 'Promise' &&
        j.Identifier.check(expression.argument.callee.property) &&
        expression.argument.callee.property.name === 'all' &&
        expression.argument.arguments.length === 1 &&
        !!expression.argument.arguments &&
        expression.argument.arguments[0]?.type === 'Identifier' &&
        expression.argument.arguments[0].name === 'saveAlgoliaActions'
      );
    })
    .forEach((path) => {
      j(path).remove();
    });

  // Remove `public readonly algoliaModel?: AlgoliaDataConfigCl<Table>` from constructor properties
  root
    .find(j.TSParameterProperty)
    .filter(
      (path) =>
        j.Identifier.check(path.node.parameter) &&
        path.node.parameter.name === 'algoliaModel'
    )
    .forEach((path) => {
      j(path).remove();
    });

  // Remove all lines where `this.algoliaModel` is used
  root
    .find(j.AwaitExpression, {
      argument: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'ThisExpression' },
              property: { name: 'algoliaModel' },
            },
          },
        },
      },
    })
    .forEach((path) => {
      j(path.parent).remove();
    });

  // Remove `handleAlgoliaSave`, `handleAlgoliaRemove`, and `handleAlgoliaSaveByPk` method definitions
  removeMethodDefinition(root, j, 'handleAlgoliaSave');
  removeMethodDefinition(root, j, 'handleAlgoliaRemove');
  removeMethodDefinition(root, j, 'handleAlgoliaSaveByPk');

  // Find `config` objects and remove the `algolia` property
  root.find(j.ObjectExpression).forEach((path) => {
    // Filter the properties of the object to remove `algolia`
    path.node.properties = path.node.properties.filter(
      (prop) =>
        !(
          prop.type === 'ObjectProperty' &&
          prop.key.type === 'Identifier' &&
          prop.key.name === 'algolia'
        )
    );
  });

  // Remove `indexName` properties from `modelsConfig`
  root
    .find(j.ObjectExpression) // Match all object expressions
    .forEach((path) => {
      path.node.properties = path.node.properties.filter(
        (prop) =>
          !(
            prop.type === 'ObjectProperty' &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 'indexName'
          )
      );
    });

  // Remove `indexName` from type definitions
  root
    .find(j.TSPropertySignature, {
      key: { type: 'Identifier', name: 'indexName' },
    })
    .forEach((path) => {
      j(path).remove();
    });

  //  Remove Algolia constructor arguments in `this.models`
  const algoliaModels = ['users', 'featureFlag', 'workspace'];
  const modelsAssignments = root.find(j.AssignmentExpression, {
    left: {
      type: 'MemberExpression',
      object: { type: 'ThisExpression' },
      property: { type: 'Identifier', name: 'models' },
    },
  });

  modelsAssignments.forEach((path) => {
    const objectExpression = path.node.right;
    if (objectExpression.type === 'ObjectExpression') {
      // Process each property in the `this.models` object
      objectExpression.properties.forEach((prop) => {
        if (
          prop.type === 'ObjectProperty' &&
          prop.value.type === 'NewExpression' &&
          j.Identifier.check(prop.key) &&
          algoliaModels.includes(prop.key.name)
        ) {
          // Remove the second argument (Algolia-related)
          prop.value.arguments = prop.value.arguments.filter(
            (_, index) => index !== 1
          );
        }
      });
    }
  });

  // Find all export declarations
  const exportStatements = root.find(j.ExportAllDeclaration);
  // Remove `export * from './algolia';` and `export * from './algolia-table';`
  exportStatements
    .filter(
      (path) =>
        path.node.source.value === './algolia' ||
        path.node.source.value === './algolia-table'
    )
    .forEach((path) => {
      j(path).remove();
    });

  // Remove `indexName` from type definitions
  root.find(j.TSTypeLiteral).forEach((path) => {
    path.node.members = path.node.members.filter(
      (member) =>
        !(
          member.type === 'TSPropertySignature' &&
          member.key.type === 'Identifier' &&
          member.key.name === 'indexName'
        )
    );
  });

  // Remove `indexName` from `modelData` initialization
  root
    .find(j.VariableDeclaration)
    .filter((path) =>
      path.node.declarations.some(
        (declaration) =>
          declaration.type === 'VariableDeclarator' &&
          declaration.id.type === 'Identifier' &&
          declaration.id.name === 'modelData'
      )
    )
    .forEach((path) => {
      const modelDataInit = path.node.declarations[0];
      if (
        modelDataInit &&
        modelDataInit.type === 'VariableDeclarator' &&
        modelDataInit.init &&
        modelDataInit.init.type === 'ObjectExpression'
      ) {
        modelDataInit.init.properties = modelDataInit.init.properties.filter(
          (prop) =>
            !(
              prop.type === 'ObjectProperty' &&
              prop.key.type === 'Identifier' &&
              prop.key.name === 'indexName'
            )
        );
      }
    });

  // Remove `indexName` from the returned object in `useModelByRoute`
  root
    .find(j.ReturnStatement)
    .filter((path) => path.node.argument?.type === 'ObjectExpression')
    .forEach((path) => {
      const objectProperties = (path.node.argument as ObjectExpression)
        ?.properties;
      if (objectProperties) {
        (path.node.argument as ObjectExpression).properties =
          objectProperties.filter(
            (prop) =>
              !(
                prop.type === 'ObjectProperty' &&
                prop.key.type === 'Identifier' &&
                prop.key.name === 'indexName'
              )
          );
      }
    });

  // Remove `indexName` from destructuring
  root
    .find(j.VariableDeclarator, {
      id: { type: 'ObjectPattern' }, // Matches destructuring assignments
    })
    .forEach((path) => {
      const objectPattern = path.node.id; // The ObjectPattern itself
      if (j.ObjectPattern.check(objectPattern)) {
        objectPattern.properties = objectPattern.properties.filter(
          (prop) =>
            !(
              j.ObjectProperty.check(prop) &&
              j.Identifier.check(prop.key) &&
              prop.key.name === 'indexName'
            )
        );
      }
    });

  // Remove conditions checking `indexName`
  root
    .find(j.IfStatement, {
      test: {
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Identifier', name: 'indexName' }, // Matches `if (!indexName)`
      },
    })
    .forEach((path) => {
      j(path).remove();
    });

  // Remove `indexName` usage in JSX (e.g., `<Trans>Index name not found</Trans>`)
  root
    .find(j.JSXElement)
    .filter((path) => {
      const { openingElement } = path.node;
      return (
        openingElement.name.type === 'JSXIdentifier' &&
        openingElement.name.name === 'Trans' &&
        !!path.node.children &&
        path.node.children.some(
          (child) =>
            child.type === 'JSXText' &&
            child.value.trim() === 'Index name not found'
        )
      );
    })
    .forEach((path) => {
      j(path).remove();
    });

  return root.toSource({ quote: 'single' });
}
