"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

const languages: { value: Language; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "zh-CN", label: "简体中文", flag: "🇨🇳" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const currentLanguage = languages.find((lang) => lang.value === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="relative h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-md hover:bg-background border-border"
          title="Change language"
        >
          <Languages className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-48 mb-2">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => setLanguage(lang.value)}
            className={`cursor-pointer ${
              language === lang.value
                ? "bg-accent font-semibold"
                : ""
            }`}
          >
            <span className="mr-2 text-lg">{lang.flag}</span>
            <span>{lang.label}</span>
            {language === lang.value && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
