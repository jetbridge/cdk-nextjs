# cdk-nextjs-standalone Examples
Each example app utilizes [open-next](https://github.com/sst/open-next)'s example Next.js apps. open-next's example apps are built to test core Next.js functionality so they're helpful for testing `cdk-nextjs-standalone`. We also don't want to reinvent the wheel. In order to use open-next's code within this repository we use git submodules. Read [this guide](https://www.atlassian.com/git/tutorials/git-submodule) for more info.

## Prerequisites
1. `git clone https://github.com/jetbridge/cdk-nextjs.git`
1. `yarn install`
1. `yarn build` (or faster option: `yarn compile`)

## Setup Example Next.js Apps
After cloning this repository in order to run the example apps or e2e tests, run:
1. Initialize git submodule: `git submodule init && git submodule update`
1. Install dependencies: `cd open-next && pnpm i`
1. Build packages `pnpm build`

## Deploy Manually
To deploy an app manually to test them out for yourself, run:
1. `cd app-router # or any other example`
1. `pnpm install`
1. Inject AWS Credentials into your terminal
1. `cdk deploy`

## Locally Run E2E Tests with Playwright
1. Change directory into package with tests: `cd open-next/packages/tests-e2e`.
1. Set URL environment variable for the [project](https://playwright.dev/docs/test-projects) you want to test: `APP_ROUTER_URL` for `appRouter` project, `PAGES_ROUTER_URL` for `pagesRouter` project, and/or `APP_PAGE_ROUTER_URL` for `appPagesRouter` project. These urls will be the CloudFront domains from deployed `examples/` CDK apps. You can find these in AWS Console or they'll be printed in your terminal after running `cdk deploy`.
1. Run e2e tests with ui: `pnpm playwright test --ui`.
1. Hit play (green play button) and watch tests run!

## E2E Testing in CI
See .projenrc.ts `run-e2e-tests` workflow towards bottom. This functionality is commented out until an AWS account can be used to deploy the example apps and run the tests.