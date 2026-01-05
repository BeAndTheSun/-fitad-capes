import { confirm, isCancel, multiselect, outro, spinner } from '@clack/prompts';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import packagePaths from './package-paths';
import pluginPaths from './plugin-paths-remove';
import findFilesWithImport from './scripts/find-files-with-import';
import findPackageJsonFiles from './scripts/find-package-files';
import removei18Next from './scripts/i18-next/remove-i18next';
import { readJson, writeJson } from './scripts/json-helper';
import removeDependencies from './scripts/remove-dependences';
import type { PluginPaths } from './types';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

type PluginConfig = {
  apps: Record<string, boolean>;
  packages: Record<string, boolean>;
};

const configPath = path.resolve(dirName, '../plugins.json');

// Run the codemod on all files
const runCodemod = (codemodScript: string, files: string[]): void => {
  if (files.length === 0) {
    console.log('ℹ️ No files to process. Skipping codemod.');
    return;
  }

  // Create a comma-separated list of files to process
  const fileList = files.join(' ');

  console.log(`🔧 Running codemod for ${files.length} file(s)...`);
  try {
    execSync(
      `npx jscodeshift -t ${codemodScript} --extensions=ts,tsx --parser=tsx ${fileList}`,
      {
        stdio: 'inherit',
      }
    );
    console.log('✅ Codemod applied successfully to the specified files.');
  } catch (error) {
    console.error('❌ Failed to run codemod:', error);
  }
};

// Run custom codemods to remove code references
const runCustomCodemods = (unusedPackages: string[]): void => {
  const codemodsPath = path.join(dirName, 'codemods');
  const startDir = path.resolve(dirName, '../../../'); // Root project directory

  // Check if Algolia was selected for removal
  const isRemovingAlgolia = unusedPackages.includes(
    '@meltstudio/algolia-client'
  );

  // Determine codemod script and flag
  const codemodScriptTs = path.join(codemodsPath, 'remove-table.ts');
  const codemodArgs = isRemovingAlgolia ? [] : ['--use-algolia=true']; // Remove Algolia or Normal Table

  // Find all files with Algolia Table or Normal Table import
  console.log('🔍 Searching for files with Algolia Table...');
  const findFilesWithAlgolia = findFilesWithImport(
    '@/components/algolia-table',
    startDir
  );

  if (findFilesWithAlgolia.length > 0) {
    console.log(
      `🛠️ Running table removal codemod to ${
        isRemovingAlgolia ? '🗑️ remove Algolia Table' : '🗑️ remove Normal Table'
      }...`
    );

    const fileList = findFilesWithAlgolia.join(' ');
    console.log(`📁 Files to process: ${fileList}`);
    try {
      execSync(
        `npx jscodeshift -t ${codemodScriptTs} --extensions=tsx --parser=tsx  ${fileList} ${codemodArgs.join(
          ' '
        )}`,
        {
          stdio: 'inherit',
        }
      );
      console.log(
        `✅ Successfully removed ${
          isRemovingAlgolia ? 'Algolia Table' : 'Normal Table'
        } using codemod.`
      );
    } catch (error) {
      console.error(
        `❌ Failed to run table removal codemod for ${
          isRemovingAlgolia ? 'Algolia Table' : 'Normal Table'
        }:`,
        error
      );
    }
  } else {
    console.log('ℹ️ No files found for Algolia Table.');
  }

  // Run additional custom codemods for other unused packages
  unusedPackages.forEach((pkg) => {
    const customCodemodScript = path.join(
      codemodsPath,
      `remove-${pkg.split('/')[1]}.ts`
    );

    // Matching files with the target dependency
    const matchingPaths = packagePaths[pkg] || [];
    const fileListFromPaths = matchingPaths.map((p) =>
      path.resolve(startDir, p)
    );

    const matchingFiles = findFilesWithImport(pkg, startDir);
    const allMatchingFiles = matchingFiles.concat(fileListFromPaths);

    if (fs.existsSync(customCodemodScript) && allMatchingFiles.length > 0) {
      console.log(`🛠️ Running custom codemod for 📦 ${pkg}...`);
      try {
        runCodemod(customCodemodScript, allMatchingFiles);
        console.log(`✅ Codemod successfully applied for 📦 ${pkg}.`);
      } catch (error) {
        console.error(`❌ Failed to run codemod for 📦 ${pkg}:`, error);
      }
    } else {
      console.log(
        `ℹ️ No matching files or codemod script found for 📦 ${pkg}.`
      );
    }
  });
};

// Remove the selected features
const removeFeatures = (
  selected: string[],
  pluginConfig: PluginConfig
): void => {
  const updatedPluginConfig = {
    ...pluginConfig,
    apps: { ...pluginConfig.apps },
    packages: { ...pluginConfig.packages },
  };

  selected.forEach((item) => {
    const [type, name] = item.split('/');
    if (name) {
      console.log(
        `🗑️ Removing ${type === 'apps' ? '🖥️ App' : '📦 Package'}: ${name}`
      );

      // Update the plugin configuration
      if (type === 'apps') {
        updatedPluginConfig.apps[name] = false;
      } else if (type === 'packages') {
        updatedPluginConfig.packages[name] = false;
      }

      // Remove associated paths
      const pathsToRemove = pluginPaths[type as keyof PluginPaths][name] || [];
      pathsToRemove.forEach((pathToRemove) => {
        const fullPath = path.resolve(dirName, '../../../', pathToRemove);
        if (fs.existsSync(fullPath)) {
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`✅ Deleted path: ${fullPath}`);
        } else {
          console.warn(`⚠️ Path not found: ${fullPath}`);
        }
      });
    } else {
      console.warn(`⚠️ Invalid item format: ${item}`);
    }

    // Delete the directory
    const basePath = path.resolve(dirName, '../../../'); // Root project folder
    const itemPath = path.join(basePath, item);

    if (fs.existsSync(itemPath)) {
      fs.rmSync(itemPath, { recursive: true, force: true });
      console.log(`✅ Deleted folder: ${itemPath}`);
    } else {
      console.warn(`⚠️ Folder not found: ${itemPath}`);
    }
  });

  // Update the plugins.json configuration
  console.log('📝 Updating plugin configuration...');
  writeJson(configPath, updatedPluginConfig);
  console.log('✅ Plugin configuration updated successfully.');
};

// Safe exit utility
const safeExit = (message: string): void => {
  console.log(`❌ ${message}`);
  process.exit(0);
};

// Main function
const main = async (): Promise<void> => {
  console.log('\n🌟 Welcome to the Dependency Cleanup Tool!');
  outro(
    '🛠️ This tool will help you identify and remove unused dependencies and features to keep your project clean.'
  );

  // Load plugins configuration
  const pluginConfig = readJson<PluginConfig>(configPath);

  const selectedPlugins: string[] = [];

  // Check if user wants to remove Algolia
  const checkRemoveAlgolia = await confirm({
    message: '🚀 Do you want to remove Algolia? (Used for table filtering)',
  });

  if (isCancel(checkRemoveAlgolia)) {
    safeExit('❌ Operation canceled by the user. No changes were made.');
  }

  if (checkRemoveAlgolia) {
    console.log('✅ Algolia removal selected.');
    selectedPlugins.push('packages/algolia-client');
  } else {
    console.log('ℹ️ Algolia will be retained.');
  }

  // Ask if the user wants to remove i18next
  const checkRemovei18next = await confirm({
    message:
      '🌐 Do you want to remove i18next? (Used for internationalization)',
  });

  if (isCancel(checkRemovei18next)) {
    safeExit('❌ Operation canceled by the user. No changes were made.');
  }

  if (checkRemovei18next) {
    console.log('✅ i18next removal selected.');
  } else {
    console.log('ℹ️ i18next will be retained.');
  }

  // Get user selection for additional features to remove
  const selected = (await multiselect({
    message: '📦 Select the features you want to remove:',
    options: [
      ...Object.keys(pluginConfig.apps).map((key) => ({
        label: `🖥️ App: ${key}`,
        value: `apps/${key}`,
      })),
      ...Object.keys(pluginConfig.packages).map((key) => ({
        label: `📦 Package: ${key}`,
        value: `packages/${key}`,
      })),
    ],
    required: false,
  })) as string[];

  if (isCancel(selected)) {
    safeExit('❌ Operation canceled by the user. No changes were made.');
  }

  selectedPlugins.push(...selected);

  const spin = spinner();

  // Find all `package.json` files in the project
  const packageJsonFiles = findPackageJsonFiles(
    path.resolve(dirName, '../../../')
  );

  if (
    selectedPlugins.length === 0 &&
    !checkRemovei18next &&
    !checkRemoveAlgolia
  ) {
    console.log('⚠️ No features selected for removal. Exiting...');
    return;
  }

  // Confirm the selected features
  const formatList = selectedPlugins.map((item) => {
    const [type, name] = item.split('/');
    return `- ${type === 'apps' ? '🖥️ App' : '📦 Package'}: ${name}`;
  });

  if (checkRemovei18next) {
    formatList.push('- 🌐 i18next');
  }

  if (formatList.length > 0) {
    const confirmList = await confirm({
      message: `🛠️ You are about to remove the following features:\n${formatList.join(
        '\n'
      )}\nProceed?`,
    });

    if (!confirmList) {
      safeExit('Operation canceled by the user. No changes were made.');
    }
  }

  // Run i18next removal codemod if selected
  if (checkRemovei18next) {
    console.log('🌐 Removing i18next...');
    await removei18Next(packageJsonFiles);
    console.log('✅ i18next removed successfully.');
  }

  if (selectedPlugins.length > 0) {
    spin.start('🔧 Removing selected features...');

    // Perform removal
    removeFeatures(selectedPlugins, pluginConfig);

    // Identify unused packages
    const unusedPackages = selectedPlugins.map(
      (item) => `@meltstudio/${item.split('/')[1]}`
    );

    console.log('🧹 Removing dependencies:', unusedPackages);

    // Remove unused dependencies from all `package.json` files
    removeDependencies(unusedPackages, packageJsonFiles);

    spin.stop('✅ Selected features and dependencies cleaned up successfully.');

    spin.start('⚙️ Running custom codemods...');
    // Run custom codemods for code cleanup
    runCustomCodemods(unusedPackages);
    spin.stop('✅ Custom codemods applied successfully.');
  }

  // Run global lint:fix script
  console.log('🎨 Running global lint:fix script...');
  try {
    execSync(`yarn lint:fix`, {
      cwd: path.resolve(dirName, '../../../'), // Root directory
      stdio: 'inherit',
    });
    console.log('✅ Global lint:fix applied successfully.');
  } catch (error) {
    console.error('❌ Failed to run global lint:fix script:', error);
  }

  console.log(
    '🎉 Cleanup complete! Run `yarn install` to update your dependencies and refresh your project.\n'
  );
};

main().catch((err) => {
  console.error('An error occurred:', err);
});
