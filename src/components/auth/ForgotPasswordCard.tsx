import React, { useState } from "react";
import {
  ArrowLeft,
  Headphones,
  Globe,
  CheckCircle,
  Mail,
  AlertCircle,
} from "lucide-react";
import { MoALogo } from "../MoALogo";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

interface ForgotPasswordCardProps {
  onOpenTechSupport: () => void;
}

export const ForgotPasswordCard: React.FC<ForgotPasswordCardProps> = ({
  onOpenTechSupport,
}) => {
  const { sendPasswordResetLink, isLoading, setViewState } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [email, setEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await sendPasswordResetLink(email);
    if (res.success) {
      setSuccessMsg(t("resetLinkSent"));
    } else {
      setErrorMsg(res.message || t("resetRequestFailed"));
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between items-center py-6 px-4 font-sans text-slate-800">
      {/* Top Header Bar */}
      <div className="w-full max-w-5xl flex justify-end">
        <button
          type="button"
          onClick={() => setLanguage(language === "en" ? "am" : "en")}
          aria-label={t("switchLanguage")}
          className="flex items-center space-x-2 bg-white/90 backdrop-blur border border-slate-200 shadow-sm hover:border-emerald-500 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#0b3c2a] transition-all cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-700" />
          <span>{language === "en" ? "English / አማርኛ" : "አማርኛ / English"}</span>
        </button>
      </div>

      {/* Main Card (Image 2 replica) */}
      <div className="w-full max-w-md my-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10 transition-all">
          {/* Ministry Logo */}
          <MoALogo size="md" showText={true} />

          {/* Titles */}
          <div className="mt-5 text-center">
            <h1 className="text-2xl md:text-[26px] font-extrabold text-[#064e3b] tracking-tight leading-snug">
              {t("resetPasswordTitle")}
            </h1>
            <p className="mt-2 text-xs md:text-sm text-slate-500 font-medium px-2 leading-relaxed">
              {t("resetPasswordSubtitle")}
            </p>
          </div>

          {/* Success / Error Messages */}
          {successMsg && (
            <div
              role="status"
              className="mt-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3.5 rounded-xl text-xs flex items-start space-x-2.5 animate-fade-in"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {successMsg}
              </div>
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="mt-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-start space-x-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="reset-email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                {t("emailAddress")}
              </label>
              <div className="relative">
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSuccessMsg(null);
                    setErrorMsg(null);
                  }}
                  placeholder="name@moa.gov.et"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3c2a]/30 focus:border-[#0b3c2a] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Send Reset Link Button */}
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full mt-2 py-3 px-4 bg-[#0b3c2a] hover:bg-[#062c1e] text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-950/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t("sendingResetLink")}</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>{t("sendResetLink")}</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Action Links */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setViewState("LOGIN")}
              className="flex items-center space-x-1.5 font-semibold text-slate-600 hover:text-[#0b3c2a] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t("backToSignIn")}</span>
            </button>

            <button
              type="button"
              onClick={onOpenTechSupport}
              className="flex items-center space-x-1.5 font-semibold text-slate-600 hover:text-[#0b3c2a] transition-colors cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5 text-emerald-700" />
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
