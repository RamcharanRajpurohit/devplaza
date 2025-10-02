import {
    Building,
    Mail,
    ChevronRight,
    RefreshCw,
    Settings,
    LogOut,
    Edit3,
    Share2,
    X,
    Phone,
    Globe,
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

    // Helper function to get platform icon SVG and configuration
    const getPlatformConfig = (platformKey: string) => {
        const configs: { [key: string]: { svg: string; label: string; urlPrefix: string } } = {
            github: {
                svg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
                label: "GitHub",
                urlPrefix: "https://github.com/"
            },
            linkedin: {
                svg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
                label: "LinkedIn",
                urlPrefix: "https://linkedin.com/in/"
            },
            twitter: {
                svg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
                label: "Twitter",
                urlPrefix: "https://x.com/"
            },
            instagram: {
                svg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>`,
                label: "Instagram",
                urlPrefix: "https://instagram.com/"
            },
            codeforces: {
                svg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5v15c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5v-15c0-.828.672-1.5 1.5-1.5h3zm9 7.5c.828 0 1.5.672 1.5 1.5v7.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V12c0-.828.672-1.5 1.5-1.5h3z"/></svg>`,
                label: "Codeforces",
                urlPrefix: "https://codeforces.com/profile/"
            },
            codechef: {
                svg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M11.257.004c-.37.01-.735.04-1.1.095C5.411.763 1.513 4.955 1.06 10.714c-.292 3.728 1.172 7.255 4.02 9.67 2.846 2.414 6.673 3.248 10.496 2.29 3.822-.958 6.817-3.678 8.188-7.45 1.372-3.773.717-7.868-1.795-11.227C19.455 1.04 15.495-.4 11.257.004zm4.26 3.308c1.932 0 3.498 1.564 3.498 3.495 0 1.93-1.566 3.495-3.498 3.495-1.931 0-3.497-1.565-3.497-3.495 0-1.93 1.566-3.495 3.497-3.495zM4.82 6.403c.884-.037 1.74.367 2.308 1.088.996 1.267.748 3.091-.55 4.062-1.297.97-3.125.707-4.122-.56-.998-1.266-.749-3.09.55-4.06.516-.386 1.125-.565 1.813-.53zm6.067 5.746c3.14 0 5.686 2.544 5.686 5.682 0 3.137-2.546 5.681-5.686 5.681-3.14 0-5.685-2.544-5.685-5.681 0-3.138 2.546-5.682 5.685-5.682z"/></svg>`,
                label: "CodeChef",
                urlPrefix: "https://www.codechef.com/users/"
            },
            leetcode: {
                svg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/></svg>`,
                label: "LeetCode",
                urlPrefix: "https://leetcode.com/"
            },
            geeksforgeeks: {
                svg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M21.45 14.315c-.143.28-.334.532-.565.745a3.691 3.691 0 0 1-1.104.695 4.51 4.51 0 0 1-3.116-.016 3.79 3.79 0 0 1-2.135-2.078 3.571 3.571 0 0 1-.13-.353h7.418a4.26 4.26 0 0 1-.368 1.008zm-11.99-.654a3.793 3.793 0 0 1-2.134 2.078 4.51 4.51 0 0 1-3.117.016 3.7 3.7 0 0 1-1.104-.695 2.652 2.652 0 0 1-.564-.745 4.221 4.221 0 0 1-.368-1.006H9.59c-.038.12-.08.238-.13.352zm14.47-1.615H14.37a3.448 3.448 0 0 0-.16-.493 3.915 3.915 0 0 0-.956-1.342 4.034 4.034 0 0 0-1.29-.86 3.99 3.99 0 0 0-1.663-.315 3.99 3.99 0 0 0-1.663.315 4.034 4.034 0 0 0-1.29.86 3.915 3.915 0 0 0-.956 1.342 3.45 3.45 0 0 0-.16.493H1.68a5.76 5.76 0 0 1 .184-.694 4.93 4.93 0 0 1 .439-.87 5.604 5.604 0 0 1 .744-.916 5.886 5.886 0 0 1 1.113-.862 6.965 6.965 0 0 1 1.553-.64 7.759 7.759 0 0 1 2.099-.266 7.759 7.759 0 0 1 2.099.266 6.965 6.965 0 0 1 1.553.64 5.886 5.886 0 0 1 1.113.862 5.604 5.604 0 0 1 .744.916 4.93 4.93 0 0 1 .439.87 5.76 5.76 0 0 1 .184.694h6.77a3.666 3.666 0 0 0-.16-.477 3.915 3.915 0 0 0-.956-1.342 4.034 4.034 0 0 0-1.29-.86 3.99 3.99 0 0 0-1.663-.315 3.99 3.99 0 0 0-1.663.315 4.034 4.034 0 0 0-1.29.86 3.915 3.915 0 0 0-.956 1.342 3.666 3.666 0 0 0-.16.477h-6.77a7.759 7.759 0 0 1 2.099-.266 7.759 7.759 0 0 1 2.099.266 6.965 6.965 0 0 1 1.553.64 5.886 5.886 0 0 1 1.113.862 5.604 5.604 0 0 1 .744.916 4.93 4.93 0 0 1 .439.87c.115.225.16.45.184.694z"/></svg>`,
                label: "GeeksforGeeks",
                urlPrefix: "https://auth.geeksforgeeks.org/user/"
            },
            hackerrank: {
                svg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M12 0c1.285 0 9.75 4.886 10.392 6 .645 1.115.645 10.885 0 12S13.287 24 12 24s-9.75-4.885-10.395-6c-.641-1.115-.641-10.885 0-12C2.25 4.886 10.715 0 12 0zm2.295 6.799c-.141 0-.258.115-.258.258v3.875H9.963V6.908h.701c.141 0 .254-.115.254-.258 0-.094-.049-.176-.123-.221L9.223 4.92c-.049-.063-.141-.109-.226-.109-.084 0-.16.045-.207.107L7.11 6.43c-.072.045-.12.126-.12.218 0 .143.113.258.255.258h.704l.008 10.035c0 .145.111.258.254.258h1.492c.142 0 .256-.115.256-.258v-3.637h4.072v3.637c0 .142.111.258.255.258h.93c.142 0 .254-.116.254-.258V7.057c0-.143-.112-.258-.255-.258z"/></svg>`,
                label: "HackerRank",
                urlPrefix: "https://www.hackerrank.com/profile/"
            },
            portfolio: {
                svg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm.5 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM8 10v2h2v6H8v2h8v-2h-2v-8z"/></svg>`,
                label: "Portfolio",
                urlPrefix: ""
            }
        };

        return configs[platformKey.toLowerCase()] || {
            svg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`,
            label: platformKey,
            urlPrefix: ""
        };
    };

    // Function to build proper URL for each platform
    const buildPlatformUrl = (platformKey: string, platform: any) => {
        const config = getPlatformConfig(platformKey);
        
        // Special handling for portfolio
        if (platformKey === 'portfolio') {
            const url = platform.url || platform.handle;
            return url?.startsWith('http') ? url : `https://${url}`;
        }
        
        // For other platforms, use url if it's a full URL, otherwise construct from handle
        return platform.url?.startsWith('http') 
            ? platform.url 
            : `${config.urlPrefix}${platform.handle || platform.url}`;
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
                <div className="flex-1 overflow-y-auto no-scrollbar">
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

                            <div className="flex items-center space-x-3">
                                <RefreshCw className="w-4 h-4 text-red-400 flex-shrink-0" />
                                <span className="text-red-200">Updated {new Date(profileData.profile.lastRefresh).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Social Links / Connected Platforms */}
                    {profileData.platforms && Object.keys(profileData.platforms).length > 0 && (
                        <div className="p-6 border-b border-red-800/30">
                            <h4 className="text-sm font-semibold text-red-300 mb-4">Connected Platforms</h4>
                            <div className="grid grid-cols-4 gap-2">
                                {Object.entries(profileData.platforms).map(([key, platform]) => {
                                    // Skip if no url or handle is available
                                    if (!platform.url && !platform.handle) return null;
                                    
                                    const config = getPlatformConfig(key);
                                    const url = buildPlatformUrl(key, platform);

                                    return (
                                        <a
                                            key={key}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center p-3 bg-red-900/20 hover:bg-red-800/30 rounded-lg transition-all duration-300 group hover:scale-110"
                                            title={config.label}
                                        >
                                            <div 
                                                className="text-red-200 group-hover:text-red-100 transition-colors"
                                                dangerouslySetInnerHTML={{ __html: config.svg }}
                                            />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}
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