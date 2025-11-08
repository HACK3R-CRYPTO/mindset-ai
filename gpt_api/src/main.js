import express from 'express';
import { JsonRpcProvider, Wallet, isAddress, Contract } from 'ethers';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const {
  GEMINI_API_KEY,
  GEMINI_MODEL = 'gemini-2.0-flash',
  OPENAI_API_KEY,
  OPENAI_MODEL = 'gpt-4o-mini',
  PRIVATE_KEY,
  RPC_URL,
  PORT,
  ALLOWED_ORIGIN,
} = process.env;

const looksLikePlaceholder = (value) =>
  !value || /your[_-]?api[_-]?key/i.test(value);

const hasGeminiKey = !looksLikePlaceholder(GEMINI_API_KEY);
const hasOpenAIKey = !looksLikePlaceholder(OPENAI_API_KEY);

if (!PRIVATE_KEY || !RPC_URL) {
  console.error('Error: Missing PRIVATE_KEY or RPC_URL environment variables.');
  process.exit(1);
}

if (!hasGeminiKey && !hasOpenAIKey) {
  console.error('Error: Provide at least one AI provider key (Gemini or OpenAI).');
  process.exit(1);
}

let geminiModel = null;
if (hasGeminiKey) {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    console.log(`Gemini provider configured (model: ${GEMINI_MODEL}).`);
  } catch (error) {
    console.error('Failed to initialize Gemini provider:', error);
  }
}

let openaiClient = null;
if (hasOpenAIKey) {
  try {
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
    console.log(`OpenAI provider configured (model: ${OPENAI_MODEL}).`);
  } catch (error) {
    console.error('Failed to initialize OpenAI provider:', error);
  }
}

if (!geminiModel && !openaiClient) {
  console.error('No AI provider is available after initialization. Exiting.');
  process.exit(1);
}

const CONTRACT_ADDRESS = '0x0b6ae13119fc3b61d6abb115342a1a075e14b6b6';
const ABI = [
  'function purchase() external payable returns (uint256)',
  'function balanceOf(address _address) external view returns (uint256)',
  'function markUsage(address _address) external returns (uint256)',
];

const generalKnowledgeSentences = [
  'The Earth revolves around the Sun.',
  'Water boils at 100 degrees Celsius.',
  'Light travels faster than sound.',
  'The human body has 206 bones.',
];

const app = express();
app.use(express.json());

const normalizeOrigins = (originValue) => {
  if (!originValue) return undefined;
  return originValue
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const corsOrigins = normalizeOrigins(ALLOWED_ORIGIN);
app.use(
  cors(
    corsOrigins
      ? {
          origin: corsOrigins,
          credentials: true,
        }
      : undefined,
  ),
);

const provider = new JsonRpcProvider(RPC_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);
const contract = new Contract(CONTRACT_ADDRESS, ABI, wallet);

async function generateResponse(prompt) {
  if (geminiModel) {
    try {
      const result = await geminiModel.generateContent(prompt);
      const text = result?.response?.text?.();
      if (text) {
        return text.trim();
      }
    } catch (error) {
      console.error('Gemini generation failed:', error);
      if (!openaiClient) {
        throw error;
      }
    }
  }

  if (openaiClient) {
    const completion = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'You are a knowledgeable assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const content = completion.choices?.[0]?.message?.content;
    if (content) {
      return content.trim();
    }
    return 'No response generated.';
  }

  throw new Error('No AI provider available.');
}

app.post('/query-ai', async (req, res) => {
  try {
    const { query, ethAddress } = req.body;

    if (!query || !ethAddress) {
      return res.status(400).json({ error: 'Missing query or ethAddress in request body.' });
    }

    if (!isAddress(ethAddress)) {
      return res.status(400).json({ error: 'Invalid Ethereum address.' });
    }

    const balance = await contract.balanceOf(ethAddress);
    if (balance < 1n) {
      return res.status(403).json({ error: 'Insufficient credits.' });
    }

    const prompt = `${generalKnowledgeSentences.join(' ')}\n\n${query}`;
    const aiResponse = await generateResponse(prompt);

    try {
      const markUsageTx = await contract.markUsage(ethAddress);
      await markUsageTx.wait();
      console.log(`Marked usage for address: ${ethAddress}`);
    } catch (txError) {
      console.error(`Failed to mark usage for address ${ethAddress}:`, txError);
    }

    res.json({ result: aiResponse });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

const serverPort = PORT || 3000;
app.listen(serverPort, () => {
  console.log(`Server running on port ${serverPort}`);
});
