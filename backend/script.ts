import { PrismaClient } from "@prisma/client";
import { getTokensMetadata } from "./src/services/helius";

const prisma = new PrismaClient();

async function main() {
  const transactions = await prisma.trade.findMany();

  const uniqueTokens = new Set<string>();
  for (const transaction of transactions) {
    uniqueTokens.add(transaction.baseMint);
    uniqueTokens.add(transaction.quoteMint);
  }

  const arr = Array.from(uniqueTokens);

  const knownTokens = await prisma.tokens.findMany({})

  const unknownTokens = arr.filter((token) => !knownTokens.some((t) => t.address === token)).filter((token) => token.length > 0);


  // in batches of 50, call helius api to get the token metadata
  const batchSize = 50;
  for (let i = 0; i < unknownTokens.length; i += batchSize) {
    const batch = unknownTokens.slice(i, i + batchSize);
    const response = await getTokensMetadata(batch);
    console.log('response', response)

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await prisma.tokens.createMany({
      data: response.map((token: any) => ({
        address: token.address,
        symbol: token.symbol || 'Unknown',
      })),
    });
  }
}

main();