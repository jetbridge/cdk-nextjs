# cdk-nextjs-standalone Examples
Each example app utilizes [open-next](https://github.com/sst/open-next)'s example Next.js apps. open-next's example apps are built to test core Next.js functionality so they're helpful for testing `cdk-nextjs-standalone`. We also don't want to reinvent the wheel. In order to use open-next's code within this repository we use git submodules. Read [this guide](https://www.atlassian.com/git/tutorials/git-submodule) for more info.

## Setup
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

## Automatic E2E Testing
See .projenrc.ts `run-e2e-tests` workflow.