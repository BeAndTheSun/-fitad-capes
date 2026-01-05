import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Path to the pre-commit script
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const startDir = path.resolve(dirName, '../../../../../');
const preCommitPath = path.resolve(startDir, '.husky/pre-commit');

// Function to update the pre-commit file and remove i18n:check
export const removeI18nextFromPreCommit = (): void => {
  if (!fs.existsSync(preCommitPath)) {
    console.error(`Pre-commit file not found at ${preCommitPath}`);
    return;
  }

  try {
    // Read the content of the pre-commit file
    const content = fs.readFileSync(preCommitPath, 'utf8');

    // Remove the line containing 'yarn i18n:check'
    const updatedContent = content
      .split('\n')
      .filter((line) => !line.includes('yarn i18n:check'))
      .join('\n');

    // Write the updated content back to the pre-commit file
    fs.writeFileSync(preCommitPath, updatedContent, 'utf8');

    console.log('Successfully removed i18next from the pre-commit file.');
  } catch (error) {
    console.error('Failed to update the pre-commit file:', error);
  }
};
