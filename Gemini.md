# Gemini Project Context

This document provides context for the Gemini AI assistant to understand the project's structure, conventions, and goals.

## Project Overview

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
2.  **Start development server:** `bun run dev`
3.  **Build for production:** `bun run build`
4.  **Check bundle size:** `bun run size` (aliases to `bun run build`)
5.  **Analyze bundle:** `bun run analyze`

## Coding Conventions

- **Imports:** Use path aliases for clean imports:
  - `@/` for `src/`
  - `@van13k` for `src/van13k/index.ts`
- **Styling:** Use CSS Modules for component-level styling. The `classify()` utility from `@van13k` should be used for composing class names. A global utility stylesheet is located at `src/styles.module.css` and provides a set of reusable utility classes for layout, typography, and more. When appropriate, prefer using these utility classes over creating new component-specific styles.
- **State Management:** Use `van.state()` for reactive state.
- **Components:** Follow the structure of existing components in `src/van13k`.

## Deployment

The project is deployed to Cloudflare Pages. The `wrangler.jsonc` file configures the deployment. To deploy, run `bun run deploy`.