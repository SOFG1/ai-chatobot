# tsai-frontend

This is the frontend part of TextSenseAI.

## Design

[Figma Design](https://www.figma.com/file/140pHFef1GXP0doS4ElfbH/TextSenseAI-Design-(skillbyte)?type=design&node-id=47%3A5849&mode=dev)

## Important notes

We are using `css.gg` for our icons. They now changed the LICENSE from MIT to a non-commercial usage LICENSE. So we can use only version `2.1.1` of this npm package. 

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
yarn install
```

### Compile and Hot-Reload for Development

```sh
yarn run dev
```

### Type-Check, Compile and Minify for Production

```sh
yarn run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
yarn run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
yarn run build

# Runs the end-to-end tests
yarn run test:e2e
# Runs the tests only on Chromium
yarn run test:e2e -- --project=chromium
# Runs the tests of a specific file
yarn run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
yarn run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn run lint
```
