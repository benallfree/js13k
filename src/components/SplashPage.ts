import { Splash } from '@/common/Splash'

export const SplashPage = () => {
  return Splash({
    title: 'Beat Threads',
    storageKey: 'js13k-splash-dismissed',
    sections: [
      {
        title: 'Create & Collaborate',
        content: [
          '🎵 Build beats with a 16-step drum sequencer',
          '🥁 7 instruments: Kick, Snare, Hi-Hat, Crash, Tom, Clap & Cowbell',
          '👥 Collaborate with others by sharing your X handle',
          '🔗 Share beats instantly with generated URLs',
          '💾 Auto-save keeps your work safe',
        ],
      },
      {
        title: 'How to Use',
        content: [
          '• Click grid cells to place drum hits',
          '• Select different instruments from the bottom toolbar',
          '• Press play to hear your beat at 125 BPM',
          '• Save to your personal beat library',
          '• Share URLs contain the full beat data',
        ],
      },
      {
        title: 'Pro Tips',
        content: [
          '🎯 Layer different instruments for complex rhythms',
          '💥 Use crash cymbals for dramatic emphasis',
          '🔔 Hi-hats and cowbells add texture and groove',
          '📱 Beats work across devices via shareable links',
        ],
      },
    ],
  })
}
