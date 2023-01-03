import "module-alias/register";
require("dotenv").config({ path: "../.env" });
import http from "http";
import Pino from "pino";
import { AddressInfo } from "net";
import { EnumType } from "typescript";
const LISTEN_NET = "0.0.0.0";
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 9883;

const logger: Pino.Logger = Pino({
	level: process.env.ROOT_LOG_LEVEL || "debug",
	timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
});

const fs = require("fs");
const es = require("event-stream");

// export as utility
function parseline(line: any) {
	const data = line.split("- -");
	return data;
}

const server = http.createServer((req, res) => {
	console.log("OK");
});

server.on("error", (e) => {
	logger.error({ error: e }, "Unhandled error on server");
});

// export as utility with parameters for required metrics as enum or custom type
async function processApacheLogEntry(
	logfilename: String,
	metrics?: Array<EnumType>
) {
	let lineN = 0;
	const ipsArray: Array<String> = [];
	const userAgents: Array<String> = [];

	console.time("ReadStream benchmark");
	const s = fs
		.createReadStream(logfilename)
		.pipe(es.split())
		.pipe(
			es
				.mapSync(function (line: String) {
					s.pause();

					let parsedLine: Array<String> = parseline(line);

					ipsArray.push(parsedLine[0]);
					userAgents.push(parsedLine[1]);
					lineN += 1;

					s.resume();
				})
				.on("error", function (err: any) {
					console.log("Error while reading file.", err);
				})
				.on("end", function () {
					console.log("IPs: ", ipsArray.length);
					console.log("User Agents: ", userAgents.length);
					console.log("Read entire file.");

					// resolve on condition that the metric is given as an argument in processApacheLogEntry()
					const countryReport = new Promise((resolve, reject) => {
						resolve(geoLocateIPs(ipsArray));
					});
					// resolve on condition that the metric is given as an argument in processApacheLogEntry()
					const systemReport = new Promise((resolve, reject) => {
						resolve(identifySystems(userAgents));
					});
					// resolve on condition that the metric is given as an argument in processApacheLogEntry()
					const browserReport = new Promise((resolve, reject) => {
						resolve(identifyBrowsers(userAgents));
					});

					Promise.all([countryReport, systemReport, browserReport]).then(
						(values) => {
							// send to main() subscriber
							console.log("FINAL LOG STATS REPORT:", values);
						}
					);
				})
		);
	console.timeEnd("ReadStream benchmark");
}

// export as service and implement statistics/API requests/calculations with a type model
async function geoLocateIPs(ips: Array<String>) {
	setTimeout(() => {
		console.log("locations identified", ips.length);
	}, 1000);

	return `cool results 1: ${ips.length}`;
}

// export as service and implement statistics/API requests/calculations with a type model
function identifySystems(useragents: Array<String>) {
	setTimeout(() => {
		console.log("systems identified", useragents.length);
	}, 1000);
	return `cool results 2: ${useragents.length}`;
}

// export as service and implement statistics/API requests/calculations with a type model
function identifyBrowsers(useragents: Array<String>) {
	setTimeout(() => {
		console.log("browsers identified", useragents.length);
	}, 1000);
	return `cool results 3: ${useragents.length}`;
}

async function main() {
	processApacheLogEntry("../raw/apache_log.txt");
}

const app = server.listen(PORT, LISTEN_NET, async () => {
	const { address, port } = app.address() as AddressInfo;
	try {
		main();
		logger.info("Server running delay");
	} catch (error) {
		logger.info({ error }, "Server not running");
		process.exit(1);
	}

	logger.info(`Server is listening at http://${address}:${port}`);
});
