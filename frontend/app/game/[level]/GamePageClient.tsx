'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getActiveProfileSync, type Profile } from '@/lib/profiles'
import GameCanvas from '@/components/GameCanvas'
import ProfileModal from '@/components/ProfileModal'
import styles from './game.module.css'

interface GamePageClientProps {
  level: string
}

export default function GamePageClient({ level }: GamePageClientProps) {
  const router = useRouter()
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for active profile on mount
    const profile = getActiveProfileSync()
    if (!profile) {
      // No profile selected - will show profile required screen
      setShowProfileModal(false)
    } else {
      setActiveProfile(profile)
    }
    setLoading(false)
  }, [])

  const handleProfileSelected = (profile: Profile) => {
    setActiveProfile(profile)
    setShowProfileModal(false)
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleSelectProfile = () => {
    setShowProfileModal(true)
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading...</p>
      </div>
    )
  }

  // Show profile required screen if no profile
  if (!activeProfile) {
    return (
      <>
        <div className={styles.noProfile}>
          <div className={styles.noProfileCard}>
            <h2>Profile Required</h2>
            <p>Please select a profile to track your progress and play the game.</p>
            <div className={styles.noProfileActions}>
              <button 
                className={styles.selectProfileButton}
                onClick={handleSelectProfile}
              >
                Select Profile
              </button>
              <button 
                className={styles.backButton}
                onClick={handleBackToHome}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
        
        <ProfileModal 
          isOpen={showProfileModal}
          onClose={() => {
            // Don't allow closing without selecting profile
            if (activeProfile) {
              setShowProfileModal(false)
            }
          }}
          onProfileSelected={handleProfileSelected}
        />
      </>
    )
  }

  // Profile exists - show game with header
  return (
    <>
      <div className={styles.gameHeader}>
        <button 
          className={styles.backButton}
          onClick={handleBackToHome}
        >
          ← Back to Home
        </button>
        <div className={styles.profileInfo}>
          <span className={styles.playingAs}>Playing as:</span>
          <span className={styles.profileName}>{activeProfile.name}</span>
          <span className={styles.profileAge}>Age {activeProfile.age}</span>
        </div>
      </div>
      <GameCanvas level={level} />
    </>
  )
}
