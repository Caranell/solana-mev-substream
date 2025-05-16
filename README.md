# MEVision

It's a tool to visualize and analyze mev activity on solana, built using substreams engine.

## Why do we need this?

With the rise of solana activity, the amount of MEV on chain has significantly increased. But the ecosystem lacks independent and reliable tools for users to understand and explore MEV activity on the chain.

## How does it work?

It uses substreams engine to get the necessary data from the chain, and then uses a custom algorithm to decode DEX trades, identify sandwich attacks or arbitrage bundles, and visualize them in a user-friendly way.

## Demo video
https://www.youtube.com/watch?v=yQPqdxRdPxw

## What's inside?

- Backend: Typescript, Node.js, Fastify, Prisma, PostgreSQL, 
- Frontend: Typescript, React, Shadcn UI
- Substreams: Rust, Substreams Engine ([mev-bundles package](https://substreams.dev/packages/solana-mev-bundles-1-0-0/v1.0.0))

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
