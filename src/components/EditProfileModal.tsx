import React, { useState } from 'react';
import { UserProfileData } from '../types/onboarding';
import { loadUserProfile, saveUserProfile } from '../lib/onboardingStorage';
import { generateUserPlanAndQuests } from '../lib/planGenerator';
import { useTheme } from '../context/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Save, Sparkles, RefreshCw } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSaved }) => {
  const { character, sendNotification, playSound } = useTheme();
  const [profile, setProfile] = useState<UserProfileData>(loadUserProfile);
  const [activeSection, setActiveSection] = useState<'basic' | 'skills' | 'physique' | 'routine' | 'coach'>('basic');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaving(true);
    playSound('chime');

    try {
      saveUserProfile(profile);
      generateUserPlanAndQuests(profile);
      sendNotification('Profile Updated', 'Your answers and personalized plan have been updated successfully!');
      setTimeout(() => {
        setIsSaving(false);
        onSaved();
        onClose();
      }, 300);
    } catch {
      setIsSaving(false);
      sendNotification('Error', 'Failed to update profile.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 text-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Edit Questionnaire Answers</h2>
              <p className="text-[11px] text-slate-400">All answers adapt your daily timetable & AI coach</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 px-4 pt-3 border-b border-slate-800 overflow-x-auto no-scrollbar text-xs font-semibold">
          {[
            { id: 'basic', label: 'Aim & Role' },
            { id: 'skills', label: 'Skills' },
            { id: 'physique', label: 'Physique' },
            { id: 'routine', label: 'Routine' },
            { id: 'coach', label: 'AI Coach' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`px-3 py-2 rounded-t-xl transition border-b-2 font-bold shrink-0 ${
                activeSection === tab.id
                  ? 'border-sky-400 text-sky-400 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Basic & Aim Section */}
          {activeSection === 'basic' && (
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Your Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Main Aim or Goal</label>
                <textarea
                  rows={2}
                  value={profile.mainGoal}
                  onChange={(e) => setProfile({ ...profile, mainGoal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Profession</label>
                  <input
                    type="text"
                    value={profile.profession}
                    onChange={(e) => setProfile({ ...profile, profession: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Year / Experience</label>
                  <input
                    type="text"
                    value={profile.yearOrExperience}
                    onChange={(e) => setProfile({ ...profile, yearOrExperience: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Field / Branch / Major</label>
                <input
                  type="text"
                  value={profile.fieldOrBranch}
                  onChange={(e) => setProfile({ ...profile, fieldOrBranch: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold"
                />
              </div>
            </div>
          )}

          {/* Skills Section */}
          {activeSection === 'skills' && (
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                  Target Skills (Comma Separated)
                </label>
                <input
                  type="text"
                  value={profile.skillsToMaster.join(', ')}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      skillsToMaster: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 block">Baseline Levels:</label>
                {profile.skillsToMaster.map((skill) => (
                  <div key={skill} className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-semibold truncate max-w-[200px]">{skill}</span>
                    <select
                      value={profile.skillLevels[skill] || 'Intermediate'}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          skillLevels: { ...profile.skillLevels, [skill]: e.target.value as any },
                        })
                      }
                      className="px-2 py-1 rounded bg-slate-800 text-sky-400 font-bold border border-slate-700"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Physique Section */}
          {activeSection === 'physique' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold">Build Body Program Active?</span>
                <button
                  type="button"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      wantToBuildBody: profile.wantToBuildBody === 'Yes' ? 'No' : 'Yes',
                    })
                  }
                  className={`px-3 py-1 rounded-lg font-bold text-xs ${
                    profile.wantToBuildBody === 'Yes' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {profile.wantToBuildBody}
                </button>
              </div>

              {profile.wantToBuildBody === 'Yes' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Goal</label>
                      <input
                        type="text"
                        value={profile.physiqueGoal || 'Build muscle'}
                        onChange={(e) => setProfile({ ...profile, physiqueGoal: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Workout Days/Wk</label>
                      <input
                        type="number"
                        min={2}
                        max={6}
                        value={profile.workoutDaysPerWeek || 4}
                        onChange={(e) => setProfile({ ...profile, workoutDaysPerWeek: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Place</label>
                      <select
                        value={profile.trainingPlace || 'Gym'}
                        onChange={(e) => setProfile({ ...profile, trainingPlace: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold"
                      >
                        <option value="Gym">Gym</option>
                        <option value="Home">Home</option>
                        <option value="Outdoors">Outdoors</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Diet</label>
                      <select
                        value={profile.foodPreference || 'Non-veg'}
                        onChange={(e) => setProfile({ ...profile, foodPreference: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold"
                      >
                        <option value="Veg">Veg</option>
                        <option value="Non-veg">Non-veg</option>
                        <option value="Vegan">Vegan</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Routine Section */}
          {activeSection === 'routine' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Wake Time</label>
                  <input
                    type="time"
                    value={profile.wakeUpTime}
                    onChange={(e) => setProfile({ ...profile, wakeUpTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Sleep Time</label>
                  <input
                    type="time"
                    value={profile.sleepTime}
                    onChange={(e) => setProfile({ ...profile, sleepTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Daily Free Hours ({profile.freeHoursPerDay} hrs)
                </label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={profile.freeHoursPerDay}
                  onChange={(e) => setProfile({ ...profile, freeHoursPerDay: Number(e.target.value) })}
                  className="w-full accent-sky-400"
                />
              </div>
            </div>
          )}

          {/* AI Coach Section */}
          {activeSection === 'coach' && (
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Coach Name</label>
                <input
                  type="text"
                  value={profile.coachName}
                  onChange={(e) => setProfile({ ...profile, coachName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Coach Personality</label>
                <select
                  value={profile.coachPersonality}
                  onChange={(e) => setProfile({ ...profile, coachPersonality: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold"
                >
                  <option value="Friendly">Friendly</option>
                  <option value="Strict Mentor">Strict Mentor</option>
                  <option value="Funny Buddy">Funny Buddy</option>
                  <option value="Calm Guide">Calm Guide</option>
                  <option value="Savage Roast">Savage Roast</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 font-bold text-xs text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-sky-500 hover:bg-sky-400 shadow-md transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Updating...' : 'Save & Regenerate'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
