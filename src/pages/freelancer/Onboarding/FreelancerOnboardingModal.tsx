import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { freelancerService } from "@/lib/freelancer.service"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function FreelancerOnboardingModal({ 
  isOpen, 
  onClose,
  onComplete,
  profile
}: { 
  isOpen: boolean, 
  onClose: () => void,
  onComplete: () => void,
  profile: any
}) {
  // Determine the starting step based on what's missing
  let initialStep = 1
  if (profile?.user?.firstName && profile?.location && profile?.tagline) initialStep = 2
  if (initialStep === 2 && profile?.hourlyRate && profile?.bio) initialStep = 3
  if (initialStep === 3 && profile?.skills?.length > 0) initialStep = 4
  if (initialStep === 4 && profile?.user?.isIdVerified && profile?.user?.profileImage) initialStep = 5

  const [step, setStep] = useState(initialStep)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // State
  const [formData, setFormData] = useState({
    firstName: profile?.user?.firstName || "",
    lastName: profile?.user?.lastName || "",
    location: profile?.location || "",
    preferredClientLocation: profile?.preferredClientLocation || "",
    tagline: profile?.tagline || "",
    hourlyRate: profile?.hourlyRate?.toString() || "",
    bio: profile?.bio || "",
    availability: profile?.availability || "AVAILABLE",
    experienceLevel: profile?.experienceLevel || "ENTRY",
    skills: profile?.skills?.map((s: any) => s.skill?.name || s.name).join(", ") || "",
    school: profile?.educations?.[0]?.school || "",
    degree: profile?.educations?.[0]?.degree || "",
    year: profile?.educations?.[0]?.year || "",
    github: profile?.github || "",
    linkedin: profile?.linkedin || "",
    portfolio: profile?.portfolio || "",
    website: profile?.website || ""
  })
  const [files, setFiles] = useState<{ idDocument: File | null, profileImage: File | null }>({
    idDocument: null, profileImage: null
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleNext = async () => {
    setIsLoading(true)
    try {
      if (step === 1) {
        await freelancerService.updateOnboardingStep1({
          firstName: formData.firstName,
          lastName: formData.lastName,
          location: formData.location,
          preferredClientLocation: formData.preferredClientLocation,
          tagline: formData.tagline
        })
      } else if (step === 2) {
        await freelancerService.updateOnboardingStep2({
          hourlyRate: Number(formData.hourlyRate),
          bio: formData.bio,
          availability: formData.availability,
          experienceLevel: formData.experienceLevel
        })
      } else if (step === 3) {
        const skillsArray = formData.skills
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .map(s => ({ name: s, level: 3 }))
          
        await freelancerService.updateOnboardingStep3({
          skills: skillsArray,
          education: (formData.school || formData.degree) 
            ? [{ school: formData.school, degree: formData.degree, year: formData.year }] 
            : [],
          certifications: []
        })
      } else if (step === 4) {
        const formPayload = new FormData()
        if (files.idDocument) formPayload.append("idDocument", files.idDocument)
        if (files.profileImage) formPayload.append("profileImage", files.profileImage)
        if (files.idDocument || files.profileImage) {
          await freelancerService.uploadOnboardingFiles(formPayload)
        }
      } else if (step === 5) {
        await freelancerService.updateOnboardingStep5({
          github: formData.github,
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
          website: formData.website
        })
        toast({ title: "Profile Completed!", description: "Welcome to SkillBridge!" })
        onComplete()
        return
      }
      setStep(prev => prev + 1)
    } catch (error) {
      toast({ title: "Error", description: "Failed to save details. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Profile ({step}/5)</DialogTitle>
          <DialogDescription>
            Boost your profile visibility by completing these steps.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Professional Tagline</Label>
                <Input name="tagline" value={formData.tagline} onChange={handleChange} placeholder="Senior Full Stack Engineer" />
              </div>
              <div className="space-y-2">
                <Label>Your Location</Label>
                <Input name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" />
              </div>
              <div className="space-y-2">
                <Label>Preferred Client Location (Optional)</Label>
                <Input name="preferredClientLocation" value={formData.preferredClientLocation} onChange={handleChange} placeholder="E.g., North America, Remote" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Hourly Rate ($)</Label>
                <Input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} placeholder="50" />
              </div>
              <div className="space-y-2">
                <Label>Professional Bio</Label>
                <Textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell clients about yourself..." className="h-32" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select onValueChange={(val) => setFormData(p => ({ ...p, experienceLevel: val }))} defaultValue={formData.experienceLevel}>
                    <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTRY">Entry Level</SelectItem>
                      <SelectItem value="MID">Intermediate</SelectItem>
                      <SelectItem value="SENIOR">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select onValueChange={(val) => setFormData(p => ({ ...p, availability: val }))} defaultValue={formData.availability}>
                    <SelectTrigger><SelectValue placeholder="Select Availability" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available for Work</SelectItem>
                      <SelectItem value="BUSY">Less than 30hrs/wk</SelectItem>
                      <SelectItem value="UNAVAILABLE">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
               <div className="space-y-2">
                <Label>Top Skills (comma separated)</Label>
                <Input name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, UI/UX" />
              </div>
              <div className="pt-4 pb-2"><Label className="text-lg font-bold">Education</Label></div>
              <div className="space-y-2">
                <Label>School/University</Label>
                <Input name="school" value={formData.school} onChange={handleChange} placeholder="Harvard University" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Degree</Label>
                  <Input name="degree" value={formData.degree} onChange={handleChange} placeholder="B.S. Computer Science" />
                </div>
                <div className="space-y-2">
                  <Label>Graduation Year</Label>
                  <Input name="year" value={formData.year} onChange={handleChange} placeholder="2024" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2 border-b pb-4">
                <Label>Profile Picture</Label>
                <Input type="file" accept="image/*" onChange={(e) => setFiles(p => ({ ...p, profileImage: e.target.files?.[0] || null }))} />
                <p className="text-xs text-muted-foreground mt-1">A professional photo increases trust by up to 70%.</p>
              </div>
              <div className="space-y-2">
                <Label>Government ID Upload</Label>
                <Input type="file" accept="image/*,.pdf" onChange={(e) => setFiles(p => ({ ...p, idDocument: e.target.files?.[0] || null }))} />
                <p className="text-xs text-muted-foreground mt-1">We will securely verify your identity (Passport, Driver's License).</p>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Portfolio Link</Label>
                <Input name="portfolio" value={formData.portfolio} onChange={handleChange} placeholder="https://myportfolio.com" />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" />
              </div>
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/username" />
              </div>
              <div className="space-y-2">
                <Label>Personal Website</Label>
                <Input name="website" value={formData.website} onChange={handleChange} placeholder="https://mywebsite.com" />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(p => p - 1)} disabled={isLoading}>Back</Button>
          )}
          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {step === 5 ? "Complete Profile" : "Next Step"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
