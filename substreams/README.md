## Solana mev bundles substream

This substream is used to extract the MEV bundles from the Solana blockchain. It's based on [dex-trades-extended package by TopLedger](https://github.com/Topledger/solana-programs/tree/main/dex-trades-extended). 

This substream parses through dex trades and identifies arbitrage or sandwich MEV bundles. It also calculates the profit of each of these bundles