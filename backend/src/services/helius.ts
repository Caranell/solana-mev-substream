import "dotenv/config";
import axios from "axios";

const HELIUS_RPC_URL = process.env.HELIUS_RPC_URL;

export const getTokenName = async (tokenAddress: string) => {
  const response = await axios.post(
    `${HELIUS_RPC_URL}`,
    JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "getAsset",
      params: {
        id: tokenAddress,
        options: {
          showInscription: false,
        },
      },
    })
  );

  const data = response.data;

  return data.token_info.symbol;
};
