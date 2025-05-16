import "dotenv/config";
import axios from "axios";

const HELIUS_RPC_URL = process.env.HELIUS_RPC_URL;

export const getTokensMetadata = async (tokenAddresses: string[]) => {
  const data = [];

  console.log('getting tokens metadata')
  // add batching
  for (let i = 0; i < tokenAddresses.length; i += 20) {
  console.log('getting tokens metadata')

    const response = await axios.post(
      `${HELIUS_RPC_URL}`,
      JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "getAssetBatch",
        params: {
          ids: tokenAddresses.slice(i, i + 20),
          options: {
            showInscription: false,
          },
        },
      })
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    data.push(...response.data.result);
  }

  return data.map((token: any) => {
    return {
      address: token.id,
      symbol: token.token_info.symbol,
    };
  });
};

export const getTokenMetadata = async (tokenAddress: string) => {
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
  await new Promise((resolve) => setTimeout(resolve, 100));

  const data = response.data;

  return {
    address: data.id,
    symbol: data.token_info.symbol,
  };
};
