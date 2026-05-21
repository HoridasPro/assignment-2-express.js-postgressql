import app from "./app";
import config from "./config/env";
import { createTable } from "./db";

const main = () => {
  createTable();
  app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`);
  });
};
main();
