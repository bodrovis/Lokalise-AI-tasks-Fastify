import Fastify from "fastify";
import rootRoutes from "./routes/root.js";
import webhookRoutes from "./routes/webhooks.js";

const PORT = 3000;
const app = Fastify();

app.register(rootRoutes, { prefix: "/" });
app.register(webhookRoutes, { prefix: "/webhooks" });

app.listen({ port: PORT }).then(() => {
	console.log(`Server running at http://localhost:${PORT}`);
});
