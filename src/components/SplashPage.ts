import { Splash } from '@van13k'

export const SplashPage = () => {
  return Splash({
    title: 'Van13k Starter',
    storageKey: 'van13k-splash-dismissed',
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
        ],
      },
    ],
  })
}
