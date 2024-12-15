import React, { createContext, useState, useContext, ReactNode } from "react";

type SettingsContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: string;
  setLanguage: (language: string) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("pl");

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <SettingsContext.Provider value={{ darkMode, toggleDarkMode, language, setLanguage }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
