import * as fs from 'fs';

import { readJson, writeJson } from './json-helper';

// Remove unused dependencies
const removeDependencies = (
  unusedPackages: string[],
  packageJsonFiles: string[]
): void => {
  packageJsonFiles.forEach((packageJsonPath) => {
    // check if the file exists
    if (!fs.existsSync(packageJsonPath)) {
      console.warn(`File not found: ${packageJsonPath}`);
      return;
    }
    const packageJson = readJson<Record<string, any>>(packageJsonPath);

    // Track if the file was modified
    let modified = false;

    // Process dependencies
    if (packageJson.dependencies) {
      unusedPackages.forEach((pkg) => {
        if (packageJson.dependencies[pkg]) {
          console.log(`Removing dependency '${pkg}' from ${packageJsonPath}`);
          delete packageJson.dependencies[pkg];
          modified = true;
        }
      });
    }

    // Process devDependencies
    if (packageJson.devDependencies) {
      unusedPackages.forEach((pkg) => {
        if (packageJson.devDependencies[pkg]) {
          console.log(
            `Removing devDependency '${pkg}' from ${packageJsonPath}`
          );
          delete packageJson.devDependencies[pkg];
          modified = true;
        }
      });
    }

    // Write the updated package.json only if modified
    if (modified) {
      writeJson(packageJsonPath, packageJson);
      console.log(`Updated ${packageJsonPath}`);
    }
  });
};

export default removeDependencies;
