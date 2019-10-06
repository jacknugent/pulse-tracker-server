require("dotenv").config()
const axios = require("axios")
const dayjs = require("dayjs")

async function getEstimates(
  rt: string,
  stpid: number,
  redisClient: any
): Promise<Estimates> {
  return await axios
    .get("http://www.grtcbustracker.com/bustime/api/v3/getpredictions", {
      params: {
        key: process.env.GRTC_KEY,
        format: "json",
        rt: rt,
        stpid: stpid,
      },
    })
    .then(function(response: any) {
      // handle success
      const times = response.data["bustime-response"].prd
      if (times) {
        const timestamp = times[0].tmstmp
        const stpnm = times[0].stpnm
        const estimateTimes = times.map((x: any) => parseIntIfInt(x.prdctdn))
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
    .catch(function(error: Error) {
      // handle error
      console.log(error)
      return undefined
    })
}

async function setEstimates(
  estimates: Estimates,
  rt: number,
  redisClient: any
) {
  await redisClient.setAsync(rt, JSON.stringify(estimates))
}

function parseIntIfInt(numberOrInt: any) {
  return parseInt(numberOrInt) ? parseInt(numberOrInt) : numberOrInt
}

function fetchEstimates(redisClient: any) {
  if (!process.env.GRTC_KEY) {
    throw new Error("Missing environment variable. Did you add your GRTC_KEY?")
  }

  getEstimates("BRT", 3503, redisClient).then((est: Estimates) => {
    setEstimates(est, 3503, redisClient)
  })

  getEstimates("BRT", 3504, redisClient).then((est: Estimates) => {
    setEstimates(est, 3504, redisClient)
  })
}

module.exports = {
  getEstimates,
  parseIntIfInt,
  setEstimates,
  fetchEstimates,
}

interface Estimates {
  timestamp: Date
  rt: string
  stpid: number
  stpnm: string
  estimates: Array<number> | "DUE" | "DEL"
}
