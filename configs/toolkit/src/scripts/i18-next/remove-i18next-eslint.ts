import * as fs from 'fs';
import * as path from 'path';
import prettier from 'prettier';
import { fileURLToPath } from 'url';

type ESLintConfig = {
  root?: boolean;
  extends?: string[];
  rules?: Record<string, string | object>;
};

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

// Function to recursively find `.eslintrc` and `.eslintrc.js` files in the project
const findEslintFiles = (startDir: string): string[] => {
  const results: string[] = [];
  const entries = fs.readdirSync(startDir, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(startDir, entry.name);

    if (entry.isDirectory() && entry.name !== 'node_modules') {
      results.push(...findEslintFiles(fullPath));
    } else if (entry.name === '.eslintrc' || entry.name === '.eslintrc.js') {
      results.push(fullPath);
    }
  });

  return results;
};

const containsI18next = (content: string): boolean => {
  return (
    content.includes('plugin:i18next/recommended') ||
    content.includes('i18next/no-literal-string')
  );
};

const formatWithPrettier = async (
  filePath: string,
  content: string
): Promise<string> => {
  const options = (await prettier.resolveConfig(filePath)) || {};

  // Determine the parser based on file extension
  const parser = filePath.endsWith('.js') ? 'babel' : 'json';

  return prettier.format(content, { ...options, parser });
};

const removeI18nextFromEslint = async (filePath: string): Promise<void> => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    if (!containsI18next(content)) {
      console.log(`Skipped ${filePath} (no i18next references found).`);
      return;
    }

    let updatedContent = content;

    if (filePath.endsWith('.js')) {
      updatedContent = updatedContent
        .replace(/['"]plugin:i18next\/recommended['"],?/g, '')
        .replace(/['"]i18next\/no-literal-string['"]\s*:\s*['"]off['"],?/g, '')
        .replace(/,\s*}/g, '}')
        .replace(/rules:\s*{\s*}/g, '');

      // Format with Prettier
      updatedContent = await formatWithPrettier(filePath, updatedContent);
    } else if (filePath.endsWith('.eslintrc')) {
      const jsonContent: ESLintConfig = JSON.parse(content);

      if (Array.isArray(jsonContent.extends)) {
        jsonContent.extends = jsonContent.extends.filter(
          (ext) => !ext.includes('plugin:i18next/recommended')
        );
      }

      if (jsonContent.rules) {
        delete jsonContent.rules['i18next/no-literal-string'];
      }

      if (jsonContent.rules && Object.keys(jsonContent.rules).length === 0) {
        delete jsonContent.rules;
      }

      updatedContent = JSON.stringify(jsonContent, null, 2);
    }

    // Ensure a trailing newline
    if (!updatedContent.endsWith('\n')) {
      updatedContent += '\n';
    }

    fs.writeFileSync(filePath, updatedContent, 'utf-8');
    console.log(`Updated ${filePath}`);
  } catch (error) {
    console.error(`Failed to update ${filePath}:`, error);
  }
};

// Main function to find and process all ESLint configuration files
export const removeI18nextFromEslintFiles = async (): Promise<void> => {
  console.log('Removing i18next references from ESLint configurations...');
  const startDir = path.resolve(dirName, '../../../../../'); // Root directory of the project
  const eslintFiles = findEslintFiles(startDir);

  if (eslintFiles.length === 0) {
    console.log('No ESLint configuration files found.');
    return;
  }

  await Promise.allSettled(
    eslintFiles.map((file) => removeI18nextFromEslint(file))
  );
  console.log(
    'Finished removing i18next references from ESLint configurations.'
  );
};
