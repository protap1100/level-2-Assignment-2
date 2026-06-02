import app from "./app.js";
import config from "./config/index.js";
import { initDB } from "./db/index.js";

const port = config.port;

const main = async () => {
  await initDB();
  app.listen(port, () => {
    console.log(`app is listening port ${config.port}`);
  });
};

main();
