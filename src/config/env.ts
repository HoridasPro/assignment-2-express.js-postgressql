import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});
const config = {
  connection_string: process.env.CONNECTION_STRING as string,
  port: process.env.PORT,
  node_env: process.env.GOLOBAL_ERROR,
  secret_access: process.env.ACCESS_TOKEN,
  secret_refresh: process.env.REFRESH_TOKEN,
};
export default config;
