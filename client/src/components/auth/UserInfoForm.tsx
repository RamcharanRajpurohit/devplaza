import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface UserInfoFormData {
  fullName: string;
  bio: string;
  location: string;
  phone: string;
  email: string;
  portfolio: string;
  institute: string;
  graduationYear: string;
  links: {
    github: string;
    linkedin: string;
    twitter: string;
    instagram: string;
    gfg: string;
    leetcode: string;
    codechef: string;
    code360: string;
    codeforces: string;
    hackerrank: string;
  };
  skills: string[];
  experience: {
    years: string;
    currentRole: string;
    company: string;
  };
}

const UserInfoForm: React.FC = () => {
  const [formData, setFormData] = useState<UserInfoFormData>({
    fullName: '',
    bio: '',
    location: '',
    phone: '',
    email: '',
    portfolio: '',
    institute: '',
    graduationYear: '',
    links: {
      github: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      gfg: '',
      leetcode: '',
      codechef: '',
      code360: '',
      codeforces: '',
      hackerrank: '',
    },
    skills: [],
    experience: {
      years: '',
      currentRole: '',
      company: '',
    }
  });

  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<'basic' | 'contact' | 'academic' | 'platforms' | 'skills' | 'experience'>('basic');
  const path =import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { isProfileCompleted, isAuthenticated,setIsProfileComplet } = useAuth();
  useEffect(() => {
    if (isAuthenticated && isProfileCompleted) {
      navigate('/');
    }
    else if(!isAuthenticated){
      navigate('/');
    }
  }, [isAuthenticated, isProfileCompleted])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      experience: {
        ...formData.experience,
        years: formData.experience.years ? parseInt(formData.experience.years) : 0
      },
      graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined
    };

    try {
      const response = await fetch(path+'/api/user/info', {
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
    setFormData({
      ...formData,
      links: {
        ...formData.links,
        [platform]: value
      }
    });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'contact', label: 'Contact', icon: '📧' },
    { id: 'academic', label: 'Academic', icon: '🎓' },
    { id: 'platforms', label: 'Platforms', icon: '💻' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'experience', label: 'Experience', icon: '💼' }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg shadow-xl overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-red-900/30">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
            Complete Your Profile
          </h2>
          <p className="text-red-200/70 text-sm mt-1">Fill in your details to get started</p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto bg-black/30 border-b border-red-900/30 scrollbar-hide">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id as any)}
              className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium transition-all ${activeSection === section.id
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
          {/* Form Content */}
          <div className="p-6 max-h-[500px] overflow-y-auto">

            {/* Basic Info Section */}
            {activeSection === 'basic' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                  required
                />

                <textarea
                  placeholder="Bio / About yourself"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 h-24 focus:outline-none focus:border-red-500 resize-none text-sm"
                />

                <input
                  type="text"
                  placeholder="Location (City, Country)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                />
              </div>
            )}

            {/* Contact Section */}
            {activeSection === 'contact' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                />

                <input
                  type="url"
                  placeholder="Portfolio Website URL"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                />
              </div>
            )}

            {/* Academic Section */}
            {activeSection === 'academic' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <input
                  type="text"
                  placeholder="Institute / University Name"
                  value={formData.institute}
                  onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                />

                <input
                  type="number"
                  placeholder="Graduation Year (e.g., 2025)"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                  min="1950"
                  max="2050"
                  className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                />
              </div>
            )}

            {/* Platforms Section */}
            {activeSection === 'platforms' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="GitHub Username"
                    value={formData.links.github}
                    onChange={(e) => handleLinksChange('github', e.target.value)}
                    className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="LinkedIn Username"
                    value={formData.links.linkedin}
                    onChange={(e) => handleLinksChange('linkedin', e.target.value)}
                    className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="Twitter/X Username"
                    value={formData.links.twitter}
                    onChange={(e) => handleLinksChange('twitter', e.target.value)}
                    className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="Instagram Username"
                    value={formData.links.instagram}
                    onChange={(e) => handleLinksChange('instagram', e.target.value)}
                    className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="LeetCode Username"
                    value={formData.links.leetcode}
                    onChange={(e) => handleLinksChange('leetcode', e.target.value)}
                    className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="CodeForces Username"
                    value={formData.links.codeforces}
                    onChange={(e) => handleLinksChange('codeforces', e.target.value)}
                    className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="CodeChef Username"
                    value={formData.links.codechef}
                    onChange={(e) => handleLinksChange('codechef', e.target.value)}
                    className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="GeeksforGeeks Username"
                    value={formData.links.gfg}
                    onChange={(e) => handleLinksChange('gfg', e.target.value)}
                    className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="HackerRank Username"
                    value={formData.links.hackerrank}
                    onChange={(e) => handleLinksChange('hackerrank', e.target.value)}
                    className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="Code360 Username"
                    value={formData.links.code360}
                    onChange={(e) => handleLinksChange('code360', e.target.value)}
                    className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Skills Section */}
            {activeSection === 'skills' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a skill (press Enter)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyPress}
                    className="flex-1 p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
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
                <input
                  type="number"
                  placeholder="Years of Experience"
                  value={formData.experience.years}
                  onChange={(e) => setFormData({
                    ...formData,
                    experience: {
                      ...formData.experience,
                      years: e.target.value
                    }
                  })}
                  min="0"
                  className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                />

                <input
                  type="text"
                  placeholder="Current Role / Position"
                  value={formData.experience.currentRole}
                  onChange={(e) => setFormData({
                    ...formData,
                    experience: {
                      ...formData.experience,
                      currentRole: e.target.value
                    }
                  })}
                  className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                />

                <input
                  type="text"
                  placeholder="Company Name"
                  value={formData.experience.company}
                  onChange={(e) => setFormData({
                    ...formData,
                    experience: {
                      ...formData.experience,
                      company: e.target.value
                    }
                  })}
                  className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm"
                />
              </div>
            )}
          </div>

          {/* Footer with Navigation */}
          <div className="p-6 border-t border-red-900/30 bg-black/30 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                const currentIndex = sections.findIndex(s => s.id === activeSection);
                if (currentIndex > 0) {
                  setActiveSection(sections[currentIndex - 1].id as any);
                }
              }}
              disabled={activeSection === 'basic'}
              className="px-4 py-2 text-red-300 hover:text-red-200 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              ← Previous
            </button>

            <div className="text-sm text-red-300/60">
              {sections.findIndex(s => s.id === activeSection) + 1} of {sections.length}
            </div>

            {activeSection === 'experience' ? (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 disabled:from-gray-700 disabled:to-gray-600 rounded-lg text-white font-medium transition-all duration-200 text-sm"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  if (currentIndex < sections.length - 1) {
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