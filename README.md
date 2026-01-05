# FitAds

This template includes the following things:

- Demo apps:

  - [Next.js](./apps/web/)
  - [Expo](./apps/mobile)
  - [Express](./apps/server/)

- Reusable packages:

  - [auth](./packages/auth/): Auth utilities using Next-Auth
  - [db](./packages/db/): Database models using Drizzle ORM
  - [api](./packages/api/): Shared API using zodios
  - [ui](./packages/ui): Common UI components

- Reusable configurations:

  - [jest-config](./configs/jest-config/)

## Development quickstart

1. Clone the repository
1. Install the dependencies

   ```bash
   yarn install
   ```

1. Create the required `.env` files using the `.env.example` of each package as
   sample:

   - [web](./apps/web/.env.example)
   - [server](./apps/server/.env.example)
   - [db](./packages/db/.env.example)

1. Run the database

   ```bash
   docker compose up -d
   ```

   or

   ```bash
   docker-compose up -d
   ```

1. Run the migrations

   ```bash
   yarn db:migrate
   ```

   _Note: This step will fail if you don't create the `.env` file inside the
   [`@meltstudio/db`](./packages/db/) package_

1. Fill teh database with fixtures

   ```bash
   yarn db:fixtures
   ```

1. Run the apps
   ```bash
   yarn dev` or `yarn dev --filter=<workspace>
   ```

## Database

To create a new migration, run:

```bash
 yarn db:generate --name <migration-name>
```

## UI Theme

This template uses [shadcn/ui](https://ui.shadcn.com/), all the components are
installed in the [@meltstudio/theme](./packages/theme) package. That package is
intended to only contain components and utils from shadcn/ui.

### Installing new components

Run:

```bash
npx shadcn-ui@latest add -c packages/theme <component>
```

or

```bash
npx shadcn-ui@latest add -c packages/theme
```

to get a menu to select multiple components.

### Using new colors for the theme

#### Replacing the main colors

To change the main colors of the theme the
[globals.css](./packages/theme/globals.css) file needs to be edited accordingly.
The [ui-colorgen](https://ui-colorgen.vercel.app/) tool can be used to generate
the required code.

#### Adding extra colors to the theme

To add new colors to the theme check
[this](https://ui.shadcn.com/docs/theming#adding-new-colors).

## CI/CD

### GitHub

This starter kit includes reusable workflows (prefixed with `_`) and samples to
run the CI in branches, PRs and releases. The following reusable workflows are
included:

- [`_lint_commits`](./.github/workflows/_lint_commits.yaml`): Runs commitlint
  over the commits in a PR to ensure they match conventional commits.
- [`_code_checks`](./.github/workflows/_code_checks.yaml): Runs code check tools
  like linters, style checkers, unit tests, etc.
- [`_sem_release`](./github/workflows/_sem_release.yaml): Runs semantic release.
- [`_migrate`](./github/workflows/_migrate.yaml): Runs Drizzle ORM's migrations.
- [`_deploy_vercel`](./github/workflows/_deploy_vercel.yaml): Creates a new
  Vercel deployment using Vercel's CLI.

## Deployment

### Docker

Some applications already include sample Dockerfiles to use for docker, to build
them run:

```bash
docker build -t <name>:<tag> -f <path-to-Dockerfile> .
```

from the root of the monorepo. For example to build the
[web](./apps/web/Dockerfile) image, run:

```bash
docker build -t web:latest -f apps/web/Dockerfile .
```

### Firebase functions

Firebase deployments have
[some](https://github.com/firebase/firebase-tools/issues/653)
[known](https://thijs-koerselman.medium.com/deploy-to-firebase-without-the-hacks-e685de39025e)
problems with monorepos, to solve them
[isolate-package](https://github.com/0x80/isolate-package) can be used

## Useful Tips

### Migrating an existing repository

To migrate an existing repository into the monorepo, you can use `git subtree`
to preserve the history of all the changes before being integrated into the
repository.

Note that the git tree for that repo won't have the same origin as the monorepo
tree root. It does not affect git. However, note that the commits previous to
the root won't have the same prefix (e.g. apps/[app name]), it will still point
to the original [app name] directory root.

To use `git subtree`:

```shell
git subtree add -P <prefix> <repo> <reference>
```

Note that `<prefix>` is the prefix for the location of the repository being
imported. Typically something like "apps/[app name]", or "package/[package
name]".

`<repo>` is a reference to the repository that will be imported.

`<reference>` is a git reference to import from, typically a branch like `main`
or `dev`.

The staging area of both the repo and the monorepo should be empty.

Alternatively, if preserving the history is of no importance, you can move the
files and create a single commit with all the changes at once.

### Fixing mismatched dependencies

This repository uses [syncpack](https://github.com/JamieMason/syncpack), so
fixing mismatched dependencies is as simple as running:

```bash
yarn syncpack fix-mismatches
```

### Yarn Resolutions

When using yarn, it is occasionally possible to have multiple packages resolving
to a particular version that is either troublesome or complicated to work with.

You can force a specific package version to be used, this is especially useful
to match a specific type definition version to be used.

For that, yarn offers the `"resolutions"` option on package.json, however, this
seems to **only be valid for the root package.json** in a monorepo.

With these limitations, yarn RFC
[selective-versions-resolutions](https://github.com/yarnpkg/rfcs/blob/master/implemented/0000-selective-versions-resolutions.md)
offers a solution, matching a specific resolution to a particular package.
(Refer to the RFC for detailed information on usage and limitation).

Caveats: Nested packages or apps are not well supported.

A quick example to use selective package resolutions in the root `package.json`:

```json
  ...,
  "devDependencies": {
    "typescript": "2.2.2",
    "more dependencies..."
  },
  "resolutions": {
    "typescript@>=2.0.0 <2.3.0": "typescript@2.3.2"
  }
  ...
```

More usage examples can be read in this
[LINK](https://github.com/yarnpkg/rfcs/blob/master/implemented/0000-selective-versions-resolutions.md#package-designation)

### Cleaning node_modules

When your require to remove node_modules from your monorepo, keep in mind that
there is going to be one for each workspace that requires it.

A tool to help with removing them without the need to manually go to each folder
is `npkill`.

Usage: in the root of the monorepo, use

```shell
npx npkill
```

Press the space bar on each record that you want to remove.

## S3 local testing

To test the S3 integration locally, you can use the `localstack` docker image.
To run it:

```shell
docker compose up local-s3
```

This will start a local S3 server on `http://localhost:4566`.

bucket name: `localbucket`

## React email

To view emails in development you can see them in the browser by going to
`http://localhost:3001` and selecting the email you want to see.

## Drizzel studio

It is running on `https://local.drizzle.studio/`

## Testing and coverage

The repo handles two different commands for testing: `yarn test` and
`yarn test:coverage`.

- `yarn test` will just execute the tests, without creating a coverage file.
  This command is also run during workflows
- `yarn test:coverage` will execute tests and create coverage reports for every
  package that has a jest configuration. After running all tests, it will merge
  all coverage files and create an HTML coverage report at
  `<project-directory>/coverage/lcov-report`. The individual coverage files can
  be found inside the coverage folder of every package with tests.

## Useful Links

- [Turborepo](https://turbo.build/repo/docs)
