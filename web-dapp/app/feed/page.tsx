"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import {
  ThumbsUp,
  Clock,
  CheckCircle2,
  Plus,
  MessageSquare,
  MoreHorizontal,
  ImageIcon,
  FileText,
  ChevronDown,
  Tent,
  Bike,
  Share2,
  Globe,
  Shield,
  RotateCw,
  AlertCircle
} from "lucide-react";

const FILTERS = ["All Issues", "Infrastructure", "Parks", "Safety"];
const SORT_OPTIONS = ["Most Recent", "Most Voted", "Oldest"];

// 1. ABI to fetch reports from Reporting.sol
const PUBLIC_REPORTING_ABI = [
  "function getAllReports(uint256 offset, uint256 limit) view returns (tuple(uint256 id, string ipfsCid, bytes32 reportHash, bytes32 submissionNullifier, bytes32 citizenPseudonym, address submittedByRelayer, uint8 status, uint256 createdAt, uint256 updatedAt, uint256 phaseDeadline, address assignedAuthority, tuple(uint256 validationUpvotes, uint256 validationDownvotes, uint256 verificationAcceptVotes, uint256 verificationRejectVotes, uint256 rejectionUpholdVotes, uint256 rejectionAppealVotes) votes)[] page, uint256 total)"
];

export interface PublicReport {
  id: string;
  ipfsCid: string;
  status: number;
  createdAt: number;
  upvotes: number;
  downvotes: number;
  // Enriched from IPFS after blockchain fetch
  description?: string;
  category?: string;
  location?: string;
  imageUrl?: string;  // base64 data URI of the first image
  ipfsLoaded?: boolean;
}

const IPFS_BASE_URL = process.env.NEXT_PUBLIC_IPFS_URL || "http://51.210.111.188:4000";

// Extract a raw CID from the on-chain value (strips ipfs:// prefix, takes first if comma-separated)
function extractCid(raw: string): string | null {
  if (!raw || raw === "ipfs://none") return null;
  const first = raw.split(',')[0].trim();
  return first.startsWith("ipfs://") ? first.slice(7) : first;
}

// Build an <img> src from IPFS image data (base64) or fall back to placeholder
function getImageSrc(report: PublicReport): string {
  if (report.imageUrl) return report.imageUrl;
  return "/map_placeholder.png";
}

// Parse the location field (may be a raw JSON string from LocationPicker)
// and return a short, human-friendly label.
// Input examples:
//   '{"lat":7.08,"lng":79.98,"address":"Jogging Path, Gampaha, ..., Sri Lanka"}'
//   "Colombo, Sri Lanka"
function formatLocation(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let address = raw;
  try {
    const parsed = JSON.parse(raw);
    address = parsed.address ?? raw;
  } catch {
    // already a plain string
  }
  // Shorten: keep first part + city/district + country (last part)
  const parts = address.split(",").map((s: string) => s.trim()).filter(Boolean);
  if (parts.length <= 2) return parts.join(", ");
  // Take first meaningful segment + the country (last segment)
  return `${parts[0]}, ${parts[parts.length - 1]}`;
}

// Fetch metadata for a single report from the IPFS service via local proxy
// (avoids CORS: browser → /api/ipfs/:cid → Next.js server → IPFS node)
async function fetchIpfsMetadata(report: PublicReport): Promise<Partial<PublicReport>> {
  const cid = extractCid(report.ipfsCid);
  if (!cid) return { ipfsLoaded: true };
  try {
    const res = await fetch(`/api/ipfs/${cid}`);
    if (!res.ok) return { ipfsLoaded: true };
    const data = await res.json();
    if (!data.success) return { ipfsLoaded: true };
    const firstImg = data.images?.[0];
    return {
      description: data.description ?? undefined,
      category: data.category ?? undefined,
      location: formatLocation(data.location),
      imageUrl: firstImg?.data
        ? `data:${firstImg.mimeType || "image/jpeg"};base64,${firstImg.data}`
        : undefined,
      ipfsLoaded: true,
    };
  } catch {
    return { ipfsLoaded: true };
  }
}

const getStatusDetails = (status: number) => {
  switch (status) {
    case 0: return { label: "Pending Validation", bg: "bg-amber-100", text: "text-amber-700", resolved: false };
    case 1: return { label: "Community Rejected", bg: "bg-red-100", text: "text-red-700", resolved: true };
    case 2: return { label: "Open", bg: "bg-blue-100", text: "text-blue-700", resolved: false };
    case 3: return { label: "In Progress", bg: "bg-indigo-100", text: "text-indigo-700", resolved: false };
    case 4: return { label: "Rejection Under Review", bg: "bg-orange-100", text: "text-orange-700", resolved: false };
    case 5: return { label: "Pending Verification", bg: "bg-purple-100", text: "text-purple-700", resolved: false };
    case 6: return { label: "Closed / Solved", bg: "bg-green-100", text: "text-green-700", resolved: true };
    case 7: return { label: "Reopened", bg: "bg-slate-100", text: "text-slate-700", resolved: false };
    default: return { label: "Unknown", bg: "bg-slate-100", text: "text-slate-700", resolved: false };
  }
};

const LIMIT = 20;

export default function FeedPage() {
  const [filter, setFilter] = useState("All Issues");
  const [sort, setSort] = useState("Most Recent");

  const [reports, setReports] = useState<PublicReport[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
      const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

      if (!CONTRACT_ADDRESS) {
        throw new Error("Smart contract address is not configured.");
      }

      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PUBLIC_REPORTING_ABI, provider);

      // Call getAllReports with current pagination offset (same as all-reports page)
      const [pageArray, totalReports] = await contract.getAllReports(offset, LIMIT);

      const baseReports: PublicReport[] = pageArray.map((r: any) => ({
        id: r.id.toString(),
        ipfsCid: r.ipfsCid,
        status: Number(r.status),
        createdAt: Number(r.createdAt) * 1000, // Convert EVM timestamp to ms
        upvotes: Number(r.votes.validationUpvotes),
        downvotes: Number(r.votes.validationDownvotes),
        ipfsLoaded: false,
      }));

      setTotalCount(Number(totalReports));
      // Show blockchain data immediately, then enrich with IPFS in parallel
      setReports(baseReports);

      // Fire all IPFS fetches concurrently, update state as they resolve
      const enriched = await Promise.all(
        baseReports.map(async (r) => ({ ...r, ...(await fetchIpfsMetadata(r)) }))
      );
      setReports(enriched);
    } catch (err: any) {
      console.error("Error fetching feed:", err);
      setError(err.message || "Failed to load reports from the blockchain.");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever offset changes (pagination)
  useEffect(() => {
    fetchPublicReports();
  }, [offset]);

  const featuredReport = reports.length > 0 ? reports[0] : null;
  const gridReports = reports.length > 1 ? reports.slice(1, 3) : [];
  const sidebarReports = reports.length > 3 ? reports.slice(3, 8) : [];
  const bottomGridReports = reports.length > 1 ? reports.slice(1) : [];

  return (
    <>
      {/* ─── MOBILE LAYOUT ─── */}
      <div className="md:hidden min-h-screen pb-24 relative">
        <div className="p-4 bg-slate-50">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Community Feed</h1>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-6">
          {loading && reports.length === 0 ? (
            <div className="py-24 text-center">
              <RotateCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-500 text-sm font-medium">Syncing public ledger...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Error Loading Feed</h4>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-900">No reports recorded yet</p>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featuredReport && (
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                  <div className="relative h-44 bg-slate-100">
                    <img
                      src={getImageSrc(featuredReport)}
                      alt={featuredReport.description || `Report ${featuredReport.id}`}
                      className="w-full h-full object-cover"
                    />
                    {!featuredReport.ipfsLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80">
                        <RotateCw className="h-5 w-5 animate-spin text-slate-400" />
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${getStatusDetails(featuredReport.status).bg} ${getStatusDetails(featuredReport.status).text}`}>
                      {getStatusDetails(featuredReport.status).label}
                    </span>
                    {featuredReport.category && (
                      <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-700">
                        {featuredReport.category}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-blue-600 font-semibold mb-1">🏛 {featuredReport.category || "CIVIC ISSUE"}</p>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Report #{featuredReport.id}</h2>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-1">
                      {featuredReport.description || "Metadata loading from IPFS..."}
                    </p>
                    {featuredReport.location && (
                      <p className="text-xs text-slate-400 mb-3">📍 {featuredReport.location}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                        <ThumbsUp className="h-4 w-4" /> {featuredReport.upvotes}
                      </span>
                      <Link href={`/issues/${featuredReport.id}`} className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-xs font-semibold">
                        View Detail
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Cards */}
              {bottomGridReports.map((issue) => (
                <div key={issue.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                  <div className="relative h-36 bg-slate-100">
                    <img src={getImageSrc(issue)} alt={issue.description || `Report ${issue.id}`} className="w-full h-full object-cover" />
                    {!issue.ipfsLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80">
                        <RotateCw className="h-4 w-4 animate-spin text-slate-400" />
                      </div>
                    )}
                    {issue.imageUrl && (
                      <div className="absolute top-2 right-2 w-7 h-7 bg-white/80 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-blue-600 font-semibold mb-1">{issue.category || "GENERAL"}</p>
                    <h2 className="text-base font-bold text-slate-900 mb-1">Report #{issue.id}</h2>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-1">
                      {issue.description || "Loading from IPFS..."}
                    </p>
                    {issue.location && (
                      <p className="text-xs text-slate-400 mb-2">📍 {issue.location}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                        <ThumbsUp className="h-4 w-4" /> {issue.upvotes}
                      </span>
                      <Link href={`/issues/${issue.id}`} className="flex items-center gap-1 text-sm font-semibold text-blue-600">
                        Detail →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Mobile Pagination */}
        {totalCount > LIMIT && (
          <div className="flex justify-center items-center gap-4 px-4 pb-6">
            <button
              className="px-5 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              disabled={offset === 0 || loading}
              onClick={() => setOffset((prev) => Math.max(0, prev - LIMIT))}
            >
              ← Previous
            </button>
            <span className="text-xs text-slate-500 font-medium">
              {offset + 1}–{Math.min(offset + LIMIT, totalCount)} of {totalCount}
            </span>
            <button
              className="px-5 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              disabled={offset + LIMIT >= totalCount || loading}
              onClick={() => setOffset((prev) => prev + LIMIT)}
            >
              Next →
            </button>
          </div>
        )}

        <Link
          href="/report"
          className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 hover:-translate-y-1 hover:shadow-xl transition-all z-40"
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>

      {/* ─── DESKTOP LAYOUT ─── */}
      <div className="hidden md:flex flex-col w-full">
        <div className="flex flex-col flex-1 px-8 pt-6 pb-0">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900">Community Feed</h1>
              {totalCount > 0 && (
                <p className="text-sm text-slate-500 mt-1">
                  Displaying {reports.length} of {totalCount} total reports on AuraChain
                </p>
              )}
            </div>
            <button onClick={fetchPublicReports} disabled={loading} className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors text-sm">
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Feed
            </button>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                    filter === f
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <span>SORT BY:</span>
              <div className="relative flex items-center gap-1 text-blue-600 cursor-pointer select-none">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none bg-transparent pr-5 font-bold text-blue-600 focus:outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown className="h-4 w-4 pointer-events-none absolute right-0" />
              </div>
            </div>
          </div>

          {loading && reports.length === 0 ? (
            <div className="py-32 text-center">
              <RotateCw className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Syncing public ledger...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-start gap-3">
              <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-lg">Error Loading Feed</h4>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <p className="text-xl font-medium text-slate-900">No reports recorded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_1fr_300px] gap-6 mb-8">
              {/* FEATURED CARD */}
              {featuredReport ? (
                <div className="col-span-2 row-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-row h-[380px]">
                  <div className="relative w-[44%] shrink-0 bg-slate-100">
                    <img
                      src={getImageSrc(featuredReport)}
                      alt={featuredReport.description || `Report ${featuredReport.id}`}
                      className="w-full h-full object-cover"
                    />
                    {!featuredReport.ipfsLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80">
                        <RotateCw className="h-6 w-6 animate-spin text-slate-400" />
                      </div>
                    )}
                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${getStatusDetails(featuredReport.status).bg} ${getStatusDetails(featuredReport.status).text}`}>
                      {getStatusDetails(featuredReport.status).label}
                    </span>
                  </div>
                  <div className="flex flex-col justify-between p-8 flex-1">
                    <div>
                      <p className="text-xs font-bold text-blue-600 mb-3 flex items-center gap-1.5">
                        🏛 {featuredReport.category || "CIVIC ISSUE"}
                      </p>
                      <h2 className="text-2xl font-extrabold text-slate-900 mb-3 leading-snug">
                        Report #{featuredReport.id}
                      </h2>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-4">
                        {featuredReport.description || "Fetching metadata from IPFS..."}
                      </p>
                      {featuredReport.location && (
                        <p className="text-xs text-slate-400 mt-2">📍 {featuredReport.location}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                        <ThumbsUp className="h-4 w-4" /> {featuredReport.upvotes}
                      </span>
                      <Link href={`/issues/${featuredReport.id}`} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-bold transition-colors shadow-sm">
                        View Detail
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="col-span-2 row-span-1 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
                  <p className="text-slate-400">No featured issue</p>
                </div>
              )}

              {/* SIDEBAR */}
              <div className="row-span-2 flex flex-col gap-4">
                {sidebarReports.map((card) => (
                  <div key={card.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusDetails(card.status).bg} ${getStatusDetails(card.status).text}`}>
                        {getStatusDetails(card.status).label}
                      </span>
                      {getStatusDetails(card.status).resolved ? (
                        <CheckCircle2 className="h-5 w-5 text-slate-400" />
                      ) : (
                        <MoreHorizontal className="h-5 w-5 text-slate-400 cursor-pointer" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1.5">
                        {card.category || "GENERAL"}
                      </p>
                      <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">Report #{card.id}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {card.description || (!card.ipfsLoaded ? "Loading..." : card.ipfsCid.slice(0, 28) + "...")}
                      </p>
                      {card.location && (
                        <p className="text-xs text-slate-400 mt-1">📍 {card.location}</p>
                      )}
                    </div>
                    <Link href={`/issues/${card.id}`} className="block w-full py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors text-center">
                      View Report
                    </Link>
                  </div>
                ))}

                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-5 flex flex-col items-center justify-center text-center gap-3 mt-auto">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 mb-1">Notice something?</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Your voice is the foundation of our community. Create a new issue report today.
                    </p>
                  </div>
                  <Link href="/report" className="text-blue-600 font-bold text-sm hover:text-blue-800 transition-colors">
                    Start Reporting
                  </Link>
                </div>
              </div>

              {/* BOTTOM GRID */}
              {gridReports.map((issue) => (
                <div key={issue.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                  <div className="relative h-44 shrink-0 bg-slate-100">
                    <img
                      src={getImageSrc(issue)}
                      alt={issue.description || `Report ${issue.id}`}
                      className="w-full h-full object-cover"
                    />
                    {!issue.ipfsLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80">
                        <RotateCw className="h-5 w-5 animate-spin text-slate-400" />
                      </div>
                    )}
                    {issue.imageUrl && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow">
                        <ImageIcon className="h-4 w-4 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Shield className="h-3 w-3" /> {issue.category || "GENERAL"}
                    </p>
                    <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">Report #{issue.id}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-1 line-clamp-3">
                      {issue.description || (!issue.ipfsLoaded ? "Loading from IPFS..." : "No description available.")}
                    </p>
                    {issue.location && (
                      <p className="text-xs text-slate-400 mb-3">📍 {issue.location}</p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                        <ThumbsUp className="h-4 w-4 text-blue-500" /> {issue.upvotes}
                      </span>
                      <Link href={`/issues/${issue.id}`} className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                        Detail <span className="text-base">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Desktop Pagination */}
          {totalCount > LIMIT && (
            <div className="flex justify-center items-center gap-4 pb-8">
              <button
                className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                disabled={offset === 0 || loading}
                onClick={() => setOffset((prev) => Math.max(0, prev - LIMIT))}
              >
                ← Previous
              </button>
              <span className="text-sm text-slate-500 font-medium">
                Showing {offset + 1}–{Math.min(offset + LIMIT, totalCount)} of {totalCount} reports
              </span>
              <button
                className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                disabled={offset + LIMIT >= totalCount || loading}
                onClick={() => setOffset((prev) => prev + LIMIT)}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-auto px-8 py-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-4">
            <span className="font-bold text-blue-600 text-base">AuraChain</span>
            <span>© 2024 AuraChain. Decentralized Governance for the People.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Whitepaper</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Support</Link>
            <div className="flex items-center gap-3 ml-2">
              <Share2 className="h-4 w-4 hover:text-slate-900 cursor-pointer transition-colors" />
              <Globe className="h-4 w-4 hover:text-slate-900 cursor-pointer transition-colors" />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
