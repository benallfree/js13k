# LLM Project Context

This document provides context for the AI assistant to understand the project's structure, conventions, and goals.

## Project Overview

**This is a JS13K game and must be approached as minimally as possible when writing code.**

Fabletop is a game platform where players lay tablets on the table and link them together to create a playing surface. They then use their mobile devices (phones) for any private player info such as cards they don't want to show. Cards can be "slid" out of the phone and onto the table, or "slid" off the table and onto the phones. So the idea is to use real play pieces when possible but also provide virtual pieces (markers, dice, cards, etc) when the real ones are not available. Fabletop has a design mode where new games can be created and shared in the Game Store, a discovery tool to find new games to play, and a way to save the state of a game.

The project uses `van.js`, a minimal reactive framework, and a custom UI component library called `van13k`.

## Tech Stack

- **Framework:** van.js
- **Language:** TypeScript
- **Package Manager:** bun
- **Build Tool:** Vite
- **UI Components:** vibescale (https://npmjs.com/vibescale) and a custom library in `src/van13k`
- **Styling:** CSS Modules with Sass
- **Deployment:** Cloudflare Pages

## Tool/CLI Rules

- **Never git commit**
- **Never start a server** (Do NOT run the application)
- Use Bun as the package manager

## Project Structure

- `src/`: Main application source code.
  - `src/main.ts`: Application entry point.
  - `src/App.ts`: Main application component.
  - `src/van13k/`: Custom UI component library.
    - `src/van13k/index.ts`: Exports all components.
  - `src/components/`: Application-specific components.
- `scripts/`: Build and utility scripts.
- `vite.config.ts`: Vite build configuration.
- `wrangler.jsonc`: Cloudflare deployment configuration.
- `package.json`: Project dependencies and scripts.
- `tsconfig.json`: TypeScript configuration.

## Development Workflow

1.  **Install dependencies:** `bun install`
2.  **Start development server:** `bun run dev` (DO NOT RUN THIS)
3.  **Build for production:** `bun run build`
4.  **Check bundle size:** `bun run size` (aliases to `bun run build`)
5.  **Analyze bundle:** `bun run analyze`

## VanJS Rules

- **Framework:** Van.js
- **State Reactivity:** Whenever you reference `.val` of a state variable, the enclosing function will automatically re-execute when that state changes. This can cause bugs where initialization functions run repeatedly. To limit the re-rendering scope, wrap state access in a nested function - this confines the reactivity to just that inner function rather than the entire enclosing function.
- **Routing:** Use vanjs-routing (@router) for navigation

## CSS Rules

- **Always use CSS modules** - never use inline styles unless they are dynamic
- **Always use named imports** for CSS modules
- **Utility classes:** Should be used and added to `@/styles.module.css`
- **Import styling:** Import `@/styles.module.css` as `@/styles.module.css`
- **Component-specific styling:** Which cannot be generalized should be added to a CSS module at the component level
- **@/styles.module.css should be for utility classes only** - for all else, use custom CSS modules
- **Always use @classify.ts** - Never use raw `class` attributes

## Helpers

- **@classify.ts:** Returns `{ class: ... }`. Use only CSS Module symbols in `classify()`

## Coding Conventions

- **Imports:** Use path aliases for clean imports:
  - `@/` for `src/`
  - `@van13k` for `src/van13k/index.ts`. All components and utilities exported from `src/van13k/index.ts` should be imported using this alias, not relative paths.
- **Styling:** Use CSS Modules for component-level styling. The `classify()` utility from `@van13k` should be used for composing class names. A global utility stylesheet is located at `src/styles.module.css` and provides a set of reusable utility classes for layout, typography, and more. When appropriate, prefer using these utility classes over creating new component-specific styles.
- **State Management:** Use `van.state()` for reactive state.
- **Components:** Follow the structure of existing components in `src/van13k`.
- **Minimalism:** This is a JS13K game - approach all code with extreme minimalism in mind.

## Deployment

The project is deployed to Cloudflare Pages. The `wrangler.jsonc` file configures the deployment. To deploy, run `bun run deploy`.
