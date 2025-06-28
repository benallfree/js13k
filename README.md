# Van13k - the js13k Starter Kit 🚀

## 📊 Build size <!-- BYTES -->2655


A **2.6k** production-ready starter template for js13k game development featuring modern tooling, aggressive optimization, real-time size monitoring, and a comprehensive UI component library.

## 🎨 Van13k UI Framework

### 📦 **Core Components**

- **Modal & Dialogs** - Confirmation, Input, and Share modals with backdrop handling
- **Navigation** - BottomTray, Breadcrumb, and StatusBar components
- **Forms & Controls** - Button, Icon with variant support and touch handling
- **Layout** - SectionHeader and responsive layouts
- **Routing** - Client-side router with params, query strings, and Link component
- **Splash Screen** - Dismissible help/intro screens with localStorage persistence

### 🛠️ **Utilities**

- **classify()** - CSS module class composition with reactivity
- **clickify()** - Touch-friendly click handling with scroll detection
- **compress/decompress** - gzip + Base62 encoding for URL-safe data
- **service()** - Simple dependency injection container
- **generateGuid()** - Compact unique ID generation for JS13K
- **formatDate()** - Human-readable date formatting

### 🎯 **CSS Architecture**

- **CSS Modules** - Scoped styling with automatic class name hashing
- **Utility Classes** - Pre-built responsive utilities in `styles.module.css`
- **Component Styles** - Isolated component-specific styling
- **classify()** - Type-safe class composition with conditional classes

## ✨ Framework Features

### 🎯 **Ultra-Compact Framework**

- **van.js** - Minimal reactive framework (~1.2KB gzipped)
- **VanJS Routing** - Lightweight client-side routing with params/query support
- **van13k Components** - Production-ready UI components optimized for size
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

## 📖 Usage Guide

### 🚀 **Quick Example**

```typescript
import { Button, Modal, Router, van, classify } from '@van13k'
import styles from './App.module.css'

// Simple component with reactive state
const Counter = () => {
  const count = van.state(0)
  
  return div(
    { ...classify(styles.counter) },
    p(() => `Count: ${count.val}`),
    Button({
      onClick: () => count.val++,
      variant: ButtonVariant.Primary,
      children: 'Increment'
    })
  )
}

// Modal usage
const confirmModal = ConfirmationModal({
  title: 'Delete Item',
  message: 'Are you sure you want to delete this item?',
  onConfirm: () => console.log('Deleted!'),
  onCancel: () => confirmModal.close()
})

// Router setup
Router({
  routes: [
    { path: '/', component: () => Counter() },
    { path: '/about', component: () => div('About Page') },
    { path: '*', component: () => div('404 Not Found') }
  ]
})
```

### 🎨 **Component Examples**

```typescript
// Button variants
Button({
  onClick: () => {},
  variant: ButtonVariant.Primary, // Primary, Danger, Secondary, Cancel, Success
  size: ButtonSize.Large,
  children: 'Click Me'
})

// Modal with custom content
const modal = Modal({
  title: 'Settings',
  content: () => div('Modal content here'),
  buttons: [
    { text: 'Save', onClick: () => {}, variant: ButtonVariant.Primary },
    { text: 'Cancel', onClick: () => modal.close() }
  ]
})

// Navigation breadcrumb
Breadcrumb({
  items: [
    { label: 'Home', href: '/' },
    { label: 'Settings', onClick: () => {} },
    { label: 'Profile' } // Current page
  ]
})

// Status notifications
import { flash } from '@van13k'
flash('Settings saved successfully!', 3000)
```

### 🎯 **CSS Best Practices**

```typescript
// Use classify() for CSS modules
import { classify } from '@van13k'
import styles from './Component.module.css'

div({
  ...classify(
    styles.container,        // Component-specific
    styles.active,          // Conditional
    'utility-class'         // From styles.module.css
  )
})

// Conditional classes
div({
  ...classify(
    styles.base,
    () => isActive.val ? styles.active : styles.inactive
  )
})
```

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
