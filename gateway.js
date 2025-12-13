//gateway.js
const express = require("express");
const request = require("request");

const app = express();

// redirect homepage to /login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// proxy all traffic to the app container
app.use("/", (req, res) => {
  const url = "http://my-nodejs-app:3000" + req.url;
  req.pipe(request(url)).pipe(res);
});

app.listen(80, () => {
  console.log("Gateway running on port 80");
});
