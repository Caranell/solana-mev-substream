# MEVision

It's a tool to visualize and analyze mev activity on solana, built using substreams engine.

## Why do we need this?

With the rise of solana activity, the amount of MEV on chain has significantly increased. But the ecosystem lacks independent and reliable tools for users to understand and explore MEV activity on the chain.

## How does it work?

It uses substreams engine to get the necessary data from the chain, and then uses a custom algorithm to decode [DEX trades](https://github.com/Topledger/solana-programs/tree/main/dex-trades-extended) (using dex-trades-substream, built by TopLedger team), identify sandwich attacks or arbitrage bundles (using custom-built substream, code available in /substreams folder), and visualize them in a user-friendly way.

## Demo video
https://www.youtube.com/watch?v=yQPqdxRdPxw

## What's inside?

- Backend: Typescript, Node.js, Fastify, Prisma, PostgreSQL, 
- Frontend: Typescript, React, Shadcn UI
- Substreams: Rust, Substreams Engine ([mev-bundles substream package](https://substreams.dev/packages/solana-mev-bundles-1-0-0/v1.0.0))

<img width="1326" alt="Screenshot 2025-05-17 at 02 24 59" src="https://github.com/user-attachments/assets/0dc07c63-7a59-4321-bb21-65157999f52a" />


## How to run it?

### Webpage

https://solana-mev-substream.vercel.app

### Local development

1. Clone the repository
2. To setup backend
    1. Fill the `.env` file, all needed variables are in the `.env.example` file
    2. Run `npm install`
    3. Run `npm run dev`
3. To setup frontend
    1. Fill the `.env` file, all needed variables are in the `.env.example` file
    2. Run `cd frontend`
    3. Run `npm install`
    4. Run `npm run dev`
    5. Open `http://localhost:5173` in your browser
4. To setup substreams
    1. If you want to compile substreams yourself, run `cd substreams && substreamd build`
    2. If you want to save substreams data to the database, run `cd sql && substreamd setup && ./substreams-sink-sql run`
