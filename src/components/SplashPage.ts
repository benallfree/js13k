import { Splash } from '../common/Splash'

export const SplashPage = () => {
  return Splash({
    title: 'Beat Threads',
    storageKey: 'js13k-splash-dismissed',
    sections: [
      {
        title: 'How to Play',
        content: [
          'Create and share musical beats with others!',
          '• Click on the grid to create beats',
          '• Use the controls to adjust tempo and volume',
          '• Save your beats to your library',
          '• Share your beats with others',
        ],
      },
      {
        title: 'Tips',
        content: [
          '• Try different patterns to create unique rhythms',
          '• Experiment with different tempos',
          '• Save your favorite beats for later',
        ],
      },
    ],
  })
}
