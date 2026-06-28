'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { OpinionPollingABI } from '@/lib/contracts/abis';
import {useAdmin} from "@/context/AdminContext";
import { useRouter } from 'next/navigation';

// Ensure this matches your local deployment address
const POLLING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_POLLING_CONTRACT_ADDRESS || "";
const RELAYER_URL = process.env.NEXT_PUBLIC_RELAYER_URL || "";
const RELAYER_API_URL = `${RELAYER_URL}/polling/authorize-official`;

if (!POLLING_CONTRACT_ADDRESS || POLLING_CONTRACT_ADDRESS === "") {
    console.error("CRITICAL: POLLING_CONTRACT_ADDRESS is missing in .env.local!");
} else {
    console.log("Using Contract Address:", POLLING_CONTRACT_ADDRESS);
}

export default function CreatePollPage() {
    const { isAuthority, isConnecting } = useAdmin();
    const router = useRouter();

    useEffect(() => {
        if (!isConnecting && !isAuthority) {
            // Redirect unauthorized users to dashboard
            router.push('/admin');
        }
    }, [isAuthority, isConnecting, router]);

    if (isConnecting || !isAuthority) {
        return <div className="container mx-auto p-12 text-center">Loading authentication...</div>;
    }

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ticketId, setTicketId] = useState('0');
    const [status, setStatus] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCreatePoll = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setStatus('Requesting AI moderation and oracle signature...');

        try {
            // 1. Fetch the EIP-712 Signature from the NestJS Backend
            const response = await fetch(RELAYER_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    ticketId: parseInt(ticketId, 10)
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'AI Moderation rejected the poll content.');
            }

            const { contentHash, deadline, ticketId: processedTicketId, signature } = result.data;
            setStatus('Oracle signature received. Please confirm the transaction in MetaMask.');

            // 2. Connect to MetaMask
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed.');
            }

            const provider = new ethers.BrowserProvider(window.ethereum as any);
            const signer = await provider.getSigner();
            console.log("DEBUG: Raw address value:", process.env.NEXT_PUBLIC_POLLING_CONTRACT_ADDRESS);
            const pollingContract = new ethers.Contract(
                ethers.getAddress(POLLING_CONTRACT_ADDRESS),
                OpinionPollingABI,
                signer
            );

            // 3. Execute On-Chain Transaction
            const tx = await pollingContract.createOfficialPoll(
                contentHash,
                deadline,
                processedTicketId,
                signature
            );

            setStatus('Transaction submitted to the blockchain. Waiting for confirmation...');
            await tx.wait();

            setStatus('✅ Official Poll successfully created on the blockchain!');

            setTitle('');
            setDescription('');
            setTicketId('0');

        } catch (error: any) {
            console.error(error);
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-2xl mt-12">
            <Card className="p-6 shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Draft Official Opinion Poll</h1>

                <form onSubmit={handleCreatePoll} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Poll Title</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="e.g., Budget Allocation for New Park"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
                        <textarea
                            className="w-full flex min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="Provide detailed context for the citizens..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Linked Issue Ticket ID (Optional)</label>
                        <Input
                            type="number"
                            value={ticketId}
                            onChange={(e) => setTicketId(e.target.value)}
                            min="0"
                            className="w-full"
                        />
                        <span className="text-xs text-gray-500">Leave as 0 if this poll is not tied to a specific citizen report.</span>
                    </div>

                    <Button type="submit" disabled={isProcessing} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                        {isProcessing ? 'Processing Transaction...' : 'Publish Poll'}
                    </Button>

                    {status && (
                        <div className={`p-4 mt-4 text-sm rounded border ${status.includes('❌') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {status}
                        </div>
                    )}
                </form>
            </Card>
        </div>
    );
}