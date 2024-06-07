const express = require("express");
const morgan = require("morgan");
const app = express();

const PORT = 3000;
const HOST = "localhost ";

app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));

app.get("/", (req, res) => {
  res.render("lists");
});

app.listen(PORT, HOST, () => {
  "Server is listening on port 3000...";
});
