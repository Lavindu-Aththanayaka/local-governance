"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitIssue } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Camera, MapPin, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function ReportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Infrastructure",
    description: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location) return;
    
    setIsSubmitting(true);
    try {
      await submitIssue(formData);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/issues");
      }, 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isSuccess) {
    return (
      <div className="container max-w-lg mx-auto py-24 px-4 h-[70vh] flex flex-col items-center justify-center animate-in zoom-in duration-500">
        <div className="bg-success/10 text-success rounded-full p-6 mb-6">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-center">Report Submitted Securely</h2>
        <p className="text-muted-foreground text-center mb-8">
          Your report has passed AI moderation and was successfully anchored to the blockchain. You will be redirected shortly.
        </p>
        <Button onClick={() => router.push("/issues")}>View All Issues</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Report a Civic Issue</h1>
        <p className="text-muted-foreground">
          Submit details about local infrastructure, safety, or sanitation problems. Your identity is fully decoupled and protected.
        </p>
      </div>

      <Card className="border-border shadow-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
            <CardDescription>
              Please provide as much context as possible. AI moderation will review content before it is recorded on the ledger.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Issue Title</label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Deep Pothole on 4th Avenue"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <select
                id="category"
                name="category"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Infrastructure">Infrastructure</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Traffic">Traffic</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  name="location"
                  placeholder="Street address or intersection"
                  className="pl-9"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Visual Evidence</label>
              <div className="border-2 border-dashed border-input rounded-lg p-6 flex flex-col items-center justify-center text-center bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer">
                <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-foreground font-medium">Click to upload image</span>
                <span className="text-xs text-muted-foreground mt-1">Images are stored off-chain via IPFS</span>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3 text-sm text-foreground">
              <AlertCircle className="h-5 w-5 text-primary shrink-0" />
              <p>
                By submitting this form, you agree to our community guidelines. Fake or malicious reports will be filtered by AI moderation.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6 bg-muted/10 rounded-b-xl">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
