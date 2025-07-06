import path from "node:path";
import { ModelService, Service, env, logger } from "./lib";
import { JwksStore } from "@titorelli-org/jwks-store";

new Service({
  port: env.PORT,
  host: env.HOST,
  model: new ModelService(path.join(__dirname, "data/generic.dat"), logger),
  jwksStore: new JwksStore(path.join(__dirname, "data/jwks.json")),
  logger,
}).listen();
