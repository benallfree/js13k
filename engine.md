# Contributing to the WorldForge Engine

WorldForge is a [Svelte](https://svelte.dev/) web app built by [Vite](https://vitejs.dev/) and [Terser](https://terser.org/). Per the [js13k rules](https://js13kgames.com/#rules), the final zipped build must stay under 13,312 bytes.

## Getting Started

It's very easy to get started.

```
yarn
yarn dev
```

## Submitting a Pull Request

When you submit a pull request for major changes, please run `yarn build` to get a final byte count and delta from what it was. You don't have to submit the new build artifacts but please include the final byte count and delta.

## Managing Build Size

The build size is a big consideration for WorldForge. The entire zip needs to be under 13k. `yarn analyze` can help you understand where your bundle size is coming from. These general guidelines help a lot:

- Terser does a lot of work. Variable renaming, hoisting, and generally making things DRY is almost wasted time because Terser is so good already.
- Dependencies are a big culprit of bloat. In general, do not add them. Instead, take what you need from them and add it yourself.
- Look for ways to eliminate code entirely. Extreme modularization is a good thing.
