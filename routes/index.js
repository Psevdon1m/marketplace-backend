const router = require("express").Router();
const log4js = require("log4js");

log4js.configure({
  appenders: {
    logfile: {
      type: "file",
      filename: "api.log",
    },
    console: {
      type: "console",
    },
  },
  categories: {
    default: {
      appenders: ["logfile", "console"],
      level: "all",
    },
  },
});
var logger = log4js.getLogger();

const { getUserByAddress } = require("../database/database");

const {} = require("../utils/helper");

/**
 * ---------------------- GET ROUTES ----------------------
 */

router.get("/getUserByAddress", async (req, res, next) => {
  try {
    const { address } = req.query;
    const result = await getUserByAddress(address);
    return res.json({ success: true, result });
  } catch (error) {
    return res.status(404).json({ error: error.toString() });
  }
});

/**
 * ---------------------- POST ROUTES ----------------------
 */

router.post("/registerUser", async (req, res, next) => {
  try {
    //todo: implement
  } catch (error) {
    return res.status(404).json({ error: error.toString() });
  }
});

/**
 * ---------------------- PUT ROUTES ----------------------
 */

router.put("/updateUser", async (req, res, next) => {
  try {
    //todo: implement
  } catch (error) {
    return res.status(404).json({ error: error.toString() });
  }
});
