import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import packagePaths from '@/package-paths';
import pluginPaths from '@/plugin-paths-remove';
import removeDependencies from '@/scripts/remove-dependences';
import removeScripts from '@/scripts/remove-scripts';

import { removeI18nextFromEslintFiles } from './remove-i18next-eslint';
import { removeI18nextFromPreCommit } from './remove-i18next-precommit';

const removei18Next = async (packageJsonFiles: string[]): Promise<void> => {
  const fileName = fileURLToPath(import.meta.url);
  const dirName = path.dirname(fileName);
  const startDir = path.resolve(dirName, '../../../../../');
  const pathsToRemove = pluginPaths.packages.i18Next || [];

  pathsToRemove.forEach((pathToRemove) => {
    const fullPath = path.resolve(startDir, pathToRemove);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`Deleted path: ${fullPath}`);
    } else {
      console.warn(`Path not found: ${fullPath}`);
    }
  });

  console.log(
    'Removing i18next from the projectop',
    path.join(dirName, 'codemods/remove-i18next.ts')
  );

  const matchingPaths = packagePaths.i18Next || [];
  const fileListFromPaths = matchingPaths.map((p) => path.resolve(startDir, p));

  const toolkitsRoot = path.resolve(startDir, 'configs/toolkit/src');
  console.log('configsRoot', toolkitsRoot);

  if (fileListFromPaths.length > 0) {
    console.log('Running i18next removal codemod...');
    try {
      execSync(
        `npx jscodeshift -t ${path.join(toolkitsRoot, 'codemods/remove-i18next.ts')} --extensions=ts,tsx,js --parser=tsx ${fileListFromPaths.join(
          ' '
        )}`,
        {
          stdio: 'inherit',
        }
      );
      console.log('i18next removal codemod applied successfully.');
    } catch (error) {
      console.error('Failed to run i18next removal codemod:', error);
    }
  }

  // Remove from package.json
  removeDependencies(
    [
      'i18next-parser',
      'eslint-plugin-i18next',
      'react-i18next',
      'next-i18next',
    ],
    packageJsonFiles
  );

  // Remove Scripts from package.json
  removeScripts(['i18n:check', 'i18n:scan'], packageJsonFiles);

  // Remove i18next from pre-commit
  removeI18nextFromPreCommit();

  // Remove i18next from ESLint configurations
  await removeI18nextFromEslintFiles();
};

export default removei18Next;
