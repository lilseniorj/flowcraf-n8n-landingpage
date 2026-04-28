import { createContext, useContext, useState } from "react";

const LangContext = createContext(["es", () => {}]);

export function LangProvider({ children }) {
  const [lang, setLang] = useState("es");
  return <LangContext.Provider value={[lang, setLang]}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
