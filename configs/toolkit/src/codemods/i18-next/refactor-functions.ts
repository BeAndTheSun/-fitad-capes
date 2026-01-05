/* eslint-disable no-param-reassign */
import type core from 'jscodeshift';
import type { Collection } from 'jscodeshift';

export function refactorFunctionAndCalls(
  root: Collection<any>,
  j: core.JSCodeshift,
  functionName: string,
  paramToRemove: string
): void {
  // Remove the parameter from the specified function
  root
    .find(j.FunctionDeclaration)
    .filter((path) => path.node.id?.name === functionName)
    .forEach((path) => {
      path.node.params = path.node.params.filter(
        (param) =>
          !(param.type === 'Identifier' && param.name === paramToRemove)
      );
    });

  // Replace calls to the function, removing the specific argument
  root
    .find(j.CallExpression)
    .filter((path) => {
      return (
        path.node.callee.type === 'Identifier' &&
        path.node.callee.name === functionName &&
        path.node.arguments.some(
          (arg) => arg.type === 'Identifier' && arg.name === paramToRemove
        )
      );
    })
    .forEach((path) => {
      path.node.arguments = path.node.arguments.filter(
        (arg) => !(arg.type === 'Identifier' && arg.name === paramToRemove)
      );
    });

  // Handle nested calls to the function within methods or other functions
  root
    .find(j.Node) // Find all nodes
    .filter((path) => {
      // Filter for the specific node types
      return (
        path.node.type === 'MethodDefinition' ||
        path.node.type === 'FunctionExpression' ||
        path.node.type === 'ArrowFunctionExpression'
      );
    })
    .forEach((path) => {
      // Traverse the body of these nodes if they are valid
      if ('body' in path.node && j.BlockStatement.check(path.node.body)) {
        const { body } = path.node;
        j(body)
          .find(j.CallExpression)
          .filter((callPath) => {
            return (
              callPath.node.callee.type === 'Identifier' &&
              callPath.node.callee.name === functionName &&
              callPath.node.arguments.some(
                (arg) => arg.type === 'Identifier' && arg.name === paramToRemove
              )
            );
          })
          .forEach((callPath) => {
            callPath.node.arguments = callPath.node.arguments.filter(
              (arg) =>
                !(arg.type === 'Identifier' && arg.name === paramToRemove)
            );
          });
      }
    });
}
