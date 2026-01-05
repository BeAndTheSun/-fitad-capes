import type { API, FileInfo } from 'jscodeshift';

/**
 * Codemod script to remove all references to `FeatureFlagsProvider`, `FeatureFlagWrapper`,
 * Also removes related imports, deletes the `feature-flags` directory, and removes the feature-flags page.
 *
 * Run with: npx jscodeshift -t ./path/to/script.ts --extensions=ts,tsx --parser=tsx ./src
 */

export default function (file: FileInfo, api: API): string {
  const j = api.jscodeshift;
  const root = j(file.source);

  const dependencyName = '@meltstudio/feature-flags';
  const componentsToRemove = ['FeatureFlagsProvider', 'FeatureFlagWrapper'];

  console.log('Processing file:', file.path); // Debug log

  // Step 1: Remove the import statement for the dependency
  root
    .find(j.ImportDeclaration, { source: { value: dependencyName } })
    .forEach(() => console.log(`Removing import from ${dependencyName}`))
    .remove();

  // Step 2: Remove JSX elements for components to be removed
  componentsToRemove.forEach((componentName) => {
    root
      .find(j.JSXElement, {
        openingElement: { name: { name: componentName } },
      })
      .forEach(() => console.log(`Removing <${componentName}> JSX element`))
      .replaceWith((nodePath) => {
        const node = nodePath.value;
        return node.children;
      }); // Replace with children
  });

  // Step 3: Remove unused variables introduced by the deletion
  root
    .find(
      j.VariableDeclarator,
      (node): boolean =>
        !!(
          node.init &&
          j.CallExpression.check(node.init) &&
          node.init.callee &&
          'name' in node.init.callee &&
          typeof node.init.callee.name === 'string' &&
          componentsToRemove.includes(node.init.callee.name)
        )
    )
    .forEach(() => console.log('Removing unused variable for components'))
    .remove();

  // Step 4: Clean up remaining empty import statements (if any)
  root
    .find(j.ImportDeclaration)
    .filter((ph) => !!ph.node.specifiers && ph.node.specifiers.length === 0)
    .forEach(() => console.log('Removing empty import declaration'))
    .remove();

  // Step 5: Remove TypeScript type imports related to removed components
  componentsToRemove.forEach((componentName) => {
    root
      .find(j.TSImportType, {
        argument: { value: dependencyName },
      })
      .forEach(() =>
        console.log(`Removing TypeScript type imports for ${componentName}`)
      )
      .remove();
  });

  // Step 6: Remove the feature-flags directory
  root
    .find(j.VariableDeclarator, {
      id: { name: 'settingsNavigation' },
    })
    .forEach((path) => {
      // Ensure it's an array initializer
      const { init } = path.node;
      if (init && init.type === 'ArrayExpression') {
        // Filter out the "Feature Flags" object
        init.elements = init.elements.filter((element) => {
          if (
            element &&
            element.type === 'ObjectExpression' &&
            element.properties.some(
              (prop) =>
                j.ObjectProperty.check(prop) &&
                j.Identifier.check(prop.key) &&
                prop.key.name === 'href' &&
                j.Literal.check(prop.value) &&
                prop.value.value === '/settings/feature-flags'
            )
          ) {
            return false; // Remove this element
          }
          return true;
        });
      }
    });

  // Return the transformed code
  const result = root.toSource({ quote: 'single' });

  return result;
}
