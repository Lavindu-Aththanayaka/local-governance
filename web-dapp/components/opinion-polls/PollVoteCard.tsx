'use client';
import axios from 'axios';
import { ethers } from 'ethers';

interface PollProps {
    pollId: number;
    title: string;
    description: string;
    options: string[];
}

export default function PollCard({ pollId, title, description, options }: PollProps) {

    const handleVote = async (optionIndex: number) => {
        try {
            // Simulate retrieving the citizen's secure seed/secret context from local state
            const citizenSecret = localStorage.getItem('citizen_secret_seed') || "0xsecret...";

            // Compute deterministic nullifier: H(Secret Seed + Poll ID)
            const rawNullifier = ethers.solidityPackedKeccak256(
                ['bytes32', 'uint256'],
                [citizenSecret, pollId]
            );

            // Post secure payload payload matching CastVoteDto to the relayer
            const response = await axios.post('http://localhost:4000/polling/vote', {
                pollId,
                optionIndex,
                nullifier: rawNullifier
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } // Handled via CitizenAuthGuard
            });

            if (response.data.success) {
                alert('Vote registered successfully without exposing wallet address!');
            }
        } catch (err: any) {
            alert(`Voting rejected: ${err.response?.data?.message || err.message}`);
        }
    };

    return (
        <div className="border p-6 rounded-lg bg-gray-900 text-white space-y-4 w-full max-w-md mx-auto">
            <h3 className="text-xl font-bold border-b border-gray-800 pb-2 text-green-400">{title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
            <div className="flex flex-col space-y-2 pt-2">
                {options.map((opt, idx) => (
                    <button key={idx} onClick={() => handleVote(idx)} className="bg-gray-800 hover:bg-green-600 hover:text-black p-3 rounded font-medium text-left transition-all duration-200">
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}