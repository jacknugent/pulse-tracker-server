// server.js
require("dotenv").config();
const express = require("express");
const app = express();
const redisClient = require("./redis-client");
const axios = require("axios");
const dayjs = require("dayjs");
var http = require("http").createServer(app);
var io = require("socket.io")(http);

function parseIntIfInt(numberOrInt: any) {
  return parseInt(numberOrInt) ? parseInt(numberOrInt) : numberOrInt;
}

async function getEstimates(rt: string, stpid: number): Promise<Estimates> {
  return await axios
    .get("http://www.grtcbustracker.com/bustime/api/v3/getpredictions", {
      params: {
        key: process.env.GRTC_KEY,
        format: "json",
        rt: rt,
        stpid: stpid
      }
    })
    .then(function(response: any) {
      // handle success
      const times = response.data["bustime-response"].prd;
      if (times) {
        const timestamp = times[0].tmstmp;
        const stpnm = times[0].stpnm;
        const estimateTimes = times.map((x: any) => parseIntIfInt(x.prdctdn));
        return {
          timestamp: new Date(dayjs(timestamp)),
          rt: rt,
          stpid: stpid,
          stpnm: stpnm,
          estimates: estimateTimes
        };
      } else {
        console.log("Empty response from GRTC");
        return undefined;
      }
    })
    .catch(function(error: Error) {
      // handle error
      console.log(error);
      return undefined;
    });
}

async function setEstimates(estimates: Estimates, rt: number) {
  await redisClient.setAsync(rt, JSON.stringify(estimates));
}

var CronJob = require("cron").CronJob;
new CronJob(
  "*/15 * 6-24,0-1 * * *",
  function() {
    if (!process.env.GRTC_KEY) {
      console.log("Missing environment variable. Did you add your GRTC_KEY?");
    }

    getEstimates("BRT", 3503).then((est: Estimates) => {
      setEstimates(est, 3503);
    });

    getEstimates("BRT", 3504).then((est: Estimates) => {
      setEstimates(est, 3504);
    });
  },
  null,
  true,
  "America/New_York"
);

io.on("connection", (client: any) => {
  client.on("subscribeToTimer", (interval: any) => {
    console.log("client is subscribing to timer with interval ", interval);
    setInterval(async () => {
      client.emit("timer", await redisClient.getAsync(3503));
    }, interval);
  });
});

const port = 8000;
io.listen(port);
console.log("Socket.io listening on port", port);

// search by bus route number (only 3503 and 3504)
app.get("/:key", async (req: any, res: any) => {
  const { key } = req.params;
  const rawData = await redisClient.getAsync(key);
  return res.json(JSON.parse(rawData));
});

// test
app.get("/", (req: any, res: any) => {
  return res.send("Hello world");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

interface Estimates {
  timestamp: Date;
  rt: string;
  stpid: number;
  stpnm: string;
  estimates: Array<number> | "DUE" | "DEL";
}
