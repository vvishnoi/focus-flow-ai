'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getActiveProfileSync, clearActiveProfile, type Profile } from '@/lib/profiles'
import ProfileModal from '@/components/ProfileModal'
import ConfirmDialog from '@/components/ConfirmDialog'
import styles from './page.module.css'

export default function Home() {
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    const profile = getActiveProfileSync()
    if (profile) {
      setActiveProfile(profile)
    }
    // Don't auto-open modal - let therapist work without profile if needed
  }, [])

  const handleChangeProfile = () => {
    setShowProfileModal(true)
  }

  const handleClearProfile = () => {
    setShowClearConfirm(true)
  }

  const handleConfirmClear = () => {
    clearActiveProfile()
    setActiveProfile(null)
    setShowClearConfirm(false)
    // Don't open profile modal - let therapist continue without profile
  }

  const handleProfileSelected = (profile: Profile) => {
    setActiveProfile(profile)
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🎯</span>
            <span className={styles.logoText}>FocusFlow AI</span>
          </div>
          
          <div className={styles.navRight}>
            {activeProfile ? (
              <div className={styles.profileMenu}>
                <div className={styles.profileDisplay}>
                  <div className={styles.profileAvatar}>
                    {activeProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.profileDetails}>
                    <div className={styles.profileNameSmall}>{activeProfile.name}</div>
                    <div className={styles.profileAgeSmall}>Age {activeProfile.age}</div>
                  </div>
                </div>
                <div className={styles.navActions}>
                  <button 
                    className={styles.navButton}
                    onClick={handleChangeProfile}
                    title="Change profile"
                  >
                    <span className={styles.buttonIcon}>👤</span>
                    Switch
                  </button>
                  <button 
                    className={styles.navButtonDanger}
                    onClick={handleClearProfile}
                    title="Clear profile"
                  >
                    <span className={styles.buttonIcon}>✕</span>
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className={styles.navButtonPrimary}
                onClick={() => setShowProfileModal(true)}
              >
                <span className={styles.buttonIcon}>👤</span>
                Select Profile
              </button>
            )}
          </div>
        </div>
      </nav>

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

      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileSelected={handleProfileSelected}
      />

      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Profile?"
        message="This will log out the current patient. You can continue without a profile or select a new one."
        confirmText="Clear Profile"
        cancelText="Cancel"
        onConfirm={handleConfirmClear}
        onCancel={() => setShowClearConfirm(false)}
        danger={true}
      />
    </>
  )
}
