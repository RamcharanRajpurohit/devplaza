import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface UserInfoFormData {
  fullName: string;
  bio: string;
  location: string;
  links: {
    github: string;
    linkedin: string;
    leetcode: string;
    codechef: string;
  };
  skills: string[];
  experience: {
    years: number;
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
      linkedin: '',
      leetcode: '',
      codechef: '',
    },
    skills: [],
    experience: {
      years: 0,
      currentRole: '',
      company: '',
    }
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/user/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error saving user info:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
          Complete Your Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white"
              required
            />

            <textarea
              placeholder="Bio"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white h-24"
            />

            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white"
            />
          </div>

          {/* Platform Links Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Platform Links</h3>
            
            {Object.keys(formData.links).map((platform) => (
              <input
                key={platform}
                type="url"
                placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} Profile URL`}
                value={formData.links[platform as keyof typeof formData.links]}
                onChange={(e) => setFormData({
                  ...formData,
                  links: {
                    ...formData.links,
                    [platform]: e.target.value
                  }
                })}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white"
              />
            ))}
          </div>

          {/* Experience Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Experience</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Years of Experience"
                value={formData.experience.years}
                onChange={(e) => setFormData({
                  ...formData,
                  experience: {
                    ...formData.experience,
                    years: parseInt(e.target.value)
                  }
                })}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white"
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
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white"
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
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 py-3 rounded-lg text-white font-medium"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserInfoForm;
