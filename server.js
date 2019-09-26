// server.js
const express = require("express");
const app = express();
const redisClient = require("./redis-client");
const fetch = require("node-fetch");

var CronJob = require("cron").CronJob;
new CronJob(
  "*/15 * 6-24,0-1 * * *",
  function() {
    console.log("You will see this message every 15 seconds");
  },
  null,
  true,
  "America/New_York"
);

app.get("/store/:key", async (req, res) => {
  const { key } = req.params;
  const value = req.query;
  await redisClient.setAsync(key, JSON.stringify(value));
  return res.send("Success");
});
app.get("/:key", async (req, res) => {
  const { key } = req.params;
  const rawData = await redisClient.getAsync(key);
  return res.json(JSON.parse(rawData));
});

app.get("/", (req, res) => {
  return res.send("Hello world");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
