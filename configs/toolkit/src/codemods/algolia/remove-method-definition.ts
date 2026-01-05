import type { Collection, JSCodeshift } from 'jscodeshift';

export function removeMethodDefinition(
  root: Collection<any>,
  j: JSCodeshift,
  methodName: string
): void {
  root
    .find(j.ClassMethod, {
      key: { type: 'Identifier', name: methodName },
    })
    .forEach((path) => {
      j(path).remove();
    });
}
