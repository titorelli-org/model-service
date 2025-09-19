import path from "node:path";
import {
  TextModelService,
  Service,
  env,
  logger,
  ImageModelService,
} from "./lib";
import { JwksStore } from "@titorelli-org/jwks-store";

new Service({
  port: env.PORT,
  host: env.HOST,
  textModel: new TextModelService(
    path.join(__dirname, "data/generic.dat"),
    logger,
  ),
  imageModel: new ImageModelService(
    path.join(__dirname, "data/image-generic.dat"),
    logger,
  ),
  jwksStore: new JwksStore(path.join(__dirname, "data/jwks.json")),
  logger,
}).listen();
