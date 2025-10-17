import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>FocusFlow AI</h1>
        <p className={styles.subtitle}>
          Gamified visual tracking and attention training
        </p>
        
        <div className={styles.levelGrid}>
          <Link href="/game/level1" className={styles.levelCard}>
            <div className={styles.levelNumber}>Level 1</div>
            <h2>Follow the Leader</h2>
            <p>Follow a single moving object</p>
            <span className={styles.difficulty}>Beginner</span>
          </Link>

          <Link href="/game/level2" className={styles.levelCard}>
            <div className={styles.levelNumber}>Level 2</div>
            <h2>Collision Course</h2>
            <p>Track multiple moving objects</p>
            <span className={styles.difficulty}>Mid-Level</span>
          </Link>

          <Link href="/game/level3" className={styles.levelCard}>
            <div className={styles.levelNumber}>Level 3</div>
            <h2>Find the Pattern</h2>
            <p>Identify patterns and ignore distractors</p>
            <span className={styles.difficulty}>Pro-Level</span>
          </Link>
        </div>

        <Link href="/dashboard" className={styles.dashboardLink}>
          View Progress Dashboard
        </Link>
      </div>
    </main>
  )
}
