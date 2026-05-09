"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import {
  AlertCircle,
  CheckCircle2,
  FileImage,
  Send,
  UploadCloud,
  Shield,
  MapPin,
  X,
  ChevronDown,
  Plus,
  Minus,
  Share2,
  Globe,
} from "lucide-react";
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

export default function ReportPage() {
  const router = useRouter();
  const { wallet, consumeTicket, availableTicketsCount } = useCitizen();

  const [category, setCategory] = useState("Infrastructure Damage");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
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

    if (!description.trim()) {
      setStatusMessage({ type: "error", text: "Please provide a description of the issue." });
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

      const ethersWallet = new ethers.Wallet(wallet.privateKey);
      const messageHash = ethers.solidityPackedKeccak256(
        ["string", "string"],
        [description, currentTicket.ticketId]
      );
      const signature = await ethersWallet.signMessage(ethers.getBytes(messageHash));

      const formData = new FormData();
      formData.append("description", description);
      if (images[0]) {
        formData.append("image", images[0]);
      }
      formData.append("zkpTicketId", currentTicket.ticketId);
      formData.append("zkpSignature", currentTicket.signature);
      formData.append("citizenPubKey", wallet.publicKey);
      formData.append("signature", signature);

      const response = await fetch("https://relayer.internalbuildtools.online/report", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit report to relayer.");
      }

      setStatusMessage({
        type: "success",
        text: `Report submitted successfully! You have ${availableTicketsCount - 1} anonymous submissions remaining.`,
      });

      setDescription("");
      setImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ─── MOBILE LAYOUT ─── */}
      <div className="md:hidden max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Report an Issue</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Your report will be analyzed by AI for moderation before being permanently recorded on
            the blockchain. Your identity remains 100% anonymous.
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
                {statusMessage.type === "error" &&
                  statusMessage.text.includes("log in again") && (
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">Issue Description</label>
              <textarea
                rows={4}
                placeholder="Describe the problem (e.g., Pothole on Main St, Broken streetlight...)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Attach Photo (Optional)</label>
              <div
                className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600 font-medium">Click to upload image</p>
                <p className="text-xs text-slate-400 mt-1">JPEG, PNG, or WEBP</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
              </div>
              {images.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 py-2 px-3 rounded-lg w-max">
                  <FileImage className="h-4 w-4" />
                  <span className="font-medium truncate max-w-[200px]">{images[0].name}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !wallet}
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
        </div>
      </div>

      {/* ─── DESKTOP LAYOUT ─── */}
      <div className="hidden md:flex flex-col w-full">
        <form onSubmit={handleSubmit} className="flex flex-col w-full">
          {/* Page Header */}
          <div className="px-8 pt-6 pb-4">
            <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight mb-1">
              Create New Report
            </h1>
            <p className="text-slate-500 text-sm">
              Submit a secure, decentralized civic report. Your identity remains protected by AuraChain protocol.
            </p>
          </div>

          {statusMessage && (
            <div
              className={`mx-8 mb-4 p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${
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

          {/* Bottom Action Bar */}
          <div className="sticky bottom-0 bg-white border-t border-slate-100 px-8 py-4 flex items-center justify-between gap-4 shadow-[0_-4px_20px_rgb(0,0,0,0.04)]">
            <div className="flex items-start gap-3 text-slate-500 text-xs leading-relaxed max-w-md">
              <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <span>
                By submitting, your report will be encrypted using Zero-Knowledge Proofs. Only the final data is public, your wallet and IP are never stored.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                className="py-3 px-6 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
              >
                Save<br />Draft
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !wallet}
                className="py-3 px-8 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2 text-sm"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Submit Anonymously
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
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

