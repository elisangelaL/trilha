import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(morgan("dev"));
  app.use(express.json());

  // Local (npm run dev): o frontend chama http://localhost:4000/api/...
  // Vercel (produção): a rewrite de "services" encaminha /api/backend/* preservando
  // o caminho original, então o Express também precisa reconhecer esse prefixo.
  app.use("/api", routes);
  app.use("/api/backend", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
