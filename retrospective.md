# Building WorldForge for js13k

## Packing lessons

- DRYing code and refactoring is worth the effort
- Terser + zip do an amazing job of eliminating all types of redundancy
- Use many modules and copious variable names - makes no difference
- Fiddling with the most efficient JS expression is not worth the effort
- ZDD - Zero Dependency Development - select the pieces of dependencies you want to use and pull them in by hand. You want full control of the code.
- Zip does a better job of compressing redundant literals than you can do by hoisting them into constants and making terser mangle the constant name.
- Mangling top level names is worth the effort (`eval: true`)
- Mangling property names is error-prone and zip does a better job anyway

## Starting with Svelte

- I liked vite
- I really like Svelte
- Componets became bloaty overhead
- Especially components that used `<slot/>`
- basically, the cool stuff about svelte defeated itself

## Refactoring to VanJS

- Searched for `smallest reactive framework` and VanJS came up
- VanJS is pure JavaScript
- It seemed perfect!
- Dramatic reduction: over 50% smaller, and total control
- Porting to Svelte was tedious, but not hard
- Learning VanJS was easy. It's so raw that some things taken for granted were again remembered. Example: click handler propagation is not handled natively. Passing `function()` instead of `()=>{}` so you can have `this` referring to the element that fired the event. Old school HTML.

## CSS Modules experiment

- created 20-30 bytes of bloat for every component
