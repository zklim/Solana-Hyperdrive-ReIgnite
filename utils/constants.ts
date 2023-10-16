import Hypercert from "../public/Hypercert.json";
import MockUSDC from "../public/MockUSDC.json";
import FundingPool from "../public/FundingPool.json";
import QfPool from "../public/QfPool.json";

export const HYPERCERT_CONTRACT = {
  address: "0xDFa896e9741eC29CB4ff5d85a9F23B01FC8dE374" as `0x${string}`,
  abi: Hypercert.abi,
};

export const USDC_CONTRACT = {
  address: "0x863788BE9e355D4B98FCD92D110d4e879bdfE607" as `0x${string}`,
  abi: MockUSDC.abi,
};

export const FUNDING_POOL_CONTRACT = {
  address: "0x4b81c3Ba4486C6f1f69528f049b6b3d79ca141E9" as `0x${string}`,
  abi: FundingPool.abi,
};

export const QF_POOL_CONTRACT = {
  address: "0xb0d24C207bA3bf4D9d39F2b39104d0ee9d8579e1" as `0x${string}`,
  abi: QfPool.abi,
};
