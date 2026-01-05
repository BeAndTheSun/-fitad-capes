import type { Request } from 'express';
import { pathToRegexp } from 'path-to-regexp';

import { apiDef } from '@/api/routers/def';

type ApiAlias = (typeof apiDef)[number]['alias'];
const PUBLIC_ALIASES: ApiAlias[] = [
  // auth
  'signUp',
  'recoverPassword',
  'sendPasswordRecoveryEmail',
  'getInvitation',
  'memberAcceptInvitation',
];

const PATHS = apiDef.map((def) => ({
  alias: def.alias,
  regExp: pathToRegexp(def.path),
  method: def.method,
}));

export function isPublicPath(path: string, method: string): boolean {
  // FIXME: this has a bug if we have two paths that are similar like:
  //   /payment-links/:id and /payment-links/price
  // it will match the one who encounters first inside the definition, so this
  // probably needs to check multiple paths and find the best possible match
  const alias = PATHS.find((pathDef) => {
    return (
      pathDef.regExp.exec(path) != null &&
      pathDef.method.toLowerCase() === method.toLowerCase()
    );
  });
  if (alias == null) {
    return false;
  }

  const isPublic = PUBLIC_ALIASES.includes(alias.alias);

  return isPublic;
}

export function getTokenFromReq(req: Request): string | null {
  if (req.headers.authorization == null) {
    return null;
  }
  const authHeader = req.headers.authorization;
  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || token == null) {
    return null;
  }
  return token;
}

export function isAllowedPath(
  path: string,
  method: string
): { status: boolean; message: string } {
  const alias = PATHS.find((pathDef) => {
    return (
      pathDef.regExp.exec(path) != null &&
      pathDef.method.toLowerCase() === method.toLowerCase()
    );
  });

  if (alias == null) {
    return {
      status: false,
      message: 'Path not found in apiDef.',
    };
  }

  return {
    status: true,
    message: 'Access is permitted for this route.',
  };
}

export function isSuperAdminAllowedPath(
  path: string,
  method: string
): { status: boolean; message: string } {
  const alias = PATHS.find((pathDef) => {
    return (
      pathDef.regExp.exec(path) != null &&
      pathDef.method.toLowerCase() === method.toLowerCase()
    );
  });

  if (alias == null) {
    throw new Error(`Could not find path ${path} in apiDef`);
  }

  const ALLOWED_ROUTES: ApiAlias[] = [
    'getRecords',
    'updateRecord',
    'deleteRecord',
    'createRecord',
    'getRecord',
    'getOwnUser',
    'getModelRelation',
  ];

  if (!ALLOWED_ROUTES.includes(alias.alias)) {
    return {
      status: false,
      message: 'Access is not permitted for this route.',
    };
  }

  return {
    status: true,
    message: 'Access is permitted for this route.',
  };
}
