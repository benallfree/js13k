# van13k Library Context for AI Assistant

This document provides specific context about the `src/van13k` UI component library for the AI assistant.

## Overview

`van13k` is a custom, lightweight UI component library built on top of `van.js`. It provides a set of reusable components and utilities for building modern web applications.

## Import Convention

All components and utilities exported from `src/van13k/index.ts` should be imported using the `@van13k` path alias. This ensures consistent and clean imports throughout the project.

**Example:**

```typescript
import { Button, Modal, classify } from '@van13k'
```

**Do NOT use relative imports for `van13k` components/utilities:**

```typescript
// BAD: Avoid relative imports for van13k components
import { Modal } from '../van13k/Modal'
```

## VanJS Patterns for Components

- **State Reactivity:** When referencing `.val` of state variables, be careful of re-execution scope. Wrap state access in nested functions to limit reactivity to just that inner function rather than the entire enclosing function.
- **Routing:** Use vanjs-routing (@router) for navigation within components.

## CSS Rules for Components

- **Use Tailwind CSS** for all styling
- **Avoid inline styles** unless they are dynamic
- **Use the classify helper** for combining classes conditionally
- **Component styling:** Use Tailwind utility classes directly in components
- **Custom styles:** If needed, add them to the Tailwind config or use CSS-in-JS patterns
- **No CSS Modules:** Project has migrated away from CSS modules to Tailwind CSS

## Structure

- `src/van13k/components/`: Individual UI components (e.g., `Button.ts`, `Modal.ts`).
- `src/van13k/util/`: Utility functions (e.g., `classify.ts`, `compress.ts`, `generateGuid.ts`).
- `src/van13k/router/`: Client-side routing implementation.
- `src/van13k/index.ts`: The main entry point that re-exports all public components and utilities from the library.

## Key Components and Utilities

- **`Modal.ts`**: Provides a flexible modal dialog component. It manages its own open/close state and can display custom content and buttons.
- **`InputModal.ts`**: A specialized modal for text input. It uses `Modal` internally and handles input state, auto-focus, and keyboard events (Enter to confirm, Escape to cancel).
- **`Button.ts`**: A versatile button component with various variants and sizes.
- **`classify.ts`**: A utility for composing class names, supporting conditional classes and Tailwind utilities.
- **`compress.ts`**: Compression utilities with Base62 encoding for space-efficient data storage:

  - `compressToBase62(obj: unknown): Promise<string>` - Compresses any object to a Base62 string using gzip compression. Perfect for URL parameters or localStorage.
  - `decompressFromBase62<T>(base62: string): Promise<T>` - Decompresses a Base62 string back to the original object with full type safety.

  **Example usage:**

  ```typescript
  import { compressToBase62, decompressFromBase62 } from '@van13k'

  // Compress game state for sharing
  const gameState = { players: ['Alice', 'Bob'], round: 3 }
  const compressed = await compressToBase62(gameState)

  // Decompress back to original object
  const restored = await decompressFromBase62<typeof gameState>(compressed)
  ```

- **`generateGuid.ts`**: Generates short, unique IDs using a safe character set that excludes visually confusing characters (no O/0, I/l/1, etc.). Uses characters `23456789ABCDEFGHJKMNPQRSTUVWXYZ` for maximum readability. Perfect for join codes, session IDs, and other user-facing

## Important Notes for AI Assistant

- When asked to add new components or utilities that are intended to be part of the `van13k` library, ensure they are placed within the `src/van13k` directory and exported via `src/van13k/index.ts`.
- Always use the `@van13k` alias for imports from this library.
- Do not confuse `van13k` (the UI library) with `fabletop` (the main application/project name).
- All styling must use Tailwind CSS utility classes with the classify helper when needed.
