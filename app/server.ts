// server.js
require("dotenv").config();
const express = require("express");
const app = express();
const redisClient = require("./redis-client");
const axios = require("axios");
var CronJob = require("cron").CronJob;

new CronJob(
  "*/15 * 6-24,0-1 * * *",
  function() {
    if (!process.env.GRTC_KEY) {
      console.log("Missing environment variable. Did you add your GRTC_KEY?");
    }

    axios
      .get("http://www.grtcbustracker.com/bustime/api/v3/getpredictions", {
        params: {
          key: process.env.GRTC_KEY,
          format: "json",
          rt: "BRT",
          stpid: "3503"
        }
      })
      .then(function(response: any) {
        // handle success
        console.log(response.data);
      })
      .catch(function(error: Error) {
        // handle error
        console.log(error);
      });
    console.log("You will see this message every 15 secondsss");
  },
  null,
  true,
  "America/New_York"
);

app.get("/store/:key", async (req: any, res: any) => {
  const { key } = req.params;
  const value = req.query;
  await redisClient.setAsync(key, JSON.stringify(value));
  return res.send("Success");
});
app.get("/:key", async (req: any, res: any) => {
  const { key } = req.params;
  const rawData = await redisClient.getAsync(key);
  return res.json(JSON.parse(rawData));
});

app.get("/", (req: any, res: any) => {
  return res.send("Hello world");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
