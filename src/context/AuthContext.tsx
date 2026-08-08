"use client";

import React, { createContext, useContext, useState } from "react";
import { authenticate, requestPasswordReset } from "../lib/authApi";

export const REMEMBERED_EMAIL_STORAGE_KEY = "moa_remembered_email";
const ACCESS_TOKEN_STORAGE_KEY = "moa_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "moa_refresh_token";

interface AuthContextType {
  loginError: string | null;
  isLoading: boolean;
  loginSuccess: boolean;
  viewState: "LOGIN" | "FORGOT_PASSWORD";
  setViewState: (view: "LOGIN" | "FORGOT_PASSWORD") => void;
  login: (email: string, pass: string, rememberMe: boolean) => Promise<boolean>;
  sendPasswordResetLink: (
    email: string,
  ) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [viewState, setViewState] = useState<"LOGIN" | "FORGOT_PASSWORD">(
    "LOGIN",
  );
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (
    emailInput: string,
    passwordInput: string,
    rememberMe: boolean,
  ): Promise<boolean> => {
    setIsLoading(true);
    setLoginError(null);
    setLoginSuccess(false);

    try {
      const normalizedEmail = emailInput.trim().toLowerCase();
      const session = await authenticate(normalizedEmail, passwordInput);

      const selectedStorage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;

      selectedStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      selectedStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      otherStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      otherStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);

      if (session.accessToken) {
        selectedStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, session.accessToken);
      }
      if (session.refreshToken) {
        selectedStorage.setItem(
          REFRESH_TOKEN_STORAGE_KEY,
          session.refreshToken,
        );
      }

      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_STORAGE_KEY, normalizedEmail);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_STORAGE_KEY);
      }

      setLoginSuccess(true);
      return true;
    } catch (error) {
      setLoginError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordResetLink = async (
    email: string,
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      return { success: true, message: "" };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to process the password reset request.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const changeView = (view: "LOGIN" | "FORGOT_PASSWORD") => {
    setLoginError(null);
    setLoginSuccess(false);
    setViewState(view);
  };

  return (
    <AuthContext.Provider
      value={{
        loginError,
        isLoading,
        loginSuccess,
        viewState,
        setViewState: changeView,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
