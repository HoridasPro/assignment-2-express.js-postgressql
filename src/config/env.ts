import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});
const config = {
  connection_string: process.env.CONNECTION_STRING as string,
  port: process.env.PORT,
  secret_access: process.env.ACCESS_TOKEN as string,
  secret_refresh: process.env.REFRESH_TOKEN as string,
};
export default config;
