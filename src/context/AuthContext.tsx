import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  loginError: string | null;
  isLoading: boolean;
  loginSuccess: boolean;
  viewState: 'LOGIN' | 'FORGOT_PASSWORD';
  setViewState: (view: 'LOGIN' | 'FORGOT_PASSWORD') => void;
  login: (username: string, pass: string, rememberMe: boolean) => Promise<boolean>;
  sendPasswordResetLink: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewState, setViewState] = useState<'LOGIN' | 'FORGOT_PASSWORD'>('LOGIN');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    setIsLoading(true);
    setLoginError(null);
    setLoginSuccess(false);

    await new Promise((res) => setTimeout(res, 500));

    const cleanInput = usernameInput.trim().toLowerCase();

    // Basic authentication validation
    if (cleanInput && passwordInput.length >= 4) {
      setLoginSuccess(true);
      setIsLoading(false);
      return true;
    } else {
      setLoginError('Invalid username or password.');
      setIsLoading(false);
      return false;
    }
  };

  const sendPasswordResetLink = async (email: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 500));
    setIsLoading(false);

    return {
      success: true,
      message: `A password reset link with security instructions has been sent to ${email}.`,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        loginError,
        isLoading,
        loginSuccess,
        viewState,
        setViewState,
        login,
        sendPasswordResetLink,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
