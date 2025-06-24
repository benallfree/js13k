# Van13k - the js13k Starter Kit 🚀

## 📊 Build Stats

| Spec  | Info               |
| ----- | ------------------ |
| Build | <!-- BUILD -->1147    |
| Bytes | <!-- BYTES -->6385 |


A **2.6k** production-ready starter template for js13k game development featuring modern tooling, aggressive optimization, and real-time size monitoring.

## ✨ Features

### 🎯 **Ultra-Compact Framework**

- **van.js** - Minimal reactive framework (~1.2KB gzipped)
- **VanJS Routing** - Lightweight client-side routing
- Perfect for JS13K with minimal overhead
- Simple, reactive UI updates without bloat

### 🔧 **Optimized Build System**

- **Vite** - Lightning-fast development server
- **Terser** - Aggressive minification and mangling
- **LightningCSS** - Fast CSS processing and optimization
- **ZIP** - Automated archive creation for submission
- Console stripping in production builds
- Module preload polyfill disabled for smaller bundles

### 📏 **Real-time Size Monitoring**

- **Base starter size: ~2.6k** (leaves 10.4k for your game!)
- Automated 13KB limit checking after each build
- Live file watching with `bun size:watch`
- macOS notifications when approaching size limit
- Build stats automatically updated in README

### 🛠️ **Developer Experience**

- **TypeScript** - Full type safety and IntelliSense
- **CSS Modules** - Scoped styling with class name hashing
- **Path aliases** - Clean imports (`@/`, `$util/`, `$components/`)
- **Prettier** - Consistent code formatting
- **Bundle analyzer** - Visualize what's taking up space

### 📦 **Automated Workflow**

- Pre/post build scripts for version management
- Automatic README updates with build stats
- ZIP creation and size validation
- **Cloudflare Deployment** - Production hosting setup
- Ready for contest submission

### 🎮 **JS13K Optimizations**

- Drop console statements in production
- Toplevel variable mangling
- Module preload polyfill removal
- Aggressive compression settings

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build and check size
bun size

# Watch for changes and auto-rebuild
bun size:watch

# Analyze bundle composition
bun analyze
```


## 🎯 Why This Starter?

**For JS13K Success:**

- ⚡ **Fast iteration** - Hot reload during development
- 📈 **Size awareness** - Constant feedback on bundle size
- 🔍 **Bundle analysis** - Identify optimization opportunities
- 🎨 **Modern DX** - TypeScript, path aliases, formatting
- 📱 **Production ready** - Optimized builds with aggressive compression

**Perfect for:**

- First-time JS13K participants
- Developers wanting modern tooling
- Teams needing size monitoring
- Projects requiring reactive UI updates

Start building your JS13K masterpiece with confidence! 🎮
