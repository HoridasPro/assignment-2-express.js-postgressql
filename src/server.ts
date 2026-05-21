import app from "./app";
import config from "./config/env";

const main = () => {
  app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`);
  });
};
main();
