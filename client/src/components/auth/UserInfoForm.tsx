import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type UserInfoFormData from '../../types/userInfo';

const UserInfoForm: React.FC = () => {
  const [formData, setFormData] = useState<UserInfoFormData>({
    fullName: '', bio: '', location: '', phone: '', email: '', portfolio: '',
    institute: '', graduationYear: '',
    links: {
      github: '', linkedin: '', twitter: '', instagram: '', gfg: '', leetcode: '',
      codechef: '', code360: '', codeforces: '', hackerrank: ''
    },
    skills: [],
    experience: { years: '', currentRole: '', company: '' }
  });

  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<'basic' | 'contact' | 'academic' | 'platforms' | 'skills' | 'experience'>('basic');
  
  const path = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { isProfileCompleted, isAuthenticated, setIsProfileComplet } = useAuth();

  useEffect(() => {
    if (isAuthenticated && isProfileCompleted) navigate('/');
    else if (!isAuthenticated) navigate('/');
  }, [isAuthenticated, isProfileCompleted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      experience: { ...formData.experience, years: formData.experience.years ? parseInt(formData.experience.years) : 0 },
      graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined
    };

    try {
      const response = await fetch(path + '/api/user/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        navigate('/dashboard');
        setIsProfileComplet();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save profile information');
      }
    } catch (error) {
      console.error('Error saving user info:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinksChange = (platform: keyof typeof formData.links, value: string) => {
    setFormData({ ...formData, links: { ...formData.links, [platform]: value } });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(skill => skill !== skillToRemove) });
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  // Validation functions
  const isValidURL = (url: string): boolean => {
    if (!url.trim()) return true; // Empty is okay (optional field)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidUsername = (username: string): boolean => {
    if (!username.trim()) return true; // Empty is okay
    // Check if it's not a URL (doesn't contain :// or www.)
    return !username.includes('://') && !username.toLowerCase().startsWith('www.');
  };

  const canProceedToNext = (): boolean => {
    // Name is mandatory for proceeding from basic section
    if (activeSection === 'basic' && !formData.fullName.trim()) {
      setError('Full Name is required to continue');
      return false;
    }

    // Validate portfolio URL if provided
    if (activeSection === 'contact' && formData.portfolio && !isValidURL(formData.portfolio)) {
      setError('Please enter a valid portfolio URL (e.g., https://example.com)');
      return false;
    }

    // Validate platform usernames
    if (activeSection === 'platforms') {
      const invalidPlatforms = Object.entries(formData.links)
        .filter(([, value]) => value && !isValidUsername(value))
        .map(([key]) => key);

      if (invalidPlatforms.length > 0) {
        setError(`Please enter only usernames (not full URLs) for: ${invalidPlatforms.join(', ')}`);
        return false;
      }
    }

    setError('');
    return true;
  };

  // Sections configuration
  const sections = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'contact', label: 'Contact', icon: '📧' },
    { id: 'academic', label: 'Academic', icon: '🎓' },
    { id: 'platforms', label: 'Platforms', icon: '💻' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'experience', label: 'Experience', icon: '💼' }
  ] as const;

  // Input field configurations
  const basicFields = [
    { type: 'text', placeholder: 'Full Name *', value: formData.fullName, onChange: (v: string) => setFormData({ ...formData, fullName: v }), required: true, autoFocus: true },
    { type: 'textarea', placeholder: 'Bio / About yourself (optional)', value: formData.bio, onChange: (v: string) => setFormData({ ...formData, bio: v }) },
    { type: 'text', placeholder: 'Location (City, Country) (optional)', value: formData.location, onChange: (v: string) => setFormData({ ...formData, location: v }) }
  ];

  const contactFields = [
    { type: 'email', placeholder: 'Email Address (optional)', value: formData.email, onChange: (v: string) => setFormData({ ...formData, email: v }) },
    { type: 'tel', placeholder: 'Phone Number (optional)', value: formData.phone, onChange: (v: string) => setFormData({ ...formData, phone: v }) },
    { type: 'url', placeholder: 'Portfolio Website URL (optional) - e.g., https://yoursite.com', value: formData.portfolio, onChange: (v: string) => setFormData({ ...formData, portfolio: v }) }
  ];

  const academicFields = [
    { type: 'text', placeholder: 'Institute / University Name (optional)', value: formData.institute, onChange: (v: string) => setFormData({ ...formData, institute: v }) },
    { type: 'number', placeholder: 'Graduation Year (optional) - e.g., 2025', value: formData.graduationYear, onChange: (v: string) => setFormData({ ...formData, graduationYear: v }), min: 1950, max: 2050 }
  ];

  const platformFields = [
    { platform: 'github', placeholder: 'GitHub Username (not URL, just username)' },
    { platform: 'linkedin', placeholder: 'LinkedIn Username (not URL, just username)' },
    { platform: 'twitter', placeholder: 'Twitter/X Username (not URL, just username)' },
    { platform: 'instagram', placeholder: 'Instagram Username (not URL, just username)' },
    { platform: 'leetcode', placeholder: 'LeetCode Username (not URL, just username)' },
    { platform: 'codeforces', placeholder: 'CodeForces Username (not URL, just username)' },
    { platform: 'codechef', placeholder: 'CodeChef Username (not URL, just username)' },
    { platform: 'gfg', placeholder: 'GeeksforGeeks Username (not URL, just username)' },
    { platform: 'hackerrank', placeholder: 'HackerRank Username (not URL, just username)' },
    { platform: 'code360', placeholder: 'Code360 Username (not URL, just username)' }
  ];

  const experienceFields = [
    { type: 'number', placeholder: 'Years of Experience (optional)', value: formData.experience.years, onChange: (v: string) => setFormData({ ...formData, experience: { ...formData.experience, years: v } }), min: 0 },
    { type: 'text', placeholder: 'Current Role / Position (optional)', value: formData.experience.currentRole, onChange: (v: string) => setFormData({ ...formData, experience: { ...formData.experience, currentRole: v } }) },
    { type: 'text', placeholder: 'Company Name (optional)', value: formData.experience.company, onChange: (v: string) => setFormData({ ...formData, experience: { ...formData.experience, company: v } }) }
  ];

  // Common input className
  const inputClass = "w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm";

  const renderInput = (field: any, index: number) => {
    if (field.type === 'textarea') {
      return (
        <textarea
          key={index}
          placeholder={field.placeholder}
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          className={`${inputClass} h-24 resize-none`}
          autoFocus={field.autoFocus}
        />
      );
    }
    return (
      <input
        key={index}
        type={field.type}
        placeholder={field.placeholder}
        value={field.value}
        onChange={(e) => field.onChange(e.target.value)}
        required={field.required}
        min={field.min}
        max={field.max}
        autoFocus={field.autoFocus}
        className={inputClass}
      />
    );
  };

  const currentIndex = sections.findIndex(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg shadow-xl overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-red-900/30">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
            Complete Your Profile
          </h2>
          <p className="text-red-200/70 text-sm mt-1">Fill in your details to get started</p>
          <p className="text-red-300/50 text-xs mt-2">* Full Name is required. All other fields are optional.</p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto bg-black/30 border-b border-red-900/30 scrollbar-hide">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id as any)}
              className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-red-900/30 text-red-200 border-b-2 border-red-500'
                  : 'text-red-300/60 hover:text-red-200 hover:bg-red-900/10'
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-900/50 border border-red-700/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[500px] overflow-y-auto">
            {/* Basic Info Section */}
            {activeSection === 'basic' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {basicFields.map(renderInput)}
              </div>
            )}

            {/* Contact Section */}
            {activeSection === 'contact' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {contactFields.map(renderInput)}
              </div>
            )}

            {/* Academic Section */}
            {activeSection === 'academic' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {academicFields.map(renderInput)}
              </div>
            )}

            {/* Platforms Section */}
            {activeSection === 'platforms' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-3 bg-red-900/20 border border-red-700/30 rounded-lg mb-4">
                  <p className="text-red-200/80 text-xs sm:text-sm">
                    ℹ️ Enter only your <strong>username</strong>, not the full URL. Example: "johndoe" not "https://github.com/johndoe"
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {platformFields.map((field, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={field.placeholder}
                      value={formData.links[field.platform as keyof typeof formData.links]}
                      onChange={(e) => handleLinksChange(field.platform as keyof typeof formData.links, e.target.value)}
                      className={inputClass}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {activeSection === 'skills' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg mb-4">
                  <p className="text-blue-200/80 text-xs sm:text-sm">
                    ℹ️ Skills are <strong>optional</strong>. Add the technologies and tools you're proficient in.
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a skill (press Enter) - optional"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyPress}
                    className={`flex-1 ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-3 bg-red-700 hover:bg-red-600 rounded-lg text-white font-medium transition-colors text-sm"
                  >
                    Add
                  </button>
                </div>

                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-red-900/50 border border-red-700/50 rounded-full text-red-200 text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-red-400 hover:text-red-200 text-lg leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Experience Section */}
            {activeSection === 'experience' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg mb-4">
                  <p className="text-blue-200/80 text-xs sm:text-sm">
                    ℹ️ Experience details are <strong>optional</strong>. You can skip this section if you prefer.
                  </p>
                </div>
                {experienceFields.map(renderInput)}
              </div>
            )}
          </div>

          {/* Footer with Navigation */}
          <div className="p-6 border-t border-red-900/30 bg-black/30 flex justify-between items-center">
            <button
              type="button"
              onClick={() => currentIndex > 0 && setActiveSection(sections[currentIndex - 1].id as any)}
              disabled={activeSection === 'basic'}
              className="px-4 py-2 text-red-300 hover:text-red-200 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              ← Previous
            </button>

            <div className="text-sm text-red-300/60">
              {currentIndex + 1} of {sections.length}
            </div>

            {activeSection === 'experience' ? (
              <button
                type="submit"
                disabled={loading || !formData.fullName.trim()}
                className="px-6 py-2 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 disabled:from-gray-700 disabled:to-gray-600 rounded-lg text-white font-medium transition-all duration-200 text-sm disabled:cursor-not-allowed"
                title={!formData.fullName.trim() ? 'Full Name is required' : ''}
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (canProceedToNext() && currentIndex < sections.length - 1) {
                    setActiveSection(sections[currentIndex + 1].id as any);
                  }
                }}
                className="px-4 py-2 text-red-300 hover:text-red-200 transition-colors text-sm font-medium"
              >
                Next →
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserInfoForm;