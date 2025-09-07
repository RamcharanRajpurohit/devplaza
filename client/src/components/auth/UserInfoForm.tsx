import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface UserInfoFormData {
  fullName: string;
  bio: string;
  location: string;
  links: {
    github: string;
    gfg: string;
    leetcode: string;
    codechef: string;
    code360: string;
    codeforces: string;
  };
  skills: string[];
  experience: {
    years: string;   // keep as string for inputs
    currentRole: string;
    company: string;
  };
}

const UserInfoForm: React.FC = () => {
  const [formData, setFormData] = useState<UserInfoFormData>({
    fullName: '',
    bio: '',
    location: '',
    links: {
      github: '',
      gfg: '',
      leetcode: '',
      codechef: '',
      code360: '',
      codeforces: '',
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
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Convert years (string) into number when sending
    const payload = {
      ...formData,
      experience: {
        ...formData.experience,
        years: formData.experience.years ? parseInt(formData.experience.years) : 0
      }
    };

    try {
      const response = await fetch('http://localhost:5000/api/user/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        navigate('/dashboard');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
          Complete Your Profile
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              required
            />

            <textarea
              placeholder="Bio"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-400 h-24 focus:outline-none focus:border-red-500 resize-none"
            />

            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Platform Links Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Platform Links</h3>
            
            <input
              type="text"
              placeholder="GitHub Profile Username"
              value={formData.links.github}
              onChange={(e) => handleLinksChange('github', e.target.value)}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
            
            <input
              type="text"
              placeholder="CodeForces Profile Username"
              value={formData.links.codeforces}
              onChange={(e) => handleLinksChange('codeforces', e.target.value)}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
            
            <input
              type="text"
              placeholder="LeetCode Profile Username"
              value={formData.links.leetcode}
              onChange={(e) => handleLinksChange('leetcode', e.target.value)}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
            
            <input
              type="text"
              placeholder="CodeChef Profile Username"
              value={formData.links.codechef}
              onChange={(e) => handleLinksChange('codechef', e.target.value)}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
            
            <input
              type="text"
              placeholder="GFG Profile Username"
              value={formData.links.gfg}
              onChange={(e) => handleLinksChange('gfg', e.target.value)}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
            
            <input
              type="text"
              placeholder="Code360 Profile Username"
              value={formData.links.code360}
              onChange={(e) => handleLinksChange('code360', e.target.value)}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Skills</h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a skill (press Enter or click Add)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyPress}
                className="flex-1 p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-3 bg-red-700 hover:bg-red-600 rounded-lg text-white font-medium transition-colors"
              >
                Add
              </button>
            </div>

            {/* Skills Display */}
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
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

          {/* Experience Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Experience</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              
              <input
                type="text"
                placeholder="Current Role"
                value={formData.experience.currentRole}
                onChange={(e) => setFormData({
                  ...formData,
                  experience: {
                    ...formData.experience,
                    currentRole: e.target.value
                  }
                })}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            </div>

            <input
              type="text"
              placeholder="Company"
              value={formData.experience.company}
              onChange={(e) => setFormData({
                ...formData,
                experience: {
                  ...formData.experience,
                  company: e.target.value
                }
              })}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 disabled:from-gray-700 disabled:to-gray-600 py-3 rounded-lg text-white font-medium transition-all duration-200"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserInfoForm;