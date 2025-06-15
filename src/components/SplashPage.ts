import { Splash } from '../common/Splash'

export const SplashPage = () => {
  return Splash({
    title: 'JS13K Starter',
    storageKey: 'js13k-splash-dismissed',
    sections: [
      {
        title: 'Features',
        content: [
          'Vite + Typescript',
          'Terser and ZIP',
          'CSS Modules',
          'VanJS',
          'VanJS Routing',
          'Cloudflare Deployment',
          'LightningCSS',
        ],
      },
    ],
  })
}
