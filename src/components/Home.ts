import { div, h1, p, span } from '@van13k'
import styles from './Home.module.scss'

export const Home = () =>
  div({ class: styles.app }, [
    div({ class: styles.floatingElements }, [
      div({ class: styles.floatingElement }),
      div({ class: styles.floatingElement }),
      div({ class: styles.floatingElement }),
      div({ class: styles.floatingElement }),
      div({ class: styles.floatingElement }),
    ]),
    div({ class: styles.mainContent }, [
      h1({ class: styles.title }, 'Van', span('13k')),
      p({ class: styles.subtitle }, 'The ultimate starter kit for VanJS + js13k games'),
      div({ class: styles.badge }, 'Ready to build something amazing?'),
    ]),
  ])
