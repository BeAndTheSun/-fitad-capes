import * as fs from 'fs';
import * as path from 'path';

// Recursively find all `package.json` files
const findPackageJsonFiles = (startDir: string): string[] => {
  const results: string[] = [];
  const entries = fs.readdirSync(startDir, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(startDir, entry.name);

    if (entry.isDirectory()) {
      results.push(...findPackageJsonFiles(fullPath));
    } else if (entry.name === 'package.json') {
      results.push(fullPath);
    }
  });

  return results;
};

export default findPackageJsonFiles;
