import React, { createContext, useContext, useState } from 'react';

interface SignupContextType {
  signupData: {
    email: string;
    // tempToken?: string;
  } | null;
  // setSignupData: (data: { email: string; tempToken?: string }) => void;
  setSignupData: (data: { email: string}) => void;
  clearSignupData: () => void;
}

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export const SignupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🔄 Initializing SignupProvider');
  // const [signupData, setSignupData] = useState<{ email: string; tempToken?: string } | null>(null);
  const [signupData, setSignupData] = useState<{ email: string } | null>(null);

  // const handleSetSignupData = (data: { email: string; tempToken?: string }) => {
  const handleSetSignupData = (data: { email: string }) => {
    console.log('🔄 Setting signup data:', data);
    setSignupData(data);
  };

  const handleClearSignupData = () => {
    console.log('🔄 Clearing signup data');
    setSignupData(null);
  };

  return (
    <SignupContext.Provider
      value={{
        signupData,
        setSignupData: handleSetSignupData,
        clearSignupData: handleClearSignupData,
      }}
    >
      {children}
    </SignupContext.Provider>
  );
};


export const useSignup = () => {
  const context = useContext(SignupContext);
  if (context === undefined) {
    console.error('❌ useSignup must be used within a SignupProvider');
    throw new Error('useSignup must be used within a SignupProvider');
  }
  return context;
};
