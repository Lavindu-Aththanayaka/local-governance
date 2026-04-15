import { ethers } from "ethers";

async function main() {
    console.log("Connecting to local Hardhat node...");
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const deployer = new ethers.Wallet(privateKey, provider);

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const minimalAbi = [
        "function RELAYER_ROLE() view returns (bytes32)",
        "function hasRole(bytes32 role, address account) view returns (bool)",
        "function grantRole(bytes32 role, address account) external",
        "function createReport(string _ipfsCID, bytes32 _submissionNullifier) external"
    ];

    const contract = new ethers.Contract(contractAddress, minimalAbi, deployer);

    console.log("1. Checking permissions...");

    const RELAYER_ROLE = await contract.RELAYER_ROLE();
    const alreadyHasRole = await contract.hasRole(RELAYER_ROLE, deployer.address);

    // The addresses for Hardhat Accounts 1, 2, and 3
    const oracleAddresses = [
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
    ];

    console.log("Authorizing the 3 Oracle Nodes...");
    for (const address of oracleAddresses) {
        const hasRole = await contract.hasRole(RELAYER_ROLE, address);
        if (!hasRole) {
            // Fetch fresh nonce before each grant
            let currentNonce = await provider.getTransactionCount(deployer.address);
            const tx = await contract.grantRole(RELAYER_ROLE, address, { nonce: currentNonce });
            await tx.wait();
            console.log(`Granted access to ${address}`);
        }
    }

    if (!alreadyHasRole) {
        console.log("   Granting RELAYER_ROLE to deployer...");
        let currentNonce = await provider.getTransactionCount(deployer.address);
        const grantTx = await contract.grantRole(RELAYER_ROLE, deployer.address, { nonce: currentNonce });
        await grantTx.wait();
    } else {
        console.log("   Deployer already has RELAYER_ROLE. Skipping grant.");
    }

    console.log("2. Submitting a test report to the blockchain...");
    const fakeIpfsCID = "QmFakeIpfsHashForTesting123";
    const fakeNullifier = ethers.id("test-nullifier-" + Date.now());

    // FIX: Fetch the absolute latest nonce right before the final transaction
    let finalNonce = await provider.getTransactionCount(deployer.address);
    const tx = await contract.createReport(fakeIpfsCID, fakeNullifier, { nonce: finalNonce });
    await tx.wait();

    console.log("✅ Transaction confirmed! Look at your oracle.py terminals now.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});