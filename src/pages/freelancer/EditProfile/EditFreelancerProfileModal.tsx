// import React, { useState } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { freelancerService } from "@/lib/freelancer.service"
// import { useToast } from "@/components/ui/use-toast"
// import { Loader2, X, Upload } from "lucide-react"
// import { SkillSelector } from "@/components/common/SkillSelector"

// export function EditFreelancerProfileModal({
//   isOpen,
//   onClose,
//   onComplete,
//   profile
// }: {
//   isOpen: boolean,
//   onClose: () => void,
//   onComplete: () => void,
//   profile: any
// }) {
//   const [isLoading, setIsLoading] = useState(false)
//   const [activeTab, setActiveTab] = useState("personal")
//   const { toast } = useToast()

//   // State
//   const [formData, setFormData] = useState({
//     firstName: profile?.user?.firstName || "",
//     lastName: profile?.user?.lastName || "",
//     location: profile?.location || "",
//     preferredClientLocation: profile?.preferredClientLocation || "",
//     tagline: profile?.tagline || "",
//     hourlyRate: profile?.hourlyRate?.toString() || "",
//     bio: profile?.bio || "",
//     availability: profile?.availability || "AVAILABLE",
//     experienceLevel: profile?.experienceLevel || "ENTRY",
//     skills: profile?.skills?.map((s: any) => s.skill?.name || s.name) || [],
//     school: profile?.educations?.[0]?.school || "",
//     degree: profile?.educations?.[0]?.degree || "",
//     year: profile?.educations?.[0]?.year || "",
//     github: profile?.github || "",
//     linkedin: profile?.linkedin || "",
//     portfolio: profile?.portfolio || "",
//     website: profile?.website || "",
//     idDocumentUrl: profile?.user?.idDocumentUrl || null,
//     profileImage: profile?.user?.profileImage || null,
//   })

//   // We only hold files if they selected *new* files
//   const [files, setFiles] = useState<{ idDocument: File | null, profileImage: File | null }>({
//     idDocument: null, profileImage: null
//   })

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
//   }

//   const handleSave = async () => {
//     setIsLoading(true)
//     try {
//       // 1. Upload new files if selected
//       let finalIdDocUrl = formData.idDocumentUrl
//       let finalProfileImageUrl = formData.profileImage

//       if (files.idDocument || files.profileImage) {
//         const payload = new FormData()
//         if (files.idDocument) payload.append('idDocument', files.idDocument)
//         if (files.profileImage) payload.append('profileImage', files.profileImage)

//         const res = await freelancerService.uploadOnboardingFiles(payload)
//         if (res.data) {
//           if (res.data.idDocumentUrl) finalIdDocUrl = res.data.idDocumentUrl
//           if (res.data.profileImage) finalProfileImageUrl = res.data.profileImage
//         }
//       }

//       // 2. Patch Profile
//       const patchData = {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         location: formData.location,
//         preferredClientLocation: formData.preferredClientLocation,
//         tagline: formData.tagline,
//         hourlyRate: Number(formData.hourlyRate),
//         bio: formData.bio,
//         availability: formData.availability,
//         experienceLevel: formData.experienceLevel,
//         skills: formData.skills.map((s: string) => ({ name: s, level: 3 })),
//         education: (formData.school || formData.degree)
//           ? [{ school: formData.school, degree: formData.degree, year: formData.year }]
//           : [],
//         certifications: [], // Can implement similarly to education later
//         github: formData.github,
//         linkedin: formData.linkedin,
//         portfolio: formData.portfolio,
//         website: formData.website,
//         idDocumentUrl: finalIdDocUrl,
//         profileImage: finalProfileImageUrl
//       }

//       await freelancerService.updateFreelancerProfile(patchData)
//       toast({ title: "Profile Updated", description: "Your changes have been saved." })
//       onComplete()
//       onClose()
//     } catch (error) {
//       console.error("Update profile error", error)
//       toast({ variant: "destructive", title: "Error", description: "Failed to update profile." })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
//       <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col p-0 overflow-hidden">
//         <DialogHeader className="p-6 pb-2 border-b shrink-0">
//           <DialogTitle>Edit Profile</DialogTitle>
//           <DialogDescription>Update your professional information and portfolio.</DialogDescription>
//         </DialogHeader>

//         <div className="flex-1 overflow-y-auto p-6 scrollbar-hide shrink-0 h-full">
//           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//             <TabsList className="grid w-full grid-cols-4 mb-6">
//               <TabsTrigger value="personal">Personal</TabsTrigger>
//               <TabsTrigger value="professional">Professional</TabsTrigger>
//               <TabsTrigger value="skills">Skills/Edu</TabsTrigger>
//               <TabsTrigger value="files">Files/Links</TabsTrigger>
//             </TabsList>

//             <TabsContent value="personal" className="space-y-4 pb-20">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>First Name</Label>
//                   <Input name="firstName" value={formData.firstName} onChange={handleChange} />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Last Name</Label>
//                   <Input name="lastName" value={formData.lastName} onChange={handleChange} />
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <Label>Tagline (e.g., Senior Frontend Developer)</Label>
//                 <Input name="tagline" value={formData.tagline} onChange={handleChange} />
//               </div>
//               <div className="space-y-2">
//                 <Label>Country / Location</Label>
//                 <Input name="location" value={formData.location} onChange={handleChange} />
//               </div>
//               <div className="space-y-2">
//                 <Label>Preferred Client Location (Optional)</Label>
//                 <Input name="preferredClientLocation" value={formData.preferredClientLocation} onChange={handleChange} />
//               </div>
//             </TabsContent>

//             <TabsContent value="professional" className="space-y-4 pb-20">
//               <div className="space-y-2">
//                 <Label>Hourly Rate ($)</Label>
//                 <Input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} />
//               </div>
//               <div className="space-y-2">
//                 <Label>Professional Bio</Label>
//                 <Textarea name="bio" value={formData.bio} onChange={handleChange} className="h-32" />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Experience Level</Label>
//                   <Select onValueChange={(val) => setFormData(p => ({ ...p, experienceLevel: val }))} value={formData.experienceLevel}>
//                     <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="ENTRY">Entry Level</SelectItem>
//                       <SelectItem value="MID">Intermediate</SelectItem>
//                       <SelectItem value="SENIOR">Expert</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Availability</Label>
//                   <Select onValueChange={(val) => setFormData(p => ({ ...p, availability: val }))} value={formData.availability}>
//                     <SelectTrigger><SelectValue placeholder="Select Availability" /></SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="AVAILABLE">Available for Work</SelectItem>
//                       <SelectItem value="BUSY">Less than 30hrs/wk</SelectItem>
//                       <SelectItem value="UNAVAILABLE">Not Available</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             </TabsContent>

//             <TabsContent value="skills" className="space-y-4 pb-20">
//                <div className="space-y-2">
//                 <Label>Top Skills</Label>
//                 <SkillSelector
//                   selectedSkills={formData.skills}
//                   onChange={(newSkills) => setFormData(prev => ({ ...prev, skills: newSkills }))}
//                 />
//               </div>
//               <div className="pt-4 pb-2"><Label className="text-lg font-bold border-b pb-2 block">Education</Label></div>
//               <div className="space-y-2">
//                 <Label>School/University</Label>
//                 <Input name="school" value={formData.school} onChange={handleChange} />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Degree</Label>
//                   <Input name="degree" value={formData.degree} onChange={handleChange} />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Year of Graduation</Label>
//                   <Input name="year" value={formData.year} onChange={handleChange} />
//                 </div>
//               </div>
//             </TabsContent>

//             <TabsContent value="files" className="space-y-6 pb-20">
//               <div className="space-y-4">
//                 <Label className="text-lg font-bold border-b pb-2 block">Files</Label>
//                 <div className="space-y-2">
//                   <Label>Profile Picture</Label>
//                   {formData.profileImage ? (
//                     <div className="flex items-center gap-4 bg-muted p-3 rounded-md border">
//                       <span className="text-sm truncate max-w-[300px]">{formData.profileImage}</span>
//                       <Button variant="ghost" size="sm" className="text-destructive ml-auto" onClick={() => setFormData(p => ({ ...p, profileImage: null }))}><X className="w-4 h-4 mr-1"/> Remove</Button>
//                     </div>
//                   ) : (
//                     <div className="flex items-center gap-4">
//                       <Input type="file" accept="image/jpeg,image/png" onChange={(e) => setFiles(prev => ({ ...prev, profileImage: e.target.files?.[0] || null }))} />
//                     </div>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Govt ID Document</Label>
//                   {formData.idDocumentUrl ? (
//                     <div className="flex items-center gap-4 bg-muted p-3 rounded-md border">
//                       <span className="text-sm truncate max-w-[300px]">ID Uploaded & Verified</span>
//                       <Button variant="ghost" size="sm" className="text-destructive ml-auto" onClick={() => setFormData(p => ({ ...p, idDocumentUrl: null }))}><X className="w-4 h-4 mr-1"/> Remove</Button>
//                     </div>
//                   ) : (
//                     <div className="flex items-center gap-4">
//                       <Input type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setFiles(prev => ({ ...prev, idDocument: e.target.files?.[0] || null }))} />
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <Label className="text-lg font-bold border-b pb-2 block">Links</Label>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>GitHub URL</Label>
//                     <Input name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/..." />
//                   </div>
//                   <div className="space-y-2">
//                     <Label>LinkedIn URL</Label>
//                     <Input name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/..." />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>Portfolio Link</Label>
//                     <Input name="portfolio" value={formData.portfolio} onChange={handleChange} placeholder="https://dribbble.com/..." />
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Personal Website</Label>
//                     <Input name="website" value={formData.website} onChange={handleChange} placeholder="https://mysite.com" />
//                   </div>
//                 </div>
//               </div>
//             </TabsContent>
//           </Tabs>
//         </div>

//         <div className="p-6 border-t bg-muted/50 flex justify-end gap-3 mt-auto shrink-0 absolute bottom-0 w-full left-0 z-10 backdrop-blur-sm bg-background/80">
//           <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
//           <Button onClick={handleSave} disabled={isLoading} className="gap-2">
//             {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
//             Save Changes
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }
