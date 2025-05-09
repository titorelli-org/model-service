import path from "node:path";
import { ModelService, Service, env, logger } from "./lib";

new Service({
  port: env.PORT,
  host: env.HOST,
  model: new ModelService(path.join(__dirname, "data/generic.dat"), logger),
  logger,
}).listen();
