import "module-alias/register";
require("dotenv").config({ path: "../.env" });
import http from "http";
import Pino from "pino";
import { AddressInfo } from "net";

const LISTEN_NET = "0.0.0.0";
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 9883;

const logger: Pino.Logger = Pino({
	level: process.env.ROOT_LOG_LEVEL || "debug",
	timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
});

const server = http.createServer((req, res) => {
	console.log("OK");
	// separate service that will take a large file and split into chunks, by line and dimension
	// each chunk then sent as a separate request to this parse-model-service
	// use Proxy to multiple instances of this service and limiter guards
	// db adapter and models
});

server.on("error", (e) => {
	logger.error({ error: e }, "Unhandled error on server");
});

const app = server.listen(PORT, LISTEN_NET, async () => {
	const { address, port } = app.address() as AddressInfo;
	try {
		setTimeout(() => {
			console.log("Delay.");
		}, 1000);

		logger.info("Server running delay");
	} catch (error) {
		logger.info({ error }, "Server not running");
		process.exit(1);
	}

	logger.info(`Server is listening at http://${address}:${port}`);
});
