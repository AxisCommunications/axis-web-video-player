import express from "express";
import fs from "node:fs";
import { Agent } from "undici";

interface SessionResponse {
	SessionId: string;
	MachineUserId: string;
	TTL: string;
	OrganizationId?: string;
}

interface TypedRequestBody<T> extends Express.Request {
	body: T;
}

interface AuthRequest {
	dPopProof: string;
	resource: string;
}

const app = express();
app.use(express.json());
app.use((_req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
	next();
});

const port = 3001;
const ttl = 3600;

const options = {
	key: fs.readFileSync("./cert/key.pem"),
	cert: fs.readFileSync("./cert/cert.pem"),
};

app.post("/auth", async (req: TypedRequestBody<AuthRequest>, res) => {
	console.log("Request body:", req.body);

	const request = await fetch("https://idp.prod.machineuser.connect.axis.com/session", {
		method: "POST",
		dispatcher: new Agent({
			connect: {
				cert: options.cert,
				key: options.key,
			},
		}),
		// biome-ignore lint/suspicious/noExplicitAny: dispatcher not in fetch types
	} as any);

	const body: SessionResponse = await request.json();
	const dPopResponse = await fetch("https://api.prod.authorizer.connect.axis.com/access", {
		method: "POST",
		body: JSON.stringify({
			resource: req.body.resource,
			operations: [
				"b4bfc908-a033-9905-3a40-e5f2d80cd5d3", // STREAM_VIDEO prod
			],
			ttl,
		}),
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${body.SessionId}`,
			DPoP: req.body.dPopProof,
		},
	});

	if (!dPopResponse.ok) {
		console.error("Fail!", dPopResponse.status, dPopResponse.statusText);
		res.status(dPopResponse.status).send(dPopResponse.statusText);
		return;
	}

	const dPopBody = await dPopResponse.text();
	res.send({ ttl, boundToken: dPopBody });
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
