import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Github, Code, Star, Zap, Brain, AlertCircle, Loader2 } from 'lucide-react';

interface FormData {
  fullName: string;
  bio: string;
  location: string;
  links: {
    github: string;
    leetcode: string;
    codechef: string;
    codeforces: string;
    gfg: string;
  };
  skills: string[];
  experience: {
    years: number;
    currentRole: string;
    company: string;
  };
}

interface ValidationErrors {
  [key: string]: string;
}

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [Galobal_Error,SetGlobal_Error]=useState<string | null>("HELLO WORLD")
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    bio: '',
    location: '',
    links: {
      github: '',
      leetcode: '',
      codechef: '',
      codeforces: '',
      gfg: ''
    },
    skills: [],
    experience: {
      years: 0,
      currentRole: '',
      company: ''
    }
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const { state } = location;
        
        console.log('🔄 Auth Check:', { 
          hasToken: !!token,
          fromOTP: state?.fromOTP
        });
        
        if (!token) {
          console.log('⚠️ No token found - redirecting to signup');
          throw new Error('No token found');
        }
        
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/signup', { replace: true });
      }
    };

    checkAuth();
  }, [navigate, location]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.length < 50) {
      newErrors.bio = 'Bio should be at least 50 characters';
    }

    Object.entries(formData.links).forEach(([key, value]) => {
      if (value && !value.trim()) {
        newErrors[key] = 'URL is required';
      }
      SetGlobal_Error(`All link must be filled with valid URL`);
    });
    

    // Only allow URLs starting with "https://", no "www", no parentheses
    const urlPattern = /^https:\/\/[^\s()]+$/;
    Object.entries(formData.links).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key] = 'URL is required';
      } else if (!urlPattern.test(value)) {
        newErrors[key] = 'Please enter a valid URL starting with https:// and without www or parentheses';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Remove check for value of form it not required every time user enter https://
   const handleSubmit = async (e: React.FormEvent) => {
    console.log("🚀 Form submission initiated");
    
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Submitting profile with token:', token);

      if (!token) {
        throw new Error('No authentication token found');
      }
       
      const response = await fetch('http://localhost:5000/api/userinfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          console.log('⚠️ Navigation to signup reason: Unauthorized (401) during profile submission', {
            responseStatus: response.status,
            errorData
          });
          localStorage.removeItem('token');
          navigate('/auth/signup', { replace: true });
          return;
        }
        throw new Error(errorData.message || 'Failed to complete profile');
      }

      const data = await response.json();
      console.log('✅ Profile completion successful:', data);
      console.log(data);
      
      // navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('❌ Profile completion error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Check if the input name is one of the links
    if (['github', 'leetcode', 'codechef', 'codeforces', 'gfg'].includes(name)) {
      setFormData(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [name]: value
      }
      }));
    } else {
      setFormData(prev => ({
      ...prev,
      [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 p-8 rounded-xl">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent text-center">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-gray-400 text-center">Let's set up your coding profile</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 bg-gray-800/50 border ${
                    errors.name ? 'border-red-500' : 'border-red-900/30'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className={`block w-full px-3 py-2 bg-gray-800/50 border ${
                  errors.bio ? 'border-red-500' : 'border-red-900/30'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent`}
                placeholder="Tell us about yourself..."
              />
              {errors.bio && <p className="mt-1 text-sm text-red-500">{errors.bio}</p>}
            </div>
          </div>

          {/* Coding Profiles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-300">Coding Profiles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'github', icon: Github, label: 'GitHub', placeholder: 'https://github.com/username' },
                { name: 'leetcode', icon: Code, label: 'LeetCode', placeholder: 'https://leetcode.com/username' },
                { name: 'codechef', icon: Star, label: 'CodeChef', placeholder: 'https://codechef.com/users/username' },
                { name: 'codeforces', icon: Zap, label: 'Codeforces', placeholder: 'https://codeforces.com/profile/username' },
                { name: 'gfg', icon: Brain, label: 'GeeksforGeeks', placeholder: 'https://auth.geeksforgeeks.org/user/username' }
              ].map(platform => (
                <div key={platform.name}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{platform.label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <platform.icon className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="url"
                      name={platform.name}
                      value={formData.links[platform.name as keyof FormData['links']]}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 bg-gray-800/50 border border-red-900/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder={platform.placeholder}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
              <div className='w-full flex justify-center items-center'>
                {
                  Galobal_Error && typeof Galobal_Error === "string" && (
                    <p className="mt-1 text-sm text-red-500">
                      <b>Alert : </b>
                      {Galobal_Error}
                      </p>
                  )
                }
              </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 py-3 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-red-900/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                <span>Completing Profile...</span>
              </>
            ) : (
              'Complete Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletion;
