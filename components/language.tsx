"use client";

import { createContext, useContext } from "react";

export type Language = "en" | "ka";
export const LanguageContext = createContext<Language>("en");
export function useCopy() {
  const language = useContext(LanguageContext);
  return (english: string, georgian: string) =>
    language === "ka" ? georgian : english;
}
