module.exports = {
  '**/*.{js,jsx,ts,tsx,hbs,html,mjml,css,scss,json,graphql,yml,yaml,md}': [
    'prettier --write',
  ],
  '{.prettierrc,.eslintrc,.releaserc,.commitlintrc}': ['prettier --write'],
  '**/package.json': (filenames) =>
    `yarn syncpack format --source ${filenames.join(' --source ')}`,
};
