import React, { useState, useEffect, forwardRef, Suspense } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Cookies from 'js-cookie';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { EyeIcon, EyeOffIcon, CloverIcon } from 'lucide-react';

// ============================
// 1. TYPES AND INTERFACES
// ============================

interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface ValidationSchema {
  email: {
    required: boolean;
    type: string;
    message: string;
  };
  password: {
    required: boolean;
    minLength: number;
    message: string;
  };
}

interface AuthResponse {
  ok: boolean;
  data?: any;
  token?: string;
  user?: User;
  newUser?: boolean;
}

interface InputBoxProps {
  readOnly?: boolean;
  required?: boolean;
  value: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type: string;
  label?: React.ReactNode;
  handleBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  disabled?: boolean;
  placeholder?: string;
  customClass?: string;
  inputBoxPadding?: string;
}

interface FeatureCardProps {
  image: string;
  heading: string;
  subHeading: string;
}

interface AuthLayoutProps {
  initiator?: string;
  onClose?: () => void;
}

// ============================
// 2. CONSTANTS AND CONFIG
// ============================

const API_BASE_URL =  'http://localhost:5000';

const CONFIG = {
  showHiringBanner: false,
  hiringBannerTTL: 43200, // 12 hours
  hiringBannerToken: 'codolio-hiring',
  showBanner: false,
  bannerNotificationTTL: 2592000, // 30 days
  bannerNotificationToken: 'codolio-announcement-extension',
  bannerMessage: `<p className="inline-block text-sm text-white md:text-base me-2">
    🎉 Announcement: Now track your GFG Contests & AtCoder progress effortlessly in Profile Tracker ! 
  </p>`,
  showNotificationPopup: true,
  notificationPopupTTL: 31536000, // 1 year
  notificationPopupToken: 'codolio-leaderboard',
  hiringFormLink: 'https://forms.gle/a6PSy8SrTBYp25Vs7',
  hiringPostLink: 'https://www.linkedin.com/company/codolio/',
  refreshInterval: 900000, // 15 minutes
  cookieToken: 'codolio',
  domain: 'https://codolio.com',
  defaultOgImage: 'https://d3hr337ydpgtsa.cloudfront.net/assets/fallback.jpg',
  ogBanner: 'https://d3hr337ydpgtsa.cloudfront.net/assets/Banner.png',
  disableChecklistToken: 'disableChecklist',
  disableChecklistTTL: 2592000, // 30 days
  checkListToken: 'openChecklist',
  checkListTTL: 2592000, // 30 days
  feedbackPromptToken: 'codolioFeedbackPrompt',
  feedbackPromptTTL: 864000, // 10 days
  questionTrackerBannerToken: 'codolioUpcomingSheetIntroductionBanner',
  questionTrackerBannerTokenTTL: 31536000 // 1 year
};

// ============================
// 3. VALIDATION SCHEMA
// ============================

const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please include a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, '8+ characters required')
    .required('Password is required')
});

// ============================
// 4. AUTHENTICATION API FUNCTIONS
// ============================

const AuthAPI = {
  // Send OTP for signup
  sendSignupOTP: async (email: string): Promise<AuthResponse> => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    };
    
    const response = await fetch(`${API_BASE_URL}/auth/signup/otp`, requestOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.status.error || data.status.message || 'Error signing up');
    }
    
    return { ok: response.ok, data };
  },

  // Login with email and password
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    };
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, requestOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.status.error || data.status.message || 'Error logging in');
    }
    
    return {
      token: response.headers.get('Authorization') || '',
      user: data.data,
      ok: response.ok
    };
  },

  // Social login (Google)
  socialLogin: async (authToken: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login/social`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authToken: authToken,
        provider: 'google'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.status.error || 'Error logging in');
    }
    
    return {
      token: response.headers.get('Authorization') || '',
      newUser: data.data.newUser,
      ok: response.ok
    };
  },

  // Send OTP for password reset
  sendPasswordResetOTP: async (email: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/otp?email=${email}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok || data.status.code !== 200) {
      throw new Error(data.status.message || data.status.error || 'Something went wrong');
    }
    
    return { ok: response.ok, data };
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<AuthResponse> => {
    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        newPassword
      })
    };
    
    const response = await fetch(`${API_BASE_URL}/user/password/reset`, requestOptions);
    const data = await response.json();
    
    if (!response.ok || data.status.code !== 200) {
      throw new Error(data.status.message || data.status.error || 'Something went wrong');
    }
    
    return { ok: response.ok, data };
  },

  // Validate OTP for password reset
  validatePasswordResetOTP: async (email: string, otp: string): Promise<AuthResponse> => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    };
    
    const response = await fetch(`${API_BASE_URL}/otp/validate`, requestOptions);
    const data = await response.json();
    
    if (!response.ok || data.status.code !== 200 || !data.data.resetToken) {
      throw new Error(data.status.message || data.status.error || 'Invalid OTP entered');
    }
    
    return { ok: response.ok, data };
  },

  // Validate OTP for signup
  validateSignupOTP: async (email: string, otp: string): Promise<AuthResponse> => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    };
    
    const response = await fetch(`${API_BASE_URL}/user/signup/otp`, requestOptions);
    const data = await response.json();
    
    if (!response.ok || data.status.code !== 200 || !response.headers.get('Authorization')) {
      throw new Error(data.status.message || data.status.error || 'Invalid OTP entered');
    }
    
    return {
      ok: response.ok,
      data,
      token: response.headers.get('Authorization') || ''
    };
  }
};

// ============================
// 5. COOKIE MANAGEMENT UTILITIES
// ============================

const CookieManager = {
  // Set authentication token
  setAuthToken: (token: string | null) => {
    if (token) {
      Cookies.set(CONFIG.cookieToken, token, {
        expires: 14,
        secure: true,
        sameSite: 'Strict'
      });
    } else {
      CookieManager.removeAuthToken();
    }
  },

  // Get authentication token
  getAuthToken: (): string | null => {
    return Cookies.get(CONFIG.cookieToken) || null;
  },

  // Remove authentication token
  removeAuthToken: () => {
    Cookies.remove(CONFIG.cookieToken);
  },

  // Logout user
  logout: () => {
    CookieManager.removeAuthToken();
    window.location.reload();
  }
};

// ============================
// 6. UTILITY FUNCTIONS
// ============================

const getURLSearchParam = (param: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

const decodeToken = (token: string): { User: User } => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error('Error decoding token:', error);
    return { User: {} as User };
  }
};

const handlePostLoginNavigation = (source: string, initiator: string, redirectPath: string) => {
  if (source === 'ext') {
    window.location.href = '/extension/success';
    return;
  }
  
  if (initiator === 'auth') {
    window.location.href = redirectPath;
  } else {
    window.location.reload();
  }
};

// ============================
// 7. CUSTOM HOOKS
// ============================

const useRedirectPath = (): string => {
  const [redirectPath, setRedirectPath] = useState('/');
  
  useEffect(() => {
    const redirect = getURLSearchParam('redirect');
    setRedirectPath(redirect || '/');
  }, []);
  
  return redirectPath;
};

// ============================
// 8. STORE MOCK (Replace with your state management)
// ============================

// Mock store functions - replace with your actual state management
const useUserStore = {
  setLoggedInUser: (user: User) => {
    // Implement your user state management
    console.log('Setting logged in user:', user);
  },
  setShowEditProfileModal: (show: boolean) => {
    // Implement your modal state management
    console.log('Setting edit profile modal:', show);
  }
};

const usePopupStore = {
  setOpenLoginPopup: (open: boolean) => {
    // Implement your popup state management
    console.log('Setting login popup:', open);
  },
  setOpenSignupPopup: (open: boolean) => {
    // Implement your popup state management
    console.log('Setting signup popup:', open);
  }
};

// ============================
// 9. REUSABLE INPUT COMPONENT
// ============================

const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(({
  readOnly = false,
  required = false,
  value,
  handleChange,
  error,
  type,
  label,
  handleBlur,
  name,
  disabled = false,
  placeholder,
  customClass = '',
  inputBoxPadding = 'py-2.5'
}, ref) => {
  const [inputType, setInputType] = useState(type);

  const togglePasswordVisibility = () => {
    setInputType(inputType === 'password' ? 'text' : 'password');
  };

  return (
    <div className="dark:text-darkText-400">
      {label && (
        <label 
          htmlFor={name || type}
          className="block mb-1 text-sm dark:text-darkText-300 font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={inputType}
          id={name || type}
          name={name || type}
          value={value}
          readOnly={readOnly}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={`block w-full px-4 ${inputBoxPadding} text-sm border border-gray-200 round-border dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-darkText-300 outline-none resize-none dark:text-darkText-300 ${disabled ? 'cursor-not-allowed' : ''} ${customClass}`}
          placeholder={placeholder}
          ref={ref}
        />
        
        {type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 text-gray-400 end-0 pe-3"
            onClick={togglePasswordVisibility}
          >
            {inputType === 'password' ? <EyeIcon size={22} /> : <EyeOffIcon size={22} />}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-xs text-red-500" id="email-error">
          {error}
        </p>
      )}
    </div>
  );
});

InputBox.displayName = 'InputBox';

// ============================
// 10. TERMS AND CONDITIONS COMPONENT
// ============================

const TermsAndConditions: React.FC = () => {
  return (
    <div className="">
      <p className="text-gray-800 dark:text-darkText-400">
        By signing in or creating an account, you are agreeing to our
        <a href="/terms-and-conditions" className="ml-1 text-blue-500 underline">
          Terms & Conditions
        </a>
        {' '}and our
        <a href="/privacy-policy" className="ml-1 text-blue-500 underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
};

// ============================
// 11. GOOGLE AUTHENTICATION COMPONENT
// ============================

const GoogleAuthButton: React.FC<{ initiator?: string }> = ({ initiator = 'auth' }) => {
  const redirectPath = useRedirectPath();
  const [source, setSource] = useState('website');
  
  useEffect(() => {
    const sourceParam = getURLSearchParam('source');
    setSource(sourceParam || 'website');
  }, []);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse?.credential) {
      try {
        const { token, newUser } = await AuthAPI.socialLogin(credentialResponse.credential);
        
        if (!token) {
          throw new Error('Token not found');
        }

        // Show success message
        if (newUser) {
          toast.success('Signed up successfully');
        } else {
          toast.success('Logged in successfully');
        }

        // Set token and user data
        CookieManager.setAuthToken(token);
        const decodedToken = decodeToken(token);
        useUserStore.setLoggedInUser(decodedToken.User);

        // Handle post-login navigation
        if (newUser) {
          usePopupStore.setOpenLoginPopup(false);
          usePopupStore.setOpenSignupPopup(false);
          useUserStore.setShowEditProfileModal(newUser);
        } else {
          handlePostLoginNavigation(source, initiator, redirectPath);
        }
      } catch (error: any) {
        toast.error(error.message || 'Unable to log in');
        console.error('Error during Google login', error);
      }
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
  };

  return (
    <div className="flex w-full justify-center">
      <GoogleLogin
        width={300}
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={true}
        auto_select={true}
        use_fedcm_for_prompt={true}
      />
    </div>
  );
};

const GoogleAuthProvider: React.FC<{ initiator?: string }> = ({ initiator = 'auth' }) => {
  const GOOGLE_CLIENT_ID =  '611240513027-jct0j0nnrt8qmths23f2s7tueh7qjjkk.apps.googleusercontent.com';

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="dark:text-darkText-400 justify-center items-center round-border text-sm flex flex-col text-center">
        Google Client ID is not set
        <span>Contact Admin If you are seeing this</span>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleAuthButton initiator={initiator} />
    </GoogleOAuthProvider>
  );
};

const SocialAuthButtons: React.FC<{ initiator?: string }> = ({ initiator }) => {
  return (
    <div className="grid py-1 w-full mx-auto justify-center sm:gap-0 gap-4 overflow-hidden">
      <GoogleAuthProvider initiator={initiator} />
    </div>
  );
};

// ============================
// 12. MAIN LOGIN COMPONENT
// ============================

const LoginForm: React.FC<{ initiator?: string; onClose?: () => void }> = ({ 
  initiator = 'auth', 
  onClose 
}) => {
  const [pathname] = useState(window.location.pathname);
  const redirectPath = useRedirectPath();
  const [source, setSource] = useState('website');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const sourceParam = getURLSearchParam('source');
    setSource(sourceParam || 'website');
  }, []);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setSubmitting
  } = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (formValues) => {
      setSubmitting(true);
      setErrorMessage('');
      
      try {
        const { token } = await AuthAPI.login(formValues);
        
        if (!token) {
          throw new Error('Token not found');
        }

        toast.success('Logged in successfully');
        CookieManager.setAuthToken(token);
        
        const decodedToken = decodeToken(token);
        useUserStore.setLoggedInUser(decodedToken.User);
        
        handlePostLoginNavigation(source, initiator, redirectPath);
      } catch (error: any) {
        setErrorMessage(error.message || 'An unexpected error occurred.');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const navigateToSignup = () => {
    if (initiator === 'auth') {
      window.location.href = `/signup?redirect=${redirectPath}&source=${source}`;
    } else {
      window.location.href = `/signup?redirect=${pathname}&source=${source}`;
    }
  };

  return (
    <div className="w-full flex flex-col gap-y-4 max-w-md p-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="block text-2xl font-bold text-gray-800 dark:text-darkText-300">
            Sign in
          </h1>
          {initiator === 'component' && (
            <button
              onClick={onClose}
              className="round-border border dark:border-darkBorder-800 p-1.5"
            >
              <CloverIcon className="text-black dark:text-white round-border" size={18} />
            </button>
          )}
        </div>
        
        <div className="mt-2 text-sm text-gray-600 dark:text-darkText-400">
          Don't have an account yet?{' '}
          <button
            className="font-medium text-blue-600 dark:text-blue-500 decoration-2 hover:underline"
            onClick={navigateToSignup}
          >
            Sign up here
          </button>
        </div>
        
        <hr className="mx-auto mt-2 border-gray-200 dark:border-darkBorder-700" />
      </div>

      {/* Login Form */}
      <form className="mt-2" onSubmit={handleSubmit}>
        <div className="grid gap-y-4">
          <InputBox
            type="email"
            name="email"
            value={values.email}
            placeholder="Enter email address"
            handleChange={handleChange}
            handleBlur={handleBlur}
            error={touched.email ? errors.email : undefined}
            label="Email address"
          />
          
          <InputBox
            type="password"
            name="password"
            label={
              <div className="flex items-center justify-between">
                <span>Password</span>
                <a
                  className="text-sm font-medium text-blue-600 dark:text-blue-500 text-violet decoration-2 hover:underline"
                  href="/forgot-password"
                >
                  Forgot password?
                </a>
              </div>
            }
            value={values.password}
            handleChange={handleChange}
            handleBlur={handleBlur}
            placeholder="Enter password"
            error={touched.password ? errors.password : undefined}
          />
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white border border-transparent round-border bg-codolioBase gap-x-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            Sign in
          </button>
        </div>
        
        {errorMessage && (
          <div id="error-display" className="w-full mt-4 text-center">
            <span className="text-sm font-[500] text-red-500">
              {errorMessage}
            </span>
          </div>
        )}
      </form>

      {/* Social Login Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200 dark:border-darkBorder-700" />
        </div>
        <div className="relative flex justify-center text-sm font-medium leading-6">
          <span className="bg-white dark:bg-darkBox-900 px-6 text-gray-900 dark:text-white">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="-mt-1">
        <SocialAuthButtons initiator={initiator} />
      </div>

      {/* Terms and Conditions */}
      <div className="px-4 py-2 mx-auto text-xs text-center round-border">
        <TermsAndConditions />
      </div>
    </div>
  );
};

// ============================
// 13. FEATURE SHOWCASE COMPONENT
// ============================

const FeatureShowcase: React.FC = () => {
  const features = [
    {
      image: '/static/Profile_Tracker.png',
      heading: 'All in One Coding Profile',
      subHeading: 'Showcase your complete coding portfolio, track all stats, and share your progress effortlessly in one place.'
    },
    {
      image: '/static/Question_Tracker.png',
      heading: 'Follow Popular Sheets',
      subHeading: 'Organize questions notes and follow popular coding Sheets in one place for seamless review and effective revision.'
    },
    {
      image: '/static/Contest_Tracker.png',
      heading: 'Contest Tracker',
      subHeading: 'Stay on top of coding contests by tracking schedules and setting reminders effortlessly with a single click.'
    }
  ];

  return (
    <div className="flex flex-col">
      <h1 className="text-4xl mt-10 text-white font-semibold">
        Welcome to Codolio
      </h1>
      
      <div className="flex flex-col mt-8 gap-14 max-w-lg">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  );
};

const FeatureCard: React.FC<FeatureCardProps> = ({ image, heading, subHeading }) => {
  return (
    <div className="flex gap-4">
      <div className="w-[160px] h-[120px] flex justify-center items-center bg-white dark:bg-darkBox-950 round-border">
        <img src={image} alt={heading} />
      </div>
      
      <div className="flex w-full flex-col gap-1">
        <h3 className="dark:text-darkText-300 text-2xl font-semibold">
          {heading}
        </h3>
        <p className="font-[500] leading-tight text-gray-200 dark:text-darkText-500">
          {subHeading}
        </p>
      </div>
    </div>
  );
};

// ============================
// 14. BRAND SIDEBAR COMPONENT
// ============================

const BrandSidebar: React.FC<{ children: React.ReactNode; showOwl?: boolean }> = ({ 
  children, 
  showOwl = true 
}) => {
  return (
    <div className="relative hidden lg:flex lg:flex-col flex-1 h-full">
      <div className="relative overflow-hidden text-white dark:text-darkText-400 z-20 md:flex-col md:flex bg-codolioBase dark:bg-darkBox-900 h-full justify-center items-center">
        {/* Background decorative elements */}
        <img
          src="/static/Bubble.png"
          alt="top bubble"
          width={112}
          height={0}
          className="absolute top-8 left-32 dark:opacity-5 opacity-25"
        />
        <img
          src="/static/Bubble.png"
          alt="side bubble"
          width={224}
          height={0}
          className="absolute top-[50%] -right-[15%] dark:opacity-5 opacity-25"
        />
        <img
          src="/static/Bubble.png"
          alt="bottom bubble"
          width={160}
          height={0}
          className="absolute -bottom-6 dark:opacity-5 opacity-25"
        />
        <img
          src="/static/Mesh.png"
          alt="Mesh"
          width={350}
          height={0}
          className="absolute -right-14 top-0 dark:opacity-10 opacity-25"
        />
        
        {children}
      </div>
      
      {showOwl && (
        <img
          src="/codolio_assets/gif-owl-transparent.GIF"
          alt="codolio owl"
          className="absolute mx-auto top-6 -left-24 -z-1 hidden lg:block -rotate-[30deg] h-auto border-gray-300 dark:border-y-darkBorder-700"
          width={132}
          height={0}
        />
      )}
    </div>
  );
};

// ============================
// 15. MAIN AUTH LAYOUT COMPONENT
// ============================

const AuthLayout: React.FC<AuthLayoutProps> = ({ initiator = 'auth', onClose }) => {
  return (
    <div className="flex w-full h-full bg-white dark:bg-dark-900">
      <div className="flex-1 flex justify-center items-center py-4">
        <LoginForm initiator={initiator} onClose={onClose} />
      </div>
      
      <BrandSidebar>
        <FeatureShowcase />
      </BrandSidebar>
    </div>
  );
};

// ============================
// 16. MAIN AUTH PAGE COMPONENT
// ============================

const AuthPageContent: React.FC = () => {
  const [redirectPath, setRedirectPath] = useState('/');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const redirect = getURLSearchParam('redirect');
    setRedirectPath(redirect || '/');
    
    // Check if user is already logged in
    const token = CookieManager.getAuthToken();
    if (token) {
      setIsAuthenticated(true);
      window.location.href = redirect || '/';
    }
  }, []);

  return (
    <div className="w-full -mt-12 dark:bg-dark dark:text-white min-h-[90vh] md:h-[100vh] flex items-center justify-center">
      {!isAuthenticated && (
        <AuthLayout initiator="auth" />
      )}
    </div>
  );
};

const AuthPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
};

// ============================
// 17. EXPORT
// ============================

export default AuthPage;
export { 
  AuthAPI, 
  CookieManager, 
  LoginForm, 
  GoogleAuthProvider, 
  SocialAuthButtons,
  InputBox,
  TermsAndConditions,
  FeatureShowcase,
  BrandSidebar,
  AuthLayout
};