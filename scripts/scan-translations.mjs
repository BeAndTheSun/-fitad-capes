#!/usr/bin/env node
import { exec } from 'child_process';
import path from 'path';
import fsPromises from 'fs/promises';
import fs from 'fs';
import { EOL } from 'os';

const LOCALES = ['en', 'es'];
const TRANSLATIONS_BASE_PATH = path.join(process.cwd(), 'translations');
const WORKSPACES = [
  { name: '@meltstudio/web', path: 'apps/web' },
  // TODO: Uncomment this when we are already working on mobile and we want the translations there too.
  // { name: '@meltstudio/mobile', path: 'apps/mobile' },
];

async function writeJSON(path, data) {
  await fsPromises.writeFile(path, JSON.stringify(data, null, 2));
  await fsPromises.appendFile(path, EOL);
}

async function scanWorkspaceTranslations(workspace) {
  return new Promise((resolve, reject) => {
    exec(`yarn workspace ${workspace.name} i18n:scan`, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function getWorkspaceTranslationsPath(workspace, locale) {
  return path.join(
    process.cwd(),
    workspace.path,
    'src',
    'locales',
    locale,
    'translation.json'
  );
}

async function readWorkspaceTranslations(workspace, locale) {
  const workspaceTranslations = await fsPromises.readFile(
    getWorkspaceTranslationsPath(workspace, locale),
    'utf8'
  );

  return JSON.parse(workspaceTranslations);
}

async function writeWorkspaceTranslations(
  workspaceWithTranslations,
  globalTranslations
) {
  const newTranslations = Object.keys(
    workspaceWithTranslations.translations
  ).reduce((acc, curr) => {
    return {
      ...acc,
      [curr]: globalTranslations[curr],
    };
  }, {});

  const filePath = getWorkspaceTranslationsPath(
    workspaceWithTranslations,
    workspaceWithTranslations.locale
  );

  await writeJSON(filePath, newTranslations);
}

async function writeWorkspaceEnTranslations(workspace) {
  const translations = await readWorkspaceTranslations(workspace, 'en');
  // for en the global translations are given by the keys
  const newTranslations = Object.keys(translations).reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: curr,
    }),
    {}
  );

  await writeJSON(
    getWorkspaceTranslationsPath(workspace, 'en'),
    newTranslations
  );
}

async function readGlobalTranslations(locale) {
  const filePath = path.join(TRANSLATIONS_BASE_PATH, `${locale}.json`);
  const exists = fs.existsSync(filePath);
  if (!exists) {
    return {};
  }

  const globalTranslations = await fsPromises.readFile(filePath, 'utf8');
  return JSON.parse(globalTranslations);
}

async function writeGlobalTranslations(locale, translations) {
  const filePath = path.join(TRANSLATIONS_BASE_PATH, `${locale}.json`);

  await writeJSON(filePath, translations);
}

async function mergeWorkspacesTranslations(workspacesWithTranslations) {
  const merged = workspacesWithTranslations.reduce((acc, curr) => {
    return {
      ...acc,
      ...curr.translations,
    };
  }, {});

  return Object.keys(merged)
    .sort()
    .reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: merged[curr],
      }),
      {}
    );
}

async function run() {
  // first we need to scan all the apps to properly fill each translation file
  await Promise.all(
    WORKSPACES.map(async (workspace) => {
      await scanWorkspaceTranslations(workspace);
    })
  );

  for (const locale of LOCALES) {
    if (locale === 'en') {
      await Promise.all(
        WORKSPACES.map(async (workspace) => {
          await writeWorkspaceEnTranslations(workspace);
        })
      );
    } else {
      const workspacesWithTranslations = await Promise.all(
        WORKSPACES.map(async (workspace) => ({
          ...workspace,
          locale,
          translations: await readWorkspaceTranslations(workspace, locale),
        }))
      );

      const mergedTranslations = await mergeWorkspacesTranslations(
        workspacesWithTranslations,
        locale
      );

      const globalTranslations = await readGlobalTranslations(locale);

      const newGlobalTranslations = Object.keys(mergedTranslations).reduce(
        (acc, curr) => ({
          ...acc,
          // default to the global translation if it exists
          [curr]: globalTranslations[curr] || mergedTranslations[curr],
        }),
        {}
      );

      await Promise.all(
        workspacesWithTranslations.map(async (workspace) => {
          await writeWorkspaceTranslations(workspace, newGlobalTranslations);
        })
      );

      await writeGlobalTranslations(locale, newGlobalTranslations);
    }
  }
}

await run();
