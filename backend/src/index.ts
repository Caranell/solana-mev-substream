import fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import WebSocket from "ws";
import "dotenv/config";

import mevBundlesController from "./controllers/index";
import mevBundlesService from "./services/mevBundles";
import { toJSONString } from "./controllers/utils";

const SOCKET_UPDATE_INTERVAL = 2000;

const app = fastify({ logger: true });

app.register(cors);

app.register(websocket);

// Store connected clients
const clients = new Set<WebSocket>();

app.get("/statistics", mevBundlesController.getStatistics);

app.get("/bundles", mevBundlesController.getBundles);
app.register(async function (fastify) {
  fastify.get(
    "/ws",
    { websocket: true },
    (socket /* WebSocket */, req /* FastifyRequest */) => {
      clients.add(socket);
      console.log("Client connected");

      socket.on("close", () => {
        clients.delete(socket);
        console.log("Client disconnected");
      });

      socket.on("error", (error: Error) => {
        clients.delete(socket);
        console.error("WebSocket error:", error);
      });

      socket.send(
        JSON.stringify({
          type: "connection",
          message: "Connection established",
        })
      );
    }
  );
});

setInterval(async () => {
  try {
    console.log('checkiong')
    const newBundle = await mevBundlesService.checkForNewBundles();
    if (newBundle) {
      console.log(`Found new bundle. Notifying clients...`);
      const message = JSON.stringify({
        type: "new_bundle",
        data: toJSONString(newBundle),
      });
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  } catch (error) {
    console.error("Error checking for new bundles:", error);
  }
}, SOCKET_UPDATE_INTERVAL);

app.listen({ port: Number(process.env.PORT) }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
