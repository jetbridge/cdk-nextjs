# cdk-nextjs-standalone Examples
Each example app utilizes [open-next](https://github.com/sst/open-next)'s example Next.js apps. open-next's example apps are built to test core Next.js functionality so they're helpful for testing `cdk-nextjs-standalone`. We also don't want to reinvent the wheel. In order to use open-next's code within this repository we use git submodules. Read [this guide](https://www.atlassian.com/git/tutorials/git-submodule) for more info.

## Prerequisites
1. `git clone https://github.com/jetbridge/cdk-nextjs.git`
1. `pnpm install`
1. `pnpm compile`

## Setup Example Next.js Apps
After cloning this repository in order to use the example Next.js apps from open-next you'll need to:
1. Initialize git submodule: `git submodule init && git submodule update`
1. Install dependencies: `cd open-next && pnpm i`
1. Build necessary packages `pnpm --filter open-next --filter @open-next/utils build`
1. Install again: `pnpm i`. We have to install twice b/c first time open-next bin fails b/c it hasn't been built yet but we cannot build without installing. 2nd time installing creates successful bin.

## Projen Note
This examples sub-project is managed by projen. Edit .projenrc.ts file in root of repo to make configuration changes.

## Deploy Manually
To deploy an app manually to test them out for yourself follow these steps:
1. Inject AWS Credentials (AWS_ACCESS_KEY_ID, etc.) into your terminal
1. `cdk deploy`. This will deploy the app-router example (see cdk.json#app). If you want to deploy a different example app like cdk-nag, run: `cdk --app "pnpm tsx src/cdk-nag/cdk-nag-app.ts" deploy`.

## Locally Run E2E Tests with Playwright
1. Change directory into package with tests: `cd open-next/packages/tests-e2e`.
1. Set URL environment variable for the [project](https://playwright.dev/docs/test-projects) you want to test: `APP_ROUTER_URL` for `app-router` CDK app, `PAGES_ROUTER_URL` for `pages-router` CDK app, and/or `APP_PAGE_ROUTER_URL` for `app-pages-router` CDK app. These urls will be the CloudFront domains from deployed `examples/` CDK apps. You can find these in AWS Console or they'll be printed in your terminal after running `cdk deploy`.
1. Run e2e tests with ui: `pnpm playwright test --ui`.
1. Hit play (green play button) and watch tests run!

## E2E Testing in CI
See .projenrc.ts `run-e2e-tests` workflow towards bottom. This functionality is commented out until an AWS account can be used to deploy the example apps and run the tests.