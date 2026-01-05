/* eslint-disable no-param-reassign */
import type core from 'jscodeshift';

/** Utility to remove specific imports */
export function removeImport(
  root: core.Collection,
  j: core.JSCodeshift,
  importPath: string
): void {
  root
    .find(j.ImportDeclaration)
    .filter((path) => path.node.source.value === importPath)
    .forEach((path) => {
      j(path).remove();
    });
}

/** Utility to remove variable declarations */
export function removeVariable(
  root: core.Collection,
  j: core.JSCodeshift,
  variableName: string
): void {
  root
    .find(j.VariableDeclarator)
    .filter(
      (path) =>
        path.node.id.type === 'Identifier' && path.node.id.name === variableName
    )
    .closest(j.VariableDeclaration)
    .remove();
}
