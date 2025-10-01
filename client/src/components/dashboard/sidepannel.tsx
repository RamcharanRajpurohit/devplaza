import {
  
    Building,
    Mail,
    Link,
    ChevronRight,
    RefreshCw,
    Settings,
    LogOut,
    Edit3,
    Share2,
    X,
    Instagram,
    Github,
    Linkedin,
    Twitter,
    Phone,
    Globe
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type EnhancedProfileData from '../../types/enhanceData';

const Sidebar: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: any;
    profileData: EnhancedProfileData;
    onLogout: () => void;
    onShareProfile: () => void;
    onRefreshProfile: () => void;
    refreshing: boolean;
}> = ({ isOpen, onClose, user, profileData, onLogout, onShareProfile, onRefreshProfile, refreshing }) => {
    const navigate = useNavigate();
    const [showSettings, setShowSettings] = useState(false);

    // Helper function to get platform icon
    const getPlatformIcon = (platformName: string) => {
        const name = platformName.toLowerCase();
        if (name.includes('github')) return <Github className="w-4 h-4" />;
        if (name.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
        if (name.includes('twitter') || name.includes('x')) return <Twitter className="w-4 h-4" />;
        if (name.includes('instagram')) return <Instagram className="w-4 h-4" />;
        if (name.includes('mail') || name.includes('email')) return <Mail className="w-4 h-4" />;
        return <Link className="w-4 h-4" />;
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed left-0 top-0 h-full w-80 bg-gradient-to-br from-black via-gray-900 to-red-950 border-r border-red-800/30 z-50 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0`}>

                {/* Header */}
                <div className="p-6 border-b border-red-800/30 md:hidden ">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
                            Profile
                        </h2>
                        <button
                            onClick={onClose}
                            className="md:hidden p-2 hover:bg-red-800/30 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-red-100" />
                        </button>
                    </div>
                </div>

                {/* Main Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {/* Profile Info */}
                    <div className="p-6 border-b border-red-800/30">
                        <div className="flex items-center space-x-4 mb-4">
                            <img
                                src={profileData.profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.profile.name}`}
                                alt={profileData.profile.name}
                                className="w-16 h-16 rounded-full border-2 border-red-400"
                            />
                            <div>
                                <h3 className="font-bold text-red-100 text-xl">{profileData.profile.name}</h3>
                                <p className="text-sm text-red-300">@{profileData.profile.username}</p>
                            </div>
                        </div>

                        {/* Bio */}
                        {profileData.profile.bio && (
                            <p className="text-sm text-red-200 mb-4 leading-relaxed">{profileData.profile.bio}</p>
                        )}

                        {/* Profile Details */}
                        <div className="space-y-3 text-sm">
                            {profileData.profile.institute && (
                                <div className="flex items-center space-x-3">
                                    <Building className="w-4 h-4 text-red-400 flex-shrink-0" />
                                    <span className="text-red-200">{profileData.profile.institute}</span>
                                </div>
                            )}

                            {/* Contact Information */}
                            {profileData.profile.email && (
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-4 h-4 text-red-400 flex-shrink-0" />
                                    <a href={`mailto:${profileData.profile.email}`} className="text-red-200 hover:text-red-100 transition-colors">
                                        {profileData.profile.email}
                                    </a>
                                </div>
                            )}

                            {profileData.profile.phone && (
                                <div className="flex items-center space-x-3">
                                    <Phone className="w-4 h-4 text-red-400 flex-shrink-0" />
                                    <a href={`tel:${profileData.profile.phone}`} className="text-red-200 hover:text-red-100 transition-colors">
                                        {profileData.profile.phone}
                                    </a>
                                </div>
                            )}

                            {profileData.profile.portfolio && (
                                <div className="flex items-center space-x-3">
                                    <Globe className="w-4 h-4 text-red-400 flex-shrink-0" />
                                    <a
                                        href={profileData.profile.portfolio}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-red-200 hover:text-red-100 transition-colors truncate"
                                    >
                                        {profileData.profile.portfolio.replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                            )}

                            {/* <div className="flex items-center space-x-3">
                <Eye className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-red-200">{profileData.profile.profileViews} profile views</span>
              </div> */}

                            <div className="flex items-center space-x-3">
                                <RefreshCw className="w-4 h-4 text-red-400 flex-shrink-0" />
                                <span className="text-red-200">Updated {new Date(profileData.profile.lastRefresh).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    {profileData.platforms &&
                        Object.values(profileData.platforms).some(platform => platform?.url) && (
                            <div className="p-6 border-b border-red-800/30">
                                <h4 className="text-sm font-semibold text-red-300 mb-4">Social Links</h4>
                                <div className="grid grid-cols-4 gap-3">
                                    {Object.entries(profileData.platforms).map(([key, platform]) => (
                                        platform?.url && (
                                            <a
                                                key={key}
                                                href={platform.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center p-3 bg-red-900/20 hover:bg-red-800/30 rounded-lg transition-all duration-300 group"
                                                title={platform.name}
                                            >
                                                <div className="text-red-300 group-hover:text-red-200 transition-colors">
                                                    {getPlatformIcon(platform.name)}
                                                </div>
                                            </a>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}


                    {/* Platform Stats */}

                </div>

                {/* Settings Section - Fixed at bottom, only show when user has access */}
                {user && (
                    <div className="border-t border-red-800/30 bg-gradient-to-br from-gray-900 via-red-950 to-black">
                        <div className="p-4">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="w-full flex items-center justify-between p-3 bg-red-900/20 hover:bg-red-800/30 rounded-lg transition-all duration-300"
                            >
                                <div className="flex items-center space-x-3">
                                    <Settings className="w-5 h-5 text-red-300" />
                                    <span className="text-red-200 font-medium">Settings</span>
                                </div>
                                <ChevronRight className={`w-4 h-4 text-red-300 transform transition-transform duration-200 ${showSettings ? 'rotate-90' : ''
                                    }`} />
                            </button>

                            {/* Collapsible Settings Panel */}
                            {showSettings && (
                                <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={() => {
                                            navigate('/complete-profile');
                                            setShowSettings(false);
                                        }}
                                        className="w-full flex items-center space-x-3 p-3 text-red-100 hover:bg-red-800/20 rounded-lg transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4 text-green-400" />
                                        <span>Edit Profile</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            onShareProfile();
                                            setShowSettings(false);
                                        }}
                                        className="w-full flex items-center space-x-3 p-3 text-red-100 hover:bg-red-800/20 rounded-lg transition-colors"
                                    >
                                        <Share2 className="w-4 h-4 text-blue-400" />
                                        <span>Share Profile</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            onRefreshProfile();
                                            setShowSettings(false);
                                        }}
                                        disabled={refreshing}
                                        className="w-full flex items-center space-x-3 p-3 text-red-100 hover:bg-red-800/20 disabled:opacity-50 rounded-lg transition-colors"
                                    >
                                        <RefreshCw className={`w-4 h-4 text-orange-400 ${refreshing ? 'animate-spin' : ''}`} />
                                        <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            navigate('/settings');
                                            setShowSettings(false);
                                        }}
                                        className="w-full flex items-center space-x-3 p-3 text-red-100 hover:bg-red-800/20 rounded-lg transition-colors"
                                    >
                                        <Settings className="w-4 h-4 text-gray-400" />
                                        <span>Account Settings</span>
                                    </button>

                                    <hr className="my-2 border-red-800/30" />

                                    <button
                                        onClick={() => {
                                            onLogout();
                                            setShowSettings(false);
                                        }}
                                        className="w-full flex items-center space-x-3 p-3 text-red-100 hover:bg-red-800/20 rounded-lg transition-colors"
                                    >
                                        <LogOut className="w-4 h-4 text-red-400" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Sidebar;