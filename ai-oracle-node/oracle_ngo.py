import json
import time
from web3 import Web3
from main import analyze_text  # Import your AI logic from the previous step
import uuid

# --- CONFIGURATION ---
# 1. Paste the Contract Address you copied from Step 1
CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

# 2. Hardhat Account #0 Private Key (from the terminal where your node is running)
# We use this to sign the transaction.
PRIVATE_KEY = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"

# 3. Path to your compiled ABI file
ABI_PATH = "../smart-contracts/artifacts/contracts/Reporting.sol/Reporting.json"
# ---------------------

# Connect to local Hardhat node
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
account = w3.eth.account.from_key(PRIVATE_KEY)
w3.eth.default_account = account.address

print(f"Connected to Hardhat: {w3.is_connected()}")
print(f"Oracle Wallet Address: {account.address}")

# Load Contract ABI
with open(ABI_PATH, "r") as file:
    contract_json = json.load(file)
    contract_abi = contract_json["abi"]

contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=contract_abi)


def handle_new_report(event):
    report_id = event["args"]["reportId"]
    ipfs_cid = event["args"]["ipfsCID"]
    print(f"\n[!] New Report Detected! ID: {report_id} | CID: {ipfs_cid}")

    # In a real scenario, you'd fetch the text from IPFS using the CID.
    # For now, we will simulate the text to test the pipeline.
    simulated_text = "The road on 5th avenue has a massive pothole that needs fixing."
    print(f"[*] Analyzing text: '{simulated_text}'")

    # Run AI Moderation
    result = analyze_text(simulated_text)
    print(
        f"[*] AI Result: Trust Score: {result['trust_score']}, Spam: {result['is_spam']}"
    )

    # Determine Vote (True = Valid, False = Spam)
    vote_direction = not result["is_spam"]

    # Submit Vote to Blockchain
    submit_vote(report_id, vote_direction)


def submit_vote(report_id, vote_direction):
    print(f"[*] Submitting vote: {vote_direction} for Report {report_id}...")

    # Generate a completely unique bytes32 nullifier for this specific vote
    unique_nullifier = w3.keccak(text=str(uuid.uuid4()))

    try:
        tx = contract.functions.voteOnReport(
            report_id, vote_direction, unique_nullifier, 0  # VotingPhase.Validation
        ).build_transaction(
            {
                "from": account.address,
                "nonce": w3.eth.get_transaction_count(account.address),
            }
        )

        signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        print(f"[SUCCESS] Vote submitted! TX Hash: {tx_hash.hex()}")
    except Exception as e:
        print(f"[ERROR] Failed to submit vote: {e}")


# Polling loop to listen for events
print("Listening for ReportCreated events...")
event_filter = contract.events.ReportCreated.create_filter(from_block="latest")

while True:
    for event in event_filter.get_new_entries():
        handle_new_report(event)
    time.sleep(2)  # check every 2 seconds
