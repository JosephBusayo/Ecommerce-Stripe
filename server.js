const express = require("express");
const app = express();
const session = require("express-session");
const bodyParser = require("body-parser");
require("dotenv").config();

const indexRoute = require("./routes/routes.js");

// git remote add origin https://github.com/tylerjusfly/Ecommerce-Stripe.git

const port = process.env.PORT || 4242;

app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));

app.use(
  session({
    secret: "cutme",
    resave: false,
    saveUninitialized: true,
  })
);

// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === "/webhook") {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

app.use("/", indexRoute);

app.listen(port, () => console.log(`Node server listening on port ${port}!`));
