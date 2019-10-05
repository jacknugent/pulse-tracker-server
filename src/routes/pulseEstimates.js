const express = require("express")
const router = express.Router()

const estimateController = require("../controllers/estimateController")

// /estimates
router.get("/", estimateController.getArrivalEstimate)

module.exports = router
