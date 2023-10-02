git submodule init
git submodule update
cd open-next
pnpm i
pnpm --filter open-next --filter @open-next/utils build
# install twice b/c first time open-next bin fails b/c it hasn't been built yet
# but we cannot build without installing. 2nd time installing creates successful bin
cd ../../../examples/app-pages-router
pnpm i
cd ../app-router
pnpm i
cd ../pages-router
pnpm i