# LLM Project Context

This document provides context for the AI assistant to understand the project's structure, conventions, and goals.

## Project Overview

Fabletop is a game platform where players lay tablets on the table and link them together to create a playing surface. They then use their mobile devices (phones) for any private player info such as cards they don't want to show. Cards can be "slid" out of the phone and onto the table, or "slid" off the table and onto the phones. So the idea is to use real play pieces when possible but also provide virtual pieces (markers, dice, cards, etc) when the real ones are not available. Fabletop has a design mode where new games can be created and shared in the Game Store, a discovery tool to find new games to play, and a way to save the state of a game.

The project uses `van.js`, a minimal reactive framework, and a custom UI component library called `van13k`.

## Tech Stack

- **Framework:** van.js
- **Language:** TypeScript
- **Package Manager:** bun
- **Build Tool:** Vite
- **UI Components:** vibescale (https://npmjs.com/vibescale) and a custom library in `src/van13k`
- **Styling:** Tailwind CSS
- **Deployment:** Cloudflare Pages

## Tool/CLI Rules

- **Never git commit**
- **Never start a server** (Do NOT run the application)
- Use Bun as the package manager
- **Build command:** Always use `bun run build`, never `bun build`

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

- **Use Tailwind CSS** for all styling
- **Avoid inline styles** unless they are dynamic
- **Use the classify helper** for combining classes conditionally
- **Component styling:** Use Tailwind utility classes directly in components
- **Custom styles:** If needed, add them to the Tailwind config or use CSS-in-JS patterns
- **No CSS Modules:** Project has migrated away from CSS modules to Tailwind CSS

## Helpers

- **classify():** Returns `{ class: ... }`. Use for combining Tailwind classes conditionally or with dynamic values

## Coding Conventions

- **Imports:** Use path aliases for clean imports:
  - `@/` for `src/`
  - `@van13k` for `src/van13k/index.ts`. All components and utilities exported from `src/van13k/index.ts` should be imported using this alias, not relative paths.
- **Styling:** Use Tailwind CSS utility classes for all styling. The `classify()` utility from `@van13k` should be used for composing class names conditionally.
- **State Management:** Use `van.state()` for reactive state.
- **Components:** Follow the structure of existing components in `src/van13k`.

## Deployment

The project is deployed to Cloudflare Pages. The `wrangler.jsonc` file configures the deployment. To deploy, run `bun run deploy`.
