// server.js
const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000

const estimateRouter = require("./src/routes/pulseEstimates")
const estimateFunctions = require("./src/models/estimateFunctions")

const redisClient = require("./src/redis/redis-client")
const http = require("http").createServer(app)
const io = require("socket.io")(http)

const CronJob = require("cron").CronJob
new CronJob(
  "* * 6-24,0-1 * * *",
  function() {
    estimateFunctions.fetchEstimates(redisClient, io)
  },
  null,
  true,
  "America/New_York"
)

io.on("connection", function(client) {
  // once a client has connected, we expect to get a ping from them saying what room they want to join
  client.on("room", function(route) {
    client.join(route)
  })

  client.on("leaveRoom", function(route) {
    client.leave(route)
  })
})

// setInterval(async () => {
//   client.emit("estimates", await redisClient.getAsync(route))
// }, interval)

const port = 8000
io.listen(port)
console.log("Socket.io listening on port", port)

app.use("/estimates", estimateRouter)

// test
app.get("/", (req, res) => {
  return res.send("Hello world")
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
