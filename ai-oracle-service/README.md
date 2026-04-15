# AI Oracle Service

Python service layer for the Local Governance Platform's AI-assisted moderation flow. This package contains:

- A small FastAPI app for text moderation over HTTP
- Oracle worker scripts that listen for `ReportCreated` events on the `Reporting` smart contract
- Per-oracle voting logic that submits validation votes back on-chain

## What It Does

When a new report is created on-chain, the oracle workers poll for the `ReportCreated` event, analyze the report text, and submit a vote to `voteOnReport(...)` during the validation phase.

The repository currently includes four Python entry points:

- `main.py`: FastAPI app with `POST /moderate/text`
- `oracle.py`: basic keyword-based moderation oracle
- `oracle_gov.py`: government oracle using `unitary/toxic-bert`
- `oracle_ngo.py`: NGO oracle using NLTK VADER sentiment analysis
- `oracle_intl.py`: international oracle using `cardiffnlp/twitter-roberta-base-hate`

## Prerequisites

- Python 3.10+
- A running local EVM node, typically Hardhat at `http://127.0.0.1:8545`
- The `Reporting` contract deployed locally
- Private keys for the oracle accounts that will submit votes

## Installation

From the repository root:

```bash
cd ai-oracle-service
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn web3 transformers torch nltk python-dotenv
```

Notes:

- `transformers` models are downloaded the first time the ML-backed oracle scripts run.
- `oracle_ngo.py` downloads the VADER lexicon on first startup.

## Configuration

Create `ai-oracle-service/.env` with the variables below:

```env
ORACLE_RPC_URL=http://127.0.0.1:8545
ORACLE_CONTRACT_ADDRESS=0xYourReportingContractAddress
ORACLE_ABI_PATH=/absolute/path/to/smart-contracts/artifacts/contracts/Reporting.sol/Reporting.json

ORACLE_PRIVATE_KEY=0x...
ORACLE_GOV_PRIVATE_KEY=0x...
ORACLE_NGO_PRIVATE_KEY=0x...
ORACLE_INTL_PRIVATE_KEY=0x...
```

Variable reference:

- `ORACLE_RPC_URL`: JSON-RPC endpoint for the local chain. Defaults to `http://127.0.0.1:8545`
- `ORACLE_CONTRACT_ADDRESS`: deployed `Reporting` contract address. Required
- `ORACLE_ABI_PATH`: path to the contract artifact JSON containing the ABI. If omitted, the service defaults to `../smart-contracts/artifacts/contracts/Reporting.sol/Reporting.json`
- `ORACLE_PRIVATE_KEY`: required for `oracle.py`
- `ORACLE_GOV_PRIVATE_KEY`: required for `oracle_gov.py`
- `ORACLE_NGO_PRIVATE_KEY`: required for `oracle_ngo.py`
- `ORACLE_INTL_PRIVATE_KEY`: required for `oracle_intl.py`

The config loader reads `ai-oracle-service/.env` automatically. If `python-dotenv` is installed it uses that, otherwise it falls back to a small local parser.

## Running The HTTP API

Start the FastAPI moderation service:

```bash
cd ai-oracle-service
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

Test it with:

```bash
curl -X POST http://127.0.0.1:8000/moderate/text \
  -H "Content-Type: application/json" \
  -d '{"report_id":"demo-1","text":"This looks like a scam and spam post"}'
```

Example response:

```json
{
  "report_id": "demo-1",
  "trust_score": 10,
  "is_spam": true
}
```

## Running The Oracle Workers

Each oracle worker should run in its own terminal:

```bash
cd ai-oracle-service
source venv/bin/activate
python oracle_gov.py
```

```bash
cd ai-oracle-service
source venv/bin/activate
python oracle_ngo.py
```

```bash
cd ai-oracle-service
source venv/bin/activate
python oracle_intl.py
```

Optional simple oracle:

```bash
cd ai-oracle-service
source venv/bin/activate
python oracle.py
```

What happens at runtime:

- The worker connects to the configured RPC endpoint
- It loads the `Reporting` contract ABI and address
- It creates a filter for `ReportCreated`
- For each new event, it runs its local text analysis function
- It submits `voteOnReport(reportId, voteDirection, nullifier, 0)`

## Local End-To-End Flow

1. Start the local blockchain:

```bash
cd smart-contracts
npx hardhat node
```

2. Deploy the `Reporting` contract:

```bash
cd smart-contracts
npx hardhat ignition deploy ignition/modules/Reporting.ts --network localhost
```

3. Update `ai-oracle-service/.env` with the deployed contract address if it changed.

4. Start the oracle workers in separate terminals.

5. Trigger a test report:

```bash
cd smart-contracts
npx tsx scripts/test-trigger.ts
```

The trigger script:

- loads `../ai-oracle-service/.env`
- checks the deployed contract exists at `ORACLE_CONTRACT_ADDRESS`
- grants `RELAYER_ROLE` to the configured oracle wallets if needed
- submits a test report to emit `ReportCreated`

After that, the oracle terminals should detect the event and submit their votes.

## Current Limitations

- The workers do not fetch real report text from IPFS yet; they currently analyze hardcoded sample text
- Event listening uses polling with `create_filter(... from_block="latest")` and a `2` second sleep loop
- There is no pinned `requirements.txt` or `pyproject.toml` yet
- Model-backed workers may take time to start because they download models on first run

## Troubleshooting

- `Missing required environment variable`: add the missing key to `ai-oracle-service/.env`
- `No contract code found at ...`: redeploy the contract and update `ORACLE_CONTRACT_ADDRESS`
- Transaction submission failures: make sure the oracle wallet has funds on the local chain and the account has the required contract role
- Slow first startup: expected for `transformers` models and the NLTK lexicon download

## Related Files

- [main.py](/home/nostoc/dev/local-governance/ai-oracle-service/main.py)
- [config.py](/home/nostoc/dev/local-governance/ai-oracle-service/config.py)
- [oracle.py](/home/nostoc/dev/local-governance/ai-oracle-service/oracle.py)
- [oracle_gov.py](/home/nostoc/dev/local-governance/ai-oracle-service/oracle_gov.py)
- [oracle_ngo.py](/home/nostoc/dev/local-governance/ai-oracle-service/oracle_ngo.py)
- [oracle_intl.py](/home/nostoc/dev/local-governance/ai-oracle-service/oracle_intl.py)
- [test-trigger.ts](/home/nostoc/dev/local-governance/smart-contracts/scripts/test-trigger.ts)
