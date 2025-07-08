import Fastify from "fastify";
import rootRoutes from "./routes/root.js";
import webhookRoutes from "./routes/webhooks.js";

const app = Fastify();

app.register(rootRoutes, { prefix: "/" });
app.register(webhookRoutes, { prefix: "/webhooks" });

app.listen({ port: 3000 }).then(() => {
	console.log("Server running at http://localhost:3000");
});
