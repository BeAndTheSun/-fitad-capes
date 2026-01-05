import * as fs from 'fs';

import { readJson, writeJson } from './json-helper';

const removeScripts = (scripts: string[], packageJsonFiles: string[]): void => {
  packageJsonFiles.forEach((packageJsonPath) => {
    // check if the file exists
    if (!fs.existsSync(packageJsonPath)) {
      console.warn(`File not found: ${packageJsonPath}`);
      return;
    }

    const packageJson = readJson<Record<string, any>>(packageJsonPath);

    // Track if the file was modified
    let modified = false;

    // Process scripts
    scripts.forEach((script) => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        console.log(`Removing script '${script}' from ${packageJsonPath}`);
        delete packageJson.scripts[script];
        modified = true;
      }
    });

    // Write the updated package.json only if modified
    if (modified) {
      writeJson(packageJsonPath, packageJson);
      console.log(`Updated ${packageJsonPath}`);
    }
  });
};

export default removeScripts;
