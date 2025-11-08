# Mindchain AI

_web3bridge in house hackathon_  
Mindchain AI showcases how on-chain infrastructure can gate and augment AI experiences. Users can buy usage credits, submit knowledge, run real-time MNIST inference, and access hybrid LLM responses—all backed by Stylus smart contracts and modern AI tooling.

## Why it matters
- **Trustless metering:** Credits for AI usage are enforced on-chain, not by a centralized gateway.
- **Community knowledge:** Anyone can contribute mental-health or ML tips that get surfaced directly in the app.
- **Full-stack demo:** Stylus smart contracts, React frontend, Flask ML service, and a Gemini-backed chat API all play together.

## Usefulness & impact
- **Proof of decentralized AI access:** Shows investors and collaborators how Stylus contracts can meter model usage without handing trust to a third party.
- **Hackathon-ready demo:** Judges can mint credits, draw digits, and receive AI answers in minutes—perfect for showcasing technical breadth.
- **Community-driven intelligence:** Knowledge submissions are on-chain, making the chatbot’s guidance auditable and improvable by contributors.
- **Extensible wallet gating:** Any API (vision, speech, etc.) can plug into the same authorization contract, making the repo a boilerplate for future AI/Web3 integrations.
- **Educational value:** Serves as a reference for developers learning Stylus, ethers v6, Gemini/OpenAI integration, and cross-service orchestration in under 24 hours.

## Feature overview
- ✅ Stylus `purchase → balance → markUsage` flow for AI credits on Arbitrum Sepolia.
- ✅ Knowledge submission & voting contract with tuple ABI return.
- ✅ React experience with drawing canvas (MNIST), credit dashboard, knowledge feed, AI chat.
- ✅ Flask MNIST model hosting with TensorFlow `model.keras` weights.
- ✅ Gemini (and optional OpenAI) backed AI chat with on-chain credit enforcement.
- ✅ One-click hackathon demo script & troubleshooting tips.

## Architecture snapshot
```
mnist-draw (React) ──▶ Flask MNIST API (/mnist_api)
   │                 └▶ Stylus contracts (Arbitrum Sepolia)
   └──▶ GPT API (Node + Gemini/OpenAI) ─┘

Stylus contracts
├─ ApiAuthorization  → credit purchase & spend
└─ KnowledgeShare    → crowd-sourced knowledge base
```

## System components
| Layer | Technology | Responsibilities |
|-------|------------|------------------|
| Frontend | React 18, Vite, Tailwind, wagmi + ethers v6 | Wallet connect, credit purchase, knowledge UI, MNIST canvas, chat panel |
| Smart contracts | Rust + Stylus SDK | Credit ledger & knowledge registry, deployed to Arbitrum Sepolia |
| AI inference | Flask + TensorFlow | `POST /predict` endpoint serving MNIST classifier |
| AI chat | Node/Express, Gemini SDK, optional OpenAI SDK | Validates credits, generates responses, calls `markUsage` |
| Tooling | Cargo, npm, Python, MetaMask | Local development and contract deployment |

## Repository layout
| Path | Description |
|------|-------------|
| `contracts/api_authorization` | Stylus contract for purchase + credit accounting |
| `contracts/knowledge_share` | Stylus contract for collecting and voting on knowledge snippets |
| `mnist-draw/` | Vite + React frontend for purchase, knowledge share, MNIST drawing, AI chat |
| `mnist_api/` | Flask + TensorFlow service hosting the MNIST digit classifier |
| `gpt_api/` | Node/Express service calling Gemini/OpenAI with on-chain credit checks |
| `trainer/` | Scripts and model assets for training the MNIST classifier |

## Prerequisites
- Node.js 18+ and npm
- Python 3.12 with `pip` (installed via `python3 -m ensurepip --expand` if needed)
- Rust toolchain + Cargo with Stylus CLI (`cargo install cargo-stylus cargo-stylus-check`)
- MetaMask (or any wallet able to connect to Arbitrum Sepolia)
- Some Sepolia ETH for credit purchases and contract calls (get from faucet)

## Environment configuration
| File | Key | Purpose |
|------|-----|---------|
| `gpt_api/.env` | `GEMINI_API_KEY`, `OPENAI_API_KEY`, `RPC_URL`, `PRIVATE_KEY`, `PORT` | AI chat credentials & chain connection |
| `mnist-draw/src/utils/contracts.ts` | `AUTHORIZATION`, `KNOWLEDGE_PUBLISH`, `API_URL` | Contract addresses and ML API base URL |
| `mnist_api/` | uses `model.keras` | No envs required by default |

**Important:** never commit real API keys or private keys. `.gitignore` already excludes `.env` files.

## Quickstart
```bash
# 1. Start MNIST inference API
tmux new-session -d -s mnist-api "cd mnist_api && python3 app.py"

# 2. Start GPT chat API (Gemini only if OpenAI is absent)
tmux new-session -d -s gpt-api "cd gpt_api && npm run start"

# 3. Frontend
cd mnist-draw
npm install
npm run dev -- --host   # http://localhost:5173
```
Hit `Ctrl+C` or `tmux kill-session -t <name>` to stop each service.

## Smart contracts (Arbitrum Sepolia)
| Contract | Address | Highlights |
|----------|---------|------------|
| `ApiAuthorization` | `0x0b6ae13119fc3b61d6abb115342a1a075e14b6b6` | `purchase()`, `balanceOf()`, `markUsage()` |
| `KnowledgeShare` | `0xc947ef14370f74cce4d325ee4d83d9b4f3639da7` | `share()`, `getSubmittedKnowledge()`, `vote()` |

Both contracts are written in Rust via Stylus SDK. Deployment commands:
```bash
cargo stylus check --endpoint https://sepolia-rollup.arbitrum.io/rpc
cargo stylus deploy --endpoint ... --private-key-path <key>
```
Remember to run `setOwner()` once on `KnowledgeShare` after deployment.

## Frontend (mnist-draw)
```bash
cd mnist-draw
npm install
npm run dev -- --host    # http://localhost:5173
```
Features:
- **Wallet onboarding:** auto-switches MetaMask to Arbitrum Sepolia.
- **Purchase credits:** calls `purchase()` and updates balance.
- **Knowledge share:** submit + read tuples from `KnowledgeShare`.
- **MNIST inference:** draw digits, POST to the Flask service, display prediction.
- **AI Chat:** sends a prompt to the GPT API server and decrements on-chain credits.

Update the config in `src/utils/contracts.ts` whenever addresses change:
```ts
export const AUTHORIZATION = "0x0b6ae13119fc3b61d6abb115342a1a075e14b6b6";
export const KNOWLEDGE_PUBLISH = "0xc947ef14370f74cce4d325ee4d83d9b4f3639da7";
export const API_URL = "http://127.0.0.1:5000"; // Flask MNIST API
```

## MNIST prediction API
```bash
cd mnist_api
python3 app.py
```
- Loads `model.keras` and exposes `POST /predict` (28×28 JSON array in, digit out).
- Requires `tensorflow`, `flask`, `flask-cors` (already installed via pip `--user`).

## GPT API (Gemini / OpenAI bridge)
```bash
cd gpt_api
npm install
npm run start
```
`.env` sample:
```
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=                             # optional fallback
RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
PRIVATE_KEY=0x...
PORT=8000
```
- Checks `balanceOf(ethAddress)` before responding.
- Uses Gemini by default, falls back to OpenAI when configured.
- Calls `markUsage(ethAddress)` after each successful reply.

## Data & models
- **MNIST digits:** pre-trained CNN stored at `mnist_api/model.keras`. Training notebook lives in `trainer/` if you want to retrain.
- **Knowledge prompts:** curated by the community through the `KnowledgeShare` contract. Initial submissions can be seeded via script or manual UI forms.
- **AI chat prompt engineering:** currently generic but easily swapped with the mental health scaffolding from prior projects (see `gpt_api/src/main.js → generateResponse`).

## Testing & verification
- **Authorization smoke test:**
  ```bash
  cd contracts/api_authorization
  CARGO_TARGET_DIR=target-local \
  RPC_URL=https://sepolia-rollup.arbitrum.io/rpc \
  STYLUS_CONTRACT_ADDRESS=0x0b6ae13119fc3b61d6abb115342a1a075e14b6b6 \
  PRIV_KEY_PATH=/path/to/private/key \
  cargo run --example smoke
  ```
- **KnowledgeShare check:**
  ```bash
  cd contracts/knowledge_share
  cargo stylus check --endpoint https://sepolia-rollup.arbitrum.io/rpc
  ```
- **Frontend lint/build:** `npm run build`
- **Manual QA:** Use the quickstart flow to confirm credit purchase, knowledge submission, MNIST prediction, and chat credit deduction all succeed.

## Demo script (for judges)
1. Show contracts on Arbiscan at their addresses.
2. Connect wallet on frontend → auto-switch to Arbitrum Sepolia.
3. Purchase 1 credit with MetaMask.
4. Share a knowledge snippet and refresh list.
5. Draw digit “7” → `Predict` (MNIST API responds).
6. Ask the AI chat a simple mental health or ML question → receive Gemini answer, watch credits decrement.
7. Open `KnowledgeShare` contract events to show logs.

## Troubleshooting
| Issue | Fix |
|-------|-----|
| `MetaMask no network` | Reload after connecting; confirm Arbitrum Sepolia is approved |
| `purchase` reverts | Ensure wallet has ≥0.003 Sepolia ETH; check RPC URL |
| `GET /predict 405` | Use POST request; make sure Flask server is running |
| `Gemini 400 Invalid JSON payload` | Restart GPT API after latest code (uses string prompt) |
| `OpenAI model not found` | Either leave `OPENAI_API_KEY` empty or set `OPENAI_MODEL` to available model |
| `MNIST predictions always same digit` | Verify `model.keras` is present and input array shape is 28×28 |

## Hackathon achievements
- Working Stylus contracts deployed to Arbitrum Sepolia.
- Full-stack integration: React frontend, Rust contracts, Python and Node APIs.
- Demonstrates decentralized credit gating, community knowledge capture, and multi-model AI orchestration.

## Future enhancements
- Faucet or admin tooling for demo credits.
- Docker Compose to spin everything up in one command.
- Stream knowledge submissions as events from `LimitReached` log.
- Additional AI models (audio, image) gated by the same authorization contract.
- Integrate mental health prompt engineering module for production-ready empathetic responses.

## Team
Built by the Web3Bridge in-house hackathon team:
- Daniel Selaru
- Tyler Valyn Thor
- Tisca Catalin
- Mentors & contributors from The Real One AI community

---
Questions or improvements? Open an issue or DM the hackathon team. "THE REAL ONE AI" is always looking for contributors who believe decentralized AI should be beautiful—and on-chain. 💫
