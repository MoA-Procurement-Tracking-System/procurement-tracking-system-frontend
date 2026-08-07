import React, { useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Headphones,
  Globe,
  AlertCircle,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { MoALogo } from "../MoALogo";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

interface LoginCardProps {
  onOpenTechSupport: () => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onOpenTechSupport }) => {
  const { login, loginError, loginSuccess, isLoading, setViewState } =
    useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    await login(username, password, rememberMe);
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between items-center py-6 px-4 font-sans text-slate-800">
      {/* Top Header Bar with Language Toggle */}
      <div className="w-full max-w-5xl flex justify-end">
        <button
          onClick={() => setLanguage(language === "en" ? "am" : "en")}
          className="flex items-center space-x-2 bg-white/90 backdrop-blur border border-slate-200 shadow-sm hover:border-emerald-500 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#0b3c2a] transition-all cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-700" />
          <span>{language === "en" ? "English / አማርኛ" : "አማርኛ / English"}</span>
        </button>
      </div>

      {/* Main Login Card (Image 1 replica) */}
      <div className="w-full max-w-md my-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10 transition-all">
          {/* Ministry Logo */}
          <MoALogo size="md" showText={true} />

          {/* System Titles */}
          <div className="mt-5 text-center">
            <h1 className="text-2xl md:text-[26px] font-extrabold text-[#064e3b] tracking-tight leading-snug">
              {t("moaTitle")}
            </h1>
            <p className="mt-1.5 text-xs md:text-sm text-slate-500 font-medium">
              {t("moaSubtitle")}
            </p>
          </div>

          {/* Error Banner */}
          {loginError && (
            <div className="mt-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{loginError}</div>
            </div>
          )}

          {/* Success Banner */}
          {loginSuccess && (
            <div className="mt-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-start space-x-2.5 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">Successfully signed in.</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Username or Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("usernameOrEmail")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("usernamePlaceholder")}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3c2a]/30 focus:border-[#0b3c2a] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3c2a]/30 focus:border-[#0b3c2a] focus:bg-white transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0b3c2a] border-slate-300 focus:ring-[#0b3c2a] cursor-pointer"
                />
                <span className="font-medium text-slate-700">
                  {t("rememberMe")}
                </span>
              </label>

              <button
                type="button"
                onClick={() => setViewState("FORGOT_PASSWORD")}
                className="font-bold text-[#0b3c2a] hover:underline cursor-pointer"
              >
                {t("forgotPassword")}
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-[#0b3c2a] hover:bg-[#062c1e] text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-950/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t("signingIn")}</span>
                </>
              ) : (
                <>
                  <span>{t("signIn")}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Technical Support link inside card */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-center">
            <button
              type="button"
              onClick={onOpenTechSupport}
              className="flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-[#0b3c2a] transition-colors cursor-pointer"
            >
              <Headphones className="w-4 h-4 text-emerald-700" />
              <span>{t("technicalSupport")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <footer className="w-full text-center text-[11px] text-slate-500 font-medium py-2">
        © 2026 Ministry of Agriculture (MoA) Procurement Tracking System • SRS
        MVP v1.1
      </footer>
    </div>
  );
};
