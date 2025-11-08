// decapotabila cristina, asa am cumparat-o ca asa a vrut masina
// hey masina, am cumparat cristina,
// hai sa dam o tura sa-ti creasca adrenalina
const fallbackApiUrl = import.meta.env.VITE_MNIST_API_URL ?? "http://127.0.0.1:5000";
export const API_URL = fallbackApiUrl.replace(/\/$/, "");
export const AUTHORIZATION="0x0b6ae13119fc3b61d6abb115342a1a075e14b6b6";
export const ABI_TALENT=[
  "function purchase() external payable returns (uint256)",
  "function balanceOf(address _address) external view returns (uint256)",
  "function markUsage(address _address) external returns (uint256)"
];

export const KNOWLEDGE_PUBLISH="0xc947ef14370f74cce4d325ee4d83d9b4f3639da7";
export const KNOWLEDGE_ABI = [
  "function setOwner() external returns (bool)",
  "function isRewardInProgress() external view returns (bool)",
  "function share(string calldata knowledge) external",
  "function getSubmittedKnowledge() external view returns (tuple(address addr, string knowledge)[] memory)",
  "function getVote() external view returns (uint256)",
  "function vote(uint256 index) external"
];
