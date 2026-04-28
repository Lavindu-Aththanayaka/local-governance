"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLogin = () => {
    setIsGenerating(true);
    // Simulate ZKP generation and backend verification
    setTimeout(() => {
      // Set dummy token and redirect
      localStorage.setItem("zk_proof", "dummy_zkp_token_123");
      router.push("/feed");
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4 py-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
          Authenticate<br />Securely
        </h1>
        <p className="text-slate-500 mb-8 px-2">
          No wallet needed. Verify your identity privately using GovID Simulator & ZKP.
        </p>

        {!isGenerating ? (
          <button
            onClick={handleLogin}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Shield className="h-5 w-5" />
            <span>Anonymous Login</span>
          </button>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-100 mt-4 animate-in fade-in zoom-in duration-300">
            <div className="relative flex items-center justify-center mb-4">
              <div className="absolute w-16 h-16 border-4 border-blue-100 rounded-full animate-spin border-t-blue-600" />
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                <Lock className="h-5 w-5" />
              </div>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Proof Generating...</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
              <p className="text-xs text-slate-500">Zero-Knowledge Protocol active</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center gap-4 text-xs font-medium text-slate-400">
        <div className="flex items-center gap-1">
          <Shield className="h-3.5 w-3.5" />
          <span>Institutional Grade</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <div className="flex items-center gap-1">
          <Lock className="h-3.5 w-3.5" />
          <span>Privacy Assured</span>
        </div>
      </div>
    </div>
  );
}
