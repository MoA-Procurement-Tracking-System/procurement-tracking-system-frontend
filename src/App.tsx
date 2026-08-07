import React, { useState } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginCard } from "./components/auth/LoginCard";
import { ForgotPasswordCard } from "./components/auth/ForgotPasswordCard";
import { TechnicalSupportModal } from "./components/TechnicalSupportModal";

const MainAppRouter: React.FC = () => {
  const { viewState } = useAuth();
  const [isTechSupportOpen, setIsTechSupportOpen] = useState(false);

  const openSupport = () => setIsTechSupportOpen(true);
  const closeSupport = () => setIsTechSupportOpen(false);

  return (
    <>
      {/* Route Views */}
      {viewState === "LOGIN" && <LoginCard onOpenTechSupport={openSupport} />}

      {viewState === "FORGOT_PASSWORD" && (
        <ForgotPasswordCard onOpenTechSupport={openSupport} />
      )}

      {/* Global Technical Support Dialog */}
      <TechnicalSupportModal
        isOpen={isTechSupportOpen}
        onClose={closeSupport}
      />
    </>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppRouter />
      </AuthProvider>
    </LanguageProvider>
  );
}
