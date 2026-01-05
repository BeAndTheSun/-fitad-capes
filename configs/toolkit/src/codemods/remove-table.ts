import type { API, FileInfo, Options } from 'jscodeshift';

/**
 * Codemod to remove Algolia table or normal table logic based on the `USE_ALGOLIA` flag.
 *
 * Run with:
 *   To remove Algolia:
 *     npx jscodeshift -t ./remove-table.ts --extensions=tsx --parser=tsx ./src
 *
 *   To remove the normal table:
 *     npx jscodeshift -t ./remove-table.ts --extensions=tsx --parser=tsx ./src -- --use-algolia
 */

export default function (file: FileInfo, api: API, options: Options): string {
  const j = api.jscodeshift;
  const root = j(file.source);

  let useAlgolia = false;
  if (options['use-algolia']) {
    useAlgolia = true;
  }

  // Remove `AlgoliaTableWrapper` if Algolia is not used
  if (!useAlgolia) {
    root
      .find(j.JSXElement, {
        openingElement: { name: { name: 'AlgoliaTableWrapper' } },
      })
      .forEach((path) => {
        // Replace the wrapper with its child content (MembersDataTable)
        const wrappedElement =
          path.node.children?.find((child) => j.JSXElement.check(child)) ||
          null;
        path.replace(wrappedElement || undefined);
      });
  }

  const TARGET_KEYWORDS = useAlgolia
    ? ['DataTable', 'useWorkspaceMembers']
    : ['AlgoliaTable', 'AlgoliaTableWrapper', 'useAlgoliaRefresh'];

  // Remove imports related to the unused table
  root
    .find(j.ImportDeclaration)
    .filter((path) =>
      TARGET_KEYWORDS.some(
        (keyword) =>
          typeof path.node.source.value === 'string' &&
          path.node.source.value.includes(keyword)
      )
    )
    .remove();

  // Remove the `isAlogiliaUsed` constant if it exists
  root
    .find(j.VariableDeclarator, {
      id: { name: 'isAlogiliaUsed' },
    })
    .forEach((path) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      j(path.parent).remove(); // Remove the entire `VariableDeclaration`
    });

  // Replace `isAlogiliaUsed` references with `!!selectedWorkspace`
  root
    .find(j.Identifier, { name: 'isAlogiliaUsed' })
    .replaceWith(() => j.identifier('!!selectedWorkspace'));

  // Remove related JSX elements
  const JSX_TO_REMOVE = useAlgolia
    ? ['DataTable']
    : ['AlgoliaTable', 'AlgoliaTableWrapper'];

  JSX_TO_REMOVE.forEach((jsx) => {
    root
      .find(j.JSXElement, {
        openingElement: { name: { name: jsx } },
      })
      .remove();
  });

  // Remove the `USE_ALGOLIA` flag and conditional logic
  root
    .find(j.VariableDeclarator, {
      id: { name: 'USE_ALGOLIA' },
    })
    .remove();

  // Remove the `useWorkspaceMembers` or `useAlgoliaRefresh` hook
  const TARGET_HOOKS = useAlgolia
    ? ['useWorkspaceMembers', 'useGetRecords', 'useGetFeatureFlags']
    : ['useAlgoliaRefresh'];

  // Remove the entire line containing the targeted hook
  root
    .find(j.VariableDeclaration)
    .filter((path) =>
      path.node.declarations.some(
        (decl) =>
          decl.type === 'VariableDeclarator' &&
          decl.init &&
          decl.init.type === 'CallExpression' &&
          decl.init.callee.type === 'Identifier' &&
          TARGET_HOOKS.includes(decl.init.callee.name)
      )
    )
    .forEach((path) => {
      j(path).remove(); // Removes the entire `VariableDeclaration`
    });

  // Clean up unused variables
  root
    .find(j.VariableDeclarator)
    .filter((path) => {
      const { init } = path.node;
      if (!init) return false;
      return TARGET_KEYWORDS.some(
        (keyword) => init.type === 'Identifier' && init.name === keyword
      );
    })
    .remove();

  // Remove JSX blocks conditionally rendered by `USE_ALGOLIA`
  root
    .find(j.IfStatement)
    .filter(
      (path) =>
        path.node.test.type === 'Identifier' &&
        path.node.test.name === 'USE_ALGOLIA'
    )
    .replaceWith((path) => {
      const { consequent, alternate } = path.node;

      // Keep the `consequent` block if `useAlgolia` is true
      if (useAlgolia) {
        return consequent.type === 'BlockStatement'
          ? consequent.body
          : consequent;
      }

      // Keep the `alternate` block if `useAlgolia` is false
      if (alternate) {
        return alternate?.type === 'BlockStatement'
          ? alternate.body
          : alternate;
      }

      // If there's no `alternate`, remove the `IfStatement` entirely
      return null;
    });

  return root.toSource({ quote: 'single' });
}
