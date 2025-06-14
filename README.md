# JS13K Starter Kit 🚀

A production-ready starter template for JS13K game development featuring modern tooling, aggressive optimization, and real-time size monitoring.

## ✨ Features

### 🎯 **Ultra-Compact Framework**
- **van.js** - Minimal reactive framework (~1.2KB gzipped)
- Perfect for JS13K with minimal overhead
- Simple, reactive UI updates without bloat

### 🔧 **Optimized Build System**
- **Vite** - Lightning-fast development server
- **Terser** - Aggressive minification and mangling
- Console stripping in production builds
- Module preload polyfill disabled for smaller bundles

### 📏 **Real-time Size Monitoring**
- Automated 13KB limit checking after each build
- Live file watching with `bun size:watch`
- macOS notifications when approaching size limit
- Build stats automatically updated in README

### 🛠️ **Developer Experience**
- **TypeScript** - Full type safety and IntelliSense
- **Path aliases** - Clean imports (`@/`, `$util/`, `$components/`)
- **Prettier** - Consistent code formatting
- **Bundle analyzer** - Visualize what's taking up space

### 📦 **Automated Workflow**
- Pre/post build scripts for version management
- Automatic README updates with build stats
- ZIP creation and size validation
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

## 📊 Build Stats

| Spec  | Info                |
| ----- | ------------------- |
| Build | <!-- BUILD -->5     |
| Bytes | <!-- BYTES -->2769 |

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

