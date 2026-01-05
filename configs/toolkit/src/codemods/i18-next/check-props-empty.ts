/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// Check for redundant `getServerSideProps`
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function isPropsVariableEmpty(variableName: any, body: any[]) {
  return body.some(
    (stmt) =>
      stmt.type === 'VariableDeclaration' &&
      stmt.declarations.some(
        (decl: {
          id: { type: string; name: any };
          init: { type: string; properties: string | any[] };
        }) =>
          decl.id.type === 'Identifier' &&
          decl.id.name === variableName &&
          decl.init?.type === 'ObjectExpression' &&
          decl.init.properties.length === 0
      )
  );
}
