const redisClient = require("../redis/redis-client")

// search by bus route number (only 3503 and 3504)
module.exports = {
  getArrivalEstimate: async (req, res, next) => {
    try {
      const { stopNumber } = req.query
      const rawData = await redisClient.getAsync(stopNumber)
      if (!rawData) {
        res.json("Route " + stopNumber + " not found in the redis cache.")
      } else {
        res.json(rawData)
      }
    } catch (e) {
      next(e)
    }
  },
}
