import React, { createContext, useContext, useState, useEffect } from "react";
import { Language } from "../types";

interface Translations {
  [key: string]: {
    en: string;
    am: string;
  };
}

export const DICTIONARY: Translations = {
  moaTitle: {
    en: "MoA Procurement Tracking System",
    am: "የግብርና ሚኒስቴር የግብዥ ክትትል ሥርዓት",
  },
  moaSubtitle: {
    en: "Internal Procurement Planning, Tracking and Reporting",
    am: "የውስጥ ግብዥ ዕቅድ፣ ክትትል እና ሪፖርት ማቅረቢያ",
  },
  ministryOfAgriculture: {
    en: "MINISTRY OF AGRICULTURE",
    am: "ግብርና ሚኒስቴር",
  },
  usernameOrEmail: {
    en: "Username or Email",
    am: "የተጠቃሚ ስም ወይም ኢሜይል",
  },
  usernamePlaceholder: {
    en: "Enter officer, director, or admin",
    am: "ኦፊሰር፣ ዳይሬክተር ወይም አስተዳዳሪ ያስገቡ",
  },
  password: {
    en: "Password",
    am: "የይለፍ ቃል",
  },
  rememberMe: {
    en: "Remember me",
    am: "አስታውሰኝ",
  },
  forgotPassword: {
    en: "Forgot Password?",
    am: "የይለፍ ቃል ረስተዋል?",
  },
  signIn: {
    en: "Sign In",
    am: "ግባ",
  },
  signingIn: {
    en: "Signing in...",
    am: "በመግባት ላይ...",
  },
  technicalSupport: {
    en: "Technical Support",
    am: "ቴክኒካዊ ድጋፍ",
  },
  resetPasswordTitle: {
    en: "Reset Your Password",
    am: "የይለፍ ቃልዎን ይቀይሩ",
  },
  resetPasswordSubtitle: {
    en: "Enter the email linked to your account and we'll send a reset link.",
    am: "ከመለያዎ ጋር የተያያዘውን ኢሜይል ያስገቡ እና የማስተካከያ ሊንክ እንልካለን።",
  },
  emailAddress: {
    en: "Email Address",
    am: "የኢሜይል አድራሻ",
  },
  sendResetLink: {
    en: "Send Reset Link",
    am: "የማስተካከያ ሊንክ ላክ",
  },
  backToSignIn: {
    en: "Back to Sign In",
    am: "ወደ መግቢያ ተመለስ",
  },
  firstLoginTitle: {
    en: "Change Temporary Password Required",
    am: "ጊዜያዊ የይለፍ ቃል መቀየር ያስፈልጋል",
  },
  firstLoginSubtitle: {
    en: "As a security requirement for first-time access, please set a new personal password before accessing the system.",
    am: "ለመጀመሪያ ጊዜ መግቢያ ደህንነት ሲባል፣ ወደ ሲስተሙ ከመግባትዎ በፊት እባክዎን አዲስ የግል የይለፍ ቃል ያዘጋጁ።",
  },
  currentTempPassword: {
    en: "Current Temporary Password",
    am: "የአሁኑ ጊዜያዊ የይለፍ ቃል",
  },
  newPassword: {
    en: "New Password",
    am: "አዲስ የይለፍ ቃል",
  },
  confirmNewPassword: {
    en: "Confirm New Password",
    am: "አዲሱን የይለፍ ቃል ያረጋግጡ",
  },
  updatePasswordButton: {
    en: "Update Password & Access System",
    am: "የይለፍ ቃል ያዘምኑ እና ይግቡ",
  },
  signOut: {
    en: "Sign Out",
    am: "ውጣ",
  },
  dashboardOverview: {
    en: "Overview & Analytics",
    am: "አጠቃላይ እይታ",
  },
  requisitionsTab: {
    en: "Procurement Requisitions",
    am: "የግብዥ ጥያቄዎች",
  },
  tendersTab: {
    en: "Tenders & Bids",
    am: "ጨረታዎችና ጨረታ ግምገማ",
  },
  contractsTab: {
    en: "Contracts & Logistics",
    am: "ውሎች እና ሎጅስቲክስ",
  },
  vendorsTab: {
    en: "Approved Vendors",
    am: "የተመዘገቡ አቅራቢዎች",
  },
  budgetsTab: {
    en: "Department Budgets",
    am: "የመምሪያ በጀቶች",
  },
  adminTab: {
    en: "User Administration & Audit Logs",
    am: "የተጠቃሚዎች አስተዳደር እና ኦዲት",
  },
  quickDemoUsers: {
    en: "Quick Demo Sign-In Credentials",
    am: "ፈጣን የማሳያ መግቢያ መለያዎች",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("moa_lang") as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("moa_lang", language);
  }, [language]);

  const t = (key: string): string => {
    if (DICTIONARY[key]) {
      return DICTIONARY[key][language] || DICTIONARY[key].en;
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
