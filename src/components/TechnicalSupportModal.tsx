import React, { useState } from "react";
import {
  Headphones,
  Mail,
  Phone,
  X,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface TechnicalSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechnicalSupportModal: React.FC<TechnicalSupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTicketSubject("");
      setTicketMessage("");
      setUserEmail("");
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 text-slate-900 p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Headphones className="w-5 h-5 text-[#0b3c2a]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {language === "am"
                  ? "የቴክኒክ ድጋፍ ማዕከል"
                  : "MoA ICT Technical Support"}
              </h3>
              <p className="text-xs text-slate-500">
                {language === "am"
                  ? "የኢንፎርሜሽን እና ኮሙኒኬሽን ቴክኖሎጂ ዳይሬክቶሬት"
                  : "ICT & Systems Administration Directorate"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 bg-white">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">
                {language === "am"
                  ? "የድጋፍ ጥያቄዎ ተልኳል!"
                  : "Support Request Submitted!"}
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                {language === "am"
                  ? "የቴክኒክ ቡድናችን ጥያቄዎን መዝግቦ በኢሜይልዎ ምላሽ ይሰጥዎታል።"
                  : "Request #REQ-8921 logged. An ICT helpdesk specialist will respond shortly."}
              </p>
            </div>
          ) : (
            <>
              {/* Direct Hotlines */}
              <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 text-xs text-slate-700">
                  <Phone className="w-4 h-4 text-[#0b3c2a] shrink-0" />
                  <div>
                    <span className="block font-semibold text-slate-900">
                      {language === "am" ? "ነፃ የስልክ መስመር" : "Hotline"}
                    </span>
                    <span className="text-slate-600 font-mono">
                      9090 / +251 11 646 0128
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-700">
                  <Mail className="w-4 h-4 text-[#0b3c2a] shrink-0" />
                  <div>
                    <span className="block font-semibold text-slate-900">
                      {language === "am" ? "ድጋፍ ኢሜይል" : "Support Email"}
                    </span>
                    <span className="text-slate-600 font-mono text-[11px]">
                      support@moa.gov.et
                    </span>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="flex items-start space-x-2.5 text-xs bg-white border border-amber-200 text-amber-900 p-3 rounded-lg shadow-xs">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  {language === "am"
                    ? "የመለያ መቆለፍ ወይም የይለፍ ቃል መቀየር ችግር ካለዎት፣ እባክዎን የመምሪያዎትን የአይሲቲ አስተዳዳሪ ያነጋግሩ።"
                    : "For account unlock or credential resets, specify your official MoA Department ID below."}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === "am" ? "የእርስዎ ኢሜይል" : "Your MoA Email"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="officer@moa.gov.et"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3c2a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === "am" ? "የችግሩ ርዕስ" : "Issue Subject"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      language === "am"
                        ? "ለምሳሌ፡ የመግቢያ ችግር"
                        : "e.g. Cannot access requisition form"
                    }
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3c2a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === "am" ? "የችግሩ ማብራሪያ" : "Description of Issue"}
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder={
                      language === "am"
                        ? "ዝርዝር ማብራሪያ ያስገቡ..."
                        : "Describe what happened or any error code..."
                    }
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3c2a] resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {language === "am" ? "ሰርዝ" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium text-white bg-[#0b3c2a] hover:bg-[#072a1d] rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    {language === "am" ? "ጥያቄ ላክ" : "Submit Request"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
