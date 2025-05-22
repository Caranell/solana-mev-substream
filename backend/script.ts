import { PrismaClient } from "@prisma/client";
import { getTokensMetadata } from "./src/services/helius";
import { fetchAllDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import "dotenv/config";

const prisma = new PrismaClient();

const umi = createUmi(process.env.HELIUS_RPC_URL!, {
  commitment: "confirmed",
});

const getMetaplexMetadata = async (tokens: any[]) => {
  const metadata = await fetchAllDigitalAsset(umi, tokens);

  const tokensMetadata = metadata.map((token) => ({
    address: token.publicKey,
    symbol: token.metadata.symbol,
  }));

  return tokensMetadata;
};


async function main() {
  console.log("start");
  const trades = await prisma.trade.findMany({
    take: 1000,
    orderBy: {
      blockSlot: "desc",
    },
  });
  console.log("trades");

  const uniqueTokens = new Set<string>();
  for (const trade of trades) {
    uniqueTokens.add(trade.baseMint);
    uniqueTokens.add(trade.quoteMint);
  }

  const arr = Array.from(uniqueTokens);

  const knownTokens = await prisma.tokens.findMany({});

  const unknownTokens = arr
    .filter((token) => !knownTokens.some((t) => t.address === token))
    .filter((token) => token.length > 0);

  console.log("unknownTokens", unknownTokens.length);

  // in batches of 50, call helius api to get the token metadata
  const batchSize = 50;
  for (let i = 0; i < unknownTokens.length; i += batchSize) {
    const batch = unknownTokens.slice(i, i + batchSize);
    const response = await getMetaplexMetadata(batch);

    await new Promise((resolve) => setTimeout(resolve, 1000));


    console.log('response', response)
    await prisma.tokens.createMany({
      data: response.map((token: any) => ({
        address: token.address,
        symbol: token.symbol || "Unknown",
      })),
    });
  }
}

main();
