const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
const routes = require("./routes");
app.use("/api", routes);

// server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
