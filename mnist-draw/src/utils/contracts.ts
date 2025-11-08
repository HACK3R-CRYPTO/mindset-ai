// decapotabila cristina, asa am cumparat-o ca asa a vrut masina
// hey masina, am cumparat cristina,
// hai sa dam o tura sa-ti creasca adrenalina
const fallbackApiUrl = import.meta.env.VITE_MNIST_API_URL ?? "http://127.0.0.1:5000";
const DEFAULT_AUTHORIZATION = "0x0b6ae13119fc3b61d6abb115342a1a075e14b6b6";
const DEFAULT_KNOWLEDGE = "0xc947ef14370f74cce4d325ee4d83d9b4f3639da7";
const fallbackAuthorization = import.meta.env.VITE_AUTHORIZATION_CONTRACT ?? DEFAULT_AUTHORIZATION;
const fallbackKnowledge = import.meta.env.VITE_KNOWLEDGE_CONTRACT ?? DEFAULT_KNOWLEDGE;
const fallbackExplorer = import.meta.env.VITE_EXPLORER_BASE ?? "https://sepolia.arbiscan.io/address";

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

function resolveAddress(value: string, fallback: string, label: string) {
  if (ADDRESS_REGEX.test(value)) {
    return value;
  }

  if (!ADDRESS_REGEX.test(fallback)) {
    console.warn(`[contracts] Invalid fallback for ${label}; received "${fallback}"`);
    throw new Error(`Missing valid ${label} address`);
  }

  console.warn(`[contracts] Invalid ${label} provided: "${value}". Using fallback.`);
  return fallback;
}

function normalizeUrl(url: string) {
  return url.replace(/\/$/, "");
}

export const API_URL = normalizeUrl(fallbackApiUrl);
export const AUTHORIZATION = resolveAddress(fallbackAuthorization, DEFAULT_AUTHORIZATION, "AUTHORIZATION");
export const KNOWLEDGE_PUBLISH = resolveAddress(fallbackKnowledge, DEFAULT_KNOWLEDGE, "KNOWLEDGE_PUBLISH");
export const EXPLORER_ADDRESS_BASE = normalizeUrl(fallbackExplorer);

export const ABI_TALENT = [
  "function purchase() external payable returns (uint256)",
  "function balanceOf(address _address) external view returns (uint256)",
  "function markUsage(address _address) external returns (uint256)",
];

export const KNOWLEDGE_ABI = [
  "function setOwner() external returns (bool)",
  "function isRewardInProgress() external view returns (bool)",
  "function share(string calldata knowledge) external",
  "function getSubmittedKnowledge() external view returns (tuple(address addr, string knowledge)[] memory)",
  "function getVote() external view returns (uint256)",
  "function vote(uint256 index) external",
];
