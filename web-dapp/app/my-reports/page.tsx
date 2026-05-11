"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { useCitizen } from "@/context/CitizenContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Shield, AlertCircle, RotateCw, ArrowLeft } from "lucide-react";

// Minimal ABI for fetching reports directly from the Reporting smart contract
const REPORTING_ABI = [
  "function getReportsByCitizen(bytes32 pseudonym, uint256 offset, uint256 limit) view returns (tuple(uint256 id, string description, string category, uint8 status, uint256 timestamp)[] reports, uint256 total)"
];

interface FetchedReport {
  id: string;
  description: string;
  category: string;
  status: number;
  timestamp: number;
}

export default function MyReportsPage() {
  const { wallet } = useCitizen();
  const [pseudonym, setPseudonym] = useState<string | null>(null);
  const [reports, setReports] = useState<FetchedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCitizenReports = async () => {
    if (!wallet) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Instantiate an ethers wallet using the existing privateKey from context
      const ethersWallet = new ethers.Wallet(wallet.privateKey);
      const timestamp = Date.now();

      // Construct the challenge exactly as expected by CitizenAuthGuard
      // Note: wallet.publicKey holds the citizen's Ethereum address per walletUtils
      const challenge = `get-pseudonym:${wallet.publicKey}:${timestamp}`;
      const signature = await ethersWallet.signMessage(challenge);

      // 2. Fetch the bytes32 pseudonym securely from the relayer
      const RELAYER_URL = process.env.NEXT_PUBLIC_RELAYER_URL || "";
      const res = await fetch(`${RELAYER_URL}/report/my-pseudonym`, {
        headers: { 
          "Authorization": `${wallet.publicKey}:${timestamp}:${signature}` 
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to authenticate and retrieve pseudonym.");
      }

      const data = await res.json();
      const resolvedPseudonym = data.pseudonym;
      setPseudonym(resolvedPseudonym);

      // 3. Query the blockchain smart contract directly using the pseudonym
      const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
      const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

      if (!CONTRACT_ADDRESS) {
        throw new Error("Smart contract address is not configured in environment variables.");
      }

      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, REPORTING_ABI, provider);

      const [reportsArray] = await contract.getReportsByCitizen(resolvedPseudonym, 0, 50);

      const formattedReports: FetchedReport[] = reportsArray.map((r: any) => ({
        id: r.id.toString(),
        description: r.description,
        category: r.category,
        status: Number(r.status),
        timestamp: Number(r.timestamp) * 1000, // Convert EVM seconds to JS milliseconds
      }));

      // Reverse to display the most recently submitted reports at the top
      setReports(formattedReports.reverse());
    } catch (err: any) {
      console.error("Error retrieving reports:", err);
      setError(err.message || "An unexpected error occurred while loading your reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizenReports();
  }, [wallet]);

    const getStatusBadge = (status: number) => {
        switch (status) {
        case 0: return <Badge variant="outline">Pending Validation</Badge>;
        case 1: return <Badge variant="destructive">Rejected by Community</Badge>;
        case 2: return <Badge variant="secondary">Open</Badge>;
        case 3: return <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">In Progress</Badge>;
        case 4: return <Badge variant="outline">Rejection Under Review</Badge>;
        case 5: return <Badge variant="secondary">Pending Verification</Badge>;
        case 6: return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Closed / Solved</Badge>;
        case 7: return <Badge variant="outline">Reopened</Badge>;
        default: return <Badge variant="outline">Unknown</Badge>;
        }
    };

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-primary/5 p-6 rounded-2xl border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-full text-primary">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Secure Reports</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {pseudonym 
                ? `Pseudonym ID: ${pseudonym.slice(0, 10)}...${pseudonym.slice(-8)}`
                : "Authenticating zero-knowledge pseudonym session..."}
            </p>
          </div>
        </div>
        <Link href="/report">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Reporting
          </Button>
        </Link>
      </div>

      {/* Main Status & Feed Area */}
      {!wallet ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed shadow-sm p-8">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Wallet Disconnected</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Please log in with your citizen seed phrase to access your anonymous reports.
          </p>
          <Link href="/auth">
            <Button>Go to Login</Button>
          </Link>
        </div>
      ) : loading ? (
        <div className="py-24 text-center">
          <RotateCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-medium text-sm">
            Verifying cryptographic challenge & querying the AuraChain network...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <h4 className="font-bold text-sm">Failed to load reports</h4>
            <p className="text-xs leading-relaxed text-red-700">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 border-red-200 text-red-600 hover:bg-red-100"
              onClick={fetchCitizenReports}
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed shadow-sm">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-lg font-medium text-foreground">No reports found</p>
          <p className="text-muted-foreground text-sm mt-1">
            You haven't submitted any civic issues under this wallet pseudonym yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="border shadow-sm hover:shadow transition-shadow bg-card">
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                    Report #{report.id}
                  </span>
                  <CardTitle className="text-base font-bold mt-2">
                    {report.category || "General Issue"}
                  </CardTitle>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(report.status)}
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(report.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {report.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}