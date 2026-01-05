import * as fs from 'fs';
import path from 'path';

// Helper function to find all files with the target dependency
const findFilesWithImport = (
  targetDependency: string,
  startDir: string
): string[] => {
  const foundFiles: string[] = [];

  const entries = fs.readdirSync(startDir, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(startDir, entry.name);

    if (entry.isDirectory()) {
      foundFiles.push(...findFilesWithImport(targetDependency, fullPath));
    } else if (
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !fullPath.includes('codemods') && // Skip codemods directory
      // Skip files in the node_modules directory
      !fullPath.includes('node_modules')
    ) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes(targetDependency)) {
        foundFiles.push(fullPath);
      }
    }
  });

  return foundFiles;
};

export default findFilesWithImport;
