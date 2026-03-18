import React, { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

const SUGGESTED_SKILLS = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python",
  "Data Analysis", "Data Engineering", "Machine Learning", "AWS",
  "UI/UX Design", "Graphic Design", "Figma", "Adobe Illustrator",
  "Copywriting", "SEO", "Digital Marketing", "Project Management",
  "HTML", "CSS", "Tailwind CSS", "Next.js", "Express.js",
  "MongoDB", "PostgreSQL", "Docker", "Kubernetes", "GraphQL",
  "Swift", "Kotlin", "React Native", "Flutter",
]

interface SkillSelectorProps {
  selectedSkills: string[]
  onChange: (skills: string[]) => void
}

export function SkillSelector({ selectedSkills, onChange }: SkillSelectorProps) {
  const [inputValue, setInputValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filteredSuggestions = SUGGESTED_SKILLS.filter(skill =>
    skill.toLowerCase().includes(inputValue.toLowerCase()) &&
    !selectedSkills.includes(skill)
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const addSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (trimmed && !selectedSkills.includes(trimmed)) {
      onChange([...selectedSkills, trimmed])
    }
    setInputValue("")
    setShowSuggestions(false)
  }

  const removeSkill = (skillToRemove: string) => {
    onChange(selectedSkills.filter(s => s !== skillToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault() // prevent parent form from submitting
      addSkill(inputValue)
    }
  }

  return (
    <div className="space-y-3 relative" ref={wrapperRef}>
      <Input
        placeholder="Type a skill and press Enter (e.g. React, UI/UX)..."
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          setShowSuggestions(true)
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
      />

      {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-y-auto">
          {filteredSuggestions.map((skill) => (
            <div
              key={skill}
              className="px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
              onClick={() => addSkill(skill)}
            >
              {skill}
            </div>
          ))}
        </div>
      )}

      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedSkills.map((skill) => (
            <Badge key={skill} variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary/10 hover:bg-primary/20 transition-colors">
              {skill}
              <X
                className="w-3.5 h-3.5 cursor-pointer hover:text-destructive flex-shrink-0"
                onClick={() => removeSkill(skill)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
