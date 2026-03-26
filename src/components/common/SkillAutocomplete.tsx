import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const validateSkillNameFrontEnd = (name: string): { valid: boolean; message?: string } => {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 30) {
    return { valid: false, message: "Skill must be between 2 and 30 characters." };
  }
  const validSkillRegex = /^[a-zA-Z0-9+#.\s-]+$/;
  if (!validSkillRegex.test(trimmed)) {
    return { valid: false, message: "Only letters, numbers, and basic symbols (+ # . -) are allowed." };
  }
  const spamRegex = /(.)\1{3,}/;
  if (spamRegex.test(trimmed)) {
    return { valid: false, message: "Skill name looks like spam (repeated characters)." };
  }
  const badWords = [
    "fuck", "shit", "bitch", "ass", "cunt", "nigger", "faggot", "dick", "pussy", "whore", "slut", "spam", "fake", "test", "bot"
  ];
  const lowerName = trimmed.toLowerCase();
  for (const word of badWords) {
    if (lowerName.includes(word)) {
      return { valid: false, message: "Skill name contains inappropriate language." };
    }
  }
  return { valid: true };
};

interface SkillAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function SkillAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "e.g. React, Python, UI Design",
  className,
}: SkillAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      if (!value || value.trim().length < 1) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await api.get(`/metadata/skills?q=${value}`);
        setSuggestions(res.data.skills || []);
        setIsOpen(true);
      } catch (error) {
        console.error("Failed to fetch skills", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSkills, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handleSelect = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;

    const validation = validateSkillNameFrontEnd(trimmed);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    onSelect(trimmed);
    setIsOpen(false);
    onChange(""); // Usually we clear it after selection if it's a tag input
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(value);
    }
  };

  return (
    <div className={`relative w-full ${className || ""}`} ref={wrapperRef}>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value.trim().length > 0) setIsOpen(true);
          }}
          className={cn("w-full bg-muted/30 border-border focus-visible:ring-primary/20", className)}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {isOpen && (value.trim().length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border shadow-md rounded-md max-h-60 overflow-y-auto">
          {suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((skill) => (
                <li
                  key={skill.id}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-muted hover:text-foreground transition-colors"
                  onClick={() => handleSelect(skill.name)}
                >
                  {skill.name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Press Enter to add "{value}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
