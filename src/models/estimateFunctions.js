require("dotenv").config()
const axios = require("axios")
const dayjs = require("dayjs")

async function getEstimates(rt, stpid, redisClient) {
  return await axios
    .get("http://www.grtcbustracker.com/bustime/api/v3/getpredictions", {
      params: {
        key: process.env.GRTC_KEY,
        format: "json",
        rt: rt,
        stpid: stpid,
      },
    })
    .then(function(response) {
      // handle success
      const times = response.data["bustime-response"].prd
      if (times) {
        const timestamp = times[0].tmstmp
        const stpnm = times[0].stpnm
        const estimateTimes = times.map(x => parseIntIfInt(x.prdctdn))
        return {
          timestamp: new Date(dayjs(timestamp)),
          rt: rt,
          stpid: stpid,
          stpnm: stpnm,
          estimates: estimateTimes,
        }
      } else {
        console.log("Empty response from GRTC")
        return undefined
      }
    })
    .catch(function(error) {
      // handle error
      console.log(error)
      return undefined
    })
}

async function setEstimates(estimates, rt, redisClient) {
  await redisClient.setAsync(rt, JSON.stringify(estimates))
}

function parseIntIfInt(numberOrInt) {
  return parseInt(numberOrInt) ? parseInt(numberOrInt) : numberOrInt
}

function fetchEstimates(redisClient, io) {
  if (!process.env.GRTC_KEY) {
    throw new Error("Missing environment variable. Did you add your GRTC_KEY?")
  }

  getEstimates("BRT", 3503, redisClient).then(est => {
    setEstimates(est, 3503, redisClient)
  })

  getEstimates("BRT", 3504, redisClient).then(est => {
    setEstimates(est, 3504, redisClient)
  })

  const routes = [3503, 3504]

  routes.forEach(function(route) {
    redisClient
      .getAsync(route)
      .then(estimate => io.sockets.in(route).emit("estimate", estimate))
  })
}

module.exports = {
  getEstimates,
  parseIntIfInt,
  setEstimates,
  fetchEstimates,
}
