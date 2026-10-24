const ws = require("ws");
const { WebSocketServer } = ws;

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket, request) => {
	console.log(`New client connected : ${request.socket.remoteAddress}`);

	socket.on("message", (message) => {
		message = message.toString();
		console.log(`Received: ${message}`);

		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN && client !== socket) {
				client.send(message);
			}
		});
	});

	socket.on("close", (reason) => {
		console.log(`Client disconnected: ${reason}`);
	});

	socket.on("error", (error) => {
		console.error(`WebSocket error: ${error}`);
	});
});

console.log("WebSocket server is running on ws://localhost:8080");
