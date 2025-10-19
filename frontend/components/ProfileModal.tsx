'use client'

import { useState, useEffect } from 'react'
import { getProfiles, createProfile, deleteProfile, setActiveProfile, type Profile } from '@/lib/profiles'
import styles from './ProfileModal.module.css'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onProfileSelected: (profile: Profile) => void
}

export default function ProfileModal({ isOpen, onClose, onProfileSelected }: ProfileModalProps) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'prefer-not-to-say' as Profile['gender'],
    weight: '',
    height: '',
  })

  useEffect(() => {
    if (isOpen) {
      loadProfiles()
    }
  }, [isOpen])

  const loadProfiles = async () => {
    setLoading(true)
    const profilesList = await getProfiles()
    setProfiles(profilesList)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.age) {
      alert('Name and age are required')
      return
    }

    try {
      await createProfile({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
      })

      await loadProfiles()
      setShowForm(false)
      setFormData({
        name: '',
        age: '',
        gender: 'prefer-not-to-say',
        weight: '',
        height: '',
      })
    } catch (error) {
      alert('Failed to create profile. Please try again.')
      console.error(error)
    }
  }

  const handleSelectProfile = (profile: Profile) => {
    setActiveProfile(profile)
    onProfileSelected(profile)
    onClose()
  }

  const handleDeleteProfile = async (profileId: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}'s profile?`)) {
      const success = await deleteProfile(profileId)
      if (success) {
        await loadProfiles()
      } else {
        alert('Failed to delete profile')
      }
    }
  }

  // Filter profiles based on search query
  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.age.toString().includes(searchQuery)
  )

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{showForm ? 'Create New Profile' : 'Select Profile'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Loading profiles...</div>
          ) : showForm ? (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Child's name"
                  required
                  autoFocus
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="age">Age *</label>
                <input
                  id="age"
                  type="number"
                  min="3"
                  max="18"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Age in years"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Profile['gender'] })}
                >
                  <option value="prefer-not-to-say">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="weight">Weight (kg)</label>
                  <input
                    id="weight"
                    type="number"
                    min="10"
                    max="150"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="Optional"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="height">Height (cm)</label>
                  <input
                    id="height"
                    type="number"
                    min="50"
                    max="200"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  Create Profile
                </button>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <button 
                className={styles.createButton}
                onClick={() => setShowForm(true)}
              >
                + Create New Profile
              </button>

              {profiles.length > 0 && (
                <div className={styles.searchBox}>
                  <span className={styles.searchIcon}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search profiles by name or age..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  {searchQuery && (
                    <button 
                      className={styles.clearSearch}
                      onClick={() => setSearchQuery('')}
                      title="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}

              {profiles.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No profiles yet. Create one to get started!</p>
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No profiles found matching "{searchQuery}"</p>
                  <button 
                    className={styles.clearSearchButton}
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className={styles.profilesGrid}>
                  {filteredProfiles.map((profile) => (
                    <div key={profile.profileId} className={styles.profileCard}>
                      <div className={styles.profileHeader}>
                        <h3>{profile.name}</h3>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteProfile(profile.profileId, profile.name)}
                          title="Delete profile"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className={styles.profileInfo}>
                        <p><strong>Age:</strong> {profile.age} years</p>
                        <p><strong>Gender:</strong> {profile.gender.replace('-', ' ')}</p>
                        {profile.weight && <p><strong>Weight:</strong> {profile.weight} kg</p>}
                        {profile.height && <p><strong>Height:</strong> {profile.height} cm</p>}
                      </div>

                      <button
                        className={styles.selectButton}
                        onClick={() => handleSelectProfile(profile)}
                      >
                        Select Profile
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
