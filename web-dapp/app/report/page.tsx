"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { AlertCircle, CheckCircle2, FileImage, Send, UploadCloud, X } from "lucide-react";
import { useCitizen } from "@/context/CitizenContext";
import Link from "next/link";

const CATEGORIES = [
  "Infrastructure Damage",
  "Public Safety",
  "Environmental Issue",
  "Road & Traffic",
  "Utilities Outage",
  "Illegal Activity",
  "Other",
];

const MAX_IMAGES = 5;
const MAX_DESC_LENGTH = 1000;

// Utility to convert File to WebP
const compressToWebP = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Optional: Resize large images here by scaling width/height
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
              const newFile = new File([blob], fileName, { type: "image/webp" });
              resolve(newFile);
            } else {
              reject(new Error("WebP conversion failed"));
            }
          },
          "image/webp",
          0.8 // 80% quality compression
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// Utility to hash file contents
const hashFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  return ethers.keccak256(uint8Array);
};

export default function ReportPage() {
  const router = useRouter();
  const { wallet, consumeTicket, availableTicketsCount } = useCitizen();

  const [category, setCategory] = useState("Infrastructure Damage");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);
    
    if (images.length + newFiles.length > MAX_IMAGES) {
      setStatusMessage({ type: "error", text: `You can only upload a maximum of ${MAX_IMAGES} images.` });
      return;
    }

    setIsProcessingImages(true);
    setStatusMessage(null);

    try {
      const convertedFiles = await Promise.all(newFiles.map(compressToWebP));
      setImages((prev) => [...prev, ...convertedFiles]);
    } catch (error) {
      console.error("Image processing error:", error);
      setStatusMessage({ type: "error", text: "Failed to process images. Please try different files." });
    } finally {
      setIsProcessingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!wallet) {
      setStatusMessage({ type: "error", text: "You must be logged in to submit a report." });
      return;
    }

    if (!description.trim() || description.length > MAX_DESC_LENGTH) {
      setStatusMessage({ type: "error", text: "Please provide a valid description within the character limit." });
      return;
    }

    setIsSubmitting(true);

    try {
      const currentTicket = consumeTicket();
      if (!currentTicket) {
        setStatusMessage({
          type: "error",
          text: "Security session expired (no tickets left). Please log in again.",
        });
        return;
      }

      // Step 1: Hash all WebP images
      const imageHashes = await Promise.all(images.map(hashFile));
      const combinedImageHashes = imageHashes.join(""); // Combine array into a single string for signing

      // Step 2: Sign Text + Ticket ID + Image Hashes
      const ethersWallet = new ethers.Wallet(wallet.privateKey);
      const messageHash = ethers.solidityPackedKeccak256(
        ["string", "string", "string"],
        [description, currentTicket.ticketId, combinedImageHashes]
      );
      const signature = await ethersWallet.signMessage(ethers.getBytes(messageHash));

      // Step 3: Prepare FormData
      const formData = new FormData();
      formData.append("description", description);
      formData.append("zkpTicketId", currentTicket.ticketId);
      formData.append("zkpSignature", currentTicket.signature);
      formData.append("citizenPubKey", wallet.publicKey);
      formData.append("signature", signature);
      // Pass the hashes to the backend so it can verify the files match the signature
      formData.append("imageHashes", JSON.stringify(imageHashes));

      images.forEach((img) => {
        formData.append("images", img); // Backend must look for an array field named "images"
      });

      // Fetch relayer URL from .env (fallback to relative if not set)
      const RELAYER_URL = process.env.NEXT_PUBLIC_RELAYER_URL || "";
      const endpoint = `${RELAYER_URL}/report`; // Or whatever your relayer route is

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to submit report to relayer.");
      }

      setStatusMessage({
        type: "success",
        text: `Report submitted successfully! You have ${availableTicketsCount - 1} anonymous submissions remaining.`,
      });

      // Reset form
      setDescription("");
      setImages([]);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Report an Issue</h2>
        <p className="text-slate-500 mb-6 text-sm">
          Your report will be analyzed by AI for moderation before being permanently recorded on the blockchain. Your identity remains 100% anonymous.
        </p>

        {statusMessage && (
          <div
            className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-sm font-medium ${
              statusMessage.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
            }`}
          >
            {statusMessage.type === "error" ? (
              <AlertCircle className="h-5 w-5 shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            )}
            <div className="space-y-2">
              <p>{statusMessage.text}</p>
              {statusMessage.type === "error" && statusMessage.text.includes("log in again") && (
                <button
                  type="button"
                  onClick={() => router.push("/auth")}
                  className="text-xs font-semibold text-red-700 underline"
                >
                  Go to login
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-semibold text-slate-700">Issue Description</label>
              <span className={`text-xs ${description.length >= MAX_DESC_LENGTH ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                {description.length} / {MAX_DESC_LENGTH}
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={MAX_DESC_LENGTH}
              placeholder="Describe the problem (e.g., Pothole on Main St, Broken streetlight...)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-semibold text-slate-700">Attach Photos (Optional)</label>
              <span className="text-xs text-slate-400">{images.length} / {MAX_IMAGES} uploaded</span>
            </div>
            
            <div
              className={`border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center transition-colors ${
                images.length >= MAX_IMAGES || isSubmitting ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-slate-50 hover:bg-slate-100 cursor-pointer'
              }`}
              onClick={() => {
                if (images.length < MAX_IMAGES && !isSubmitting && !isProcessingImages) fileInputRef.current?.click();
              }}
            >
              <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 font-medium">
                {isProcessingImages ? "Processing & Compressing..." : "Click to upload images"}
              </p>
              <p className="text-xs text-slate-400 mt-1">JPEG, PNG, or WEBP (Converted to optimized WebP)</p>
              
              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageChange}
                disabled={isSubmitting || images.length >= MAX_IMAGES || isProcessingImages}
              />
            </div>

            {/* Render Uploaded Image Badges */}
            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((img, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 py-1.5 pl-3 pr-2 rounded-lg border border-blue-100">
                    <FileImage className="h-4 w-4" />
                    <span className="font-medium truncate max-w-[120px] text-xs">{img.name}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={isSubmitting}
                      className="text-blue-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-colors ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Grid: 2 columns */}
          <div className="grid grid-cols-2 gap-6 px-8 pb-4 flex-1">
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              {/* Step 1 - Describe */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    1
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Describe the issue</h2>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    Report Category
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all cursor-pointer pr-10"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    Detailed Description
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Provide as much detail as possible for the governance council..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Step 2 - Add Proof */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    2
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Add Proof</h2>
                </div>

                <div
                  className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer mb-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-10 w-10 text-slate-400 mb-3" />
                  <p className="text-base font-semibold text-slate-700 mb-1">Upload Files</p>
                  <p className="text-xs text-slate-400 text-center leading-relaxed">
                    Drag and drop images,<br />videos or PDF documents.<br />(Max 50MB)
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/*,.pdf"
                    multiple
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Thumbnail previews */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {images.map((file, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Location */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    3
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Step 3: Location</h2>
                </div>
                <button type="button" className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold hover:text-blue-800 transition-colors">
                  <MapPin className="h-3.5 w-3.5" />
                  Auto-detect Location
                </button>
              </div>

              {/* Search bar */}
              <div className="px-6 pb-4">
                <div className="flex items-center gap-2 bg-slate-900 rounded-xl px-4 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input
                    type="text"
                    placeholder="Search address or pin location..."
                    className="flex-1 bg-transparent text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Map */}
              <div className="flex-1 relative mx-6 mb-6 rounded-xl overflow-hidden min-h-[320px]">
                <img
                  src="/map_placeholder.png"
                  alt="Location Map"
                  className="w-full h-full object-cover"
                />
                {/* Zoom controls */}
                <div className="absolute top-3 right-3 flex flex-col gap-1">
                  <button type="button" className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow text-slate-700 hover:bg-white transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                  <button type="button" className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow text-slate-700 hover:bg-white transition-colors">
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
                {/* Pin label */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                  <MapPin className="h-3 w-3" />
                  Issue Location
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isProcessingImages || !wallet}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Submit Securely</span>
              </>
            )}
          </button>

          <div className="text-center">
            <p className="text-xs font-medium text-slate-400">
              Available Anonymous Tickets: <span className="text-slate-700">{availableTicketsCount}</span>
            </p>
          </div>
        </form>

        {/* Footer */}
        <footer className="px-8 py-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-blue-600 text-base">AuraChain</span>
            <span>© 2024 AuraChain. Decentralized Governance for the People.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Whitepaper</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Support</Link>
            <div className="flex items-center gap-3 ml-4">
              <Share2 className="h-4 w-4 hover:text-slate-900 cursor-pointer transition-colors" />
              <Globe className="h-4 w-4 hover:text-slate-900 cursor-pointer transition-colors" />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
