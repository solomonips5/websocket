const ws = require("ws");
const { WebSocketServer } = ws;

const server = new WebSocketServer({ port: 8080 }, () => {
	console.log("web socket initialized on : ws://localhost:8080");
});

function heartbeat() {
	this.isAlive = true;
}

server.on("error", (err) => {
	console.error("WebSocket server error:", err.message);
});

server.on("connection", (socket, req) => {
	socket.isAlive = true;
	socket.on("pong", heartbeat);

	const forwarded = req.headers["x-forwarded-for"];
	const ip = forwarded
		? forwarded.split(",")[0].trim()
		: req.socket.remoteAddress;

	console.log(`New Client Connected: ${ip}`);

	socket.on("message", (message, isBinary) => {
		if (isBinary) {
			socket.send("Binary message not allowed only text message");
		}
		if (!isBinary) {
			let msg = message.toString();
			console.log(msg);
			socket.send(`Server : ${msg}`, (err) => {
				if (err) console.error(err);
			});
		}
	});

	socket.on("close", (code, reason) => {
		console.log("Client exited with code : ", code);
		console.log("Reason : ", reason.toString());
	});

	socket.on("error", (error) => {
		console.error(error.message);
	});
});

const interval = setInterval(function ping() {
	server.clients.forEach(function each(socket) {
		if (socket.isAlive === false) return socket.terminate();

		socket.isAlive = false;
		socket.ping();
	});
}, 30000);

server.on("close", function close() {
	clearInterval(interval);
});
