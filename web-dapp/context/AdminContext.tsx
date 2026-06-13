"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { AuthorityMultiSigABI } from "@/lib/contracts/abis";

// The local deployed address of your MultiSig contract
export const MULTISIG_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

interface AdminContextType {
  account: string | null;
  isSuperAdmin: boolean;
  isConnecting: boolean;
  provider: ethers.BrowserProvider | null;
  contract: ethers.Contract | null;
  connectWallet: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
  account: null,
  isSuperAdmin: false,
  isConnecting: false,
  provider: null,
  contract: null,
  connectWallet: async () => {},
});

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const checkAdminStatus = async (userAddress: string, multiSigContract: ethers.Contract) => {
    try {
      const status = await multiSigContract.isSuperAdmin(userAddress);
      setIsSuperAdmin(status);
    } catch (error) {
      console.error("Error checking super admin status", error);
      setIsSuperAdmin(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      setIsConnecting(true);
      try {
        // Automatically request MetaMask to switch to the Localhost network (Chain ID: 31337 or 0x7a69 in hex)
        const chainIdHex = "0x7a69";
        try {
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainIdHex }],
          });
        } catch (switchError: any) {
          // If the network doesn't exist (error code 4902), add it automatically!
          if (switchError.code === 4902) {
            await (window as any).ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: chainIdHex,
                  chainName: 'Hardhat Localhost',
                  rpcUrls: ['http://127.0.0.1:8545/'],
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                },
              ],
            });
          }
        }

        const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await browserProvider.send("eth_requestAccounts", []);
        const signer = await browserProvider.getSigner();
        
        const multiSigContract = new ethers.Contract(MULTISIG_ADDRESS, AuthorityMultiSigABI, signer);
        
        setProvider(browserProvider);
        setAccount(accounts[0]);
        setContract(multiSigContract);

        await checkAdminStatus(accounts[0], multiSigContract);
      } catch (error) {
        console.error("User denied account access or error occurred", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("MetaMask is not installed!");
    }
  };

  // Optional: Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          connectWallet(); // Reconnect to verify new account
        } else {
          setAccount(null);
          setIsSuperAdmin(false);
          setContract(null);
        }
      });
    }
  }, []);

  return (
    <AdminContext.Provider
      value={{
        account,
        isSuperAdmin,
        isConnecting,
        provider,
        contract,
        connectWallet,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
