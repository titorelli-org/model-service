import { cleanEnv, host, port, url, str } from "envalid";

export const env = cleanEnv(process.env, {
  MODEL_ORIGIN: url(),
  PORT: port({ default: 3000 }),
  HOST: host({ default: "0.0.0.0" }),
  TEXT_ORIGIN: url(),
  OO_AUTH_CRED: str(),
  OO_BASE_URL: url(),
});
