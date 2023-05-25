const express = require("express");
const cors = require("cors");
const routes = require("../routes");

//Create the express application
const app = express();

app.use(cors());
//make json inputs available for endpoints
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded());
app.use(routes);

/**
 * ------------------- SERVER INIT -----------------------------
 */
const PORT = 3000;
app.listen(PORT, function () {
  console.log(`Connected http on port ${PORT}`);
});
