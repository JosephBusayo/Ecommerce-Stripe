const express = require("express");
const router = express.Router();
const { resolve } = require("path");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.get("/", (_req, res) => {
  const path = resolve("public" + "/homepg.html");
  res.sendFile(path);
});

router.post("/onboard-user", async (req, res) => {
  const { email } = req.body;
  if (email == "") {
    res.redirect("/");
  }
  try {
    const account = await stripe.accounts.create({
      type: "custom",
      country: "US",
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    // acct_1L4OBOQYL6eN3xrM

    // setting account Id to session
    console.log(account.id);
    req.session.accountID = account.id;
    res.redirect("/onboard-user/refresh");
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// Fuctions
let accountLinkGenerator = async (accountID, origin) => {
  const LINK = await stripe.accountLinks.create({
    account: accountID,
    refresh_url: `${origin}/onboard-user/refresh`,
    return_url: `${origin}/success`,
    type: "account_onboarding",
  });
  return LINK.url;
};

// ONBOARD USERS
router.get("/onboard-user/refresh", async (req, res) => {
  if (!req.session.accountID) {
    res.redirect("/");
    return;
  }
  try {
    const { accountID } = req.session;
    const origin = `${req.secure ? "https://" : "http://"}${req.headers.host}`;

    const accountUrl = await accountLinkGenerator(accountID, origin);

    res.redirect(accountUrl);
  } catch (err) {
    res.status(500).send({
      error: err.message,
    });
  }
});

router.get("/success", (req, res) => {
  console.log(req.session);
  res
    .status(200)
    .json({ message: "Onboarding successful, Please Close The Tab" });
});

router.get("/stripe", async (req, res) => {
  const { acct } = req.body;
  try {
    const account = await stripe.accounts.retrieve(acct);

    res.json(account);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.delete("/stripe", async (req, res) => {
  const { acct } = req.body;
  try {
    const deleted = await stripe.accounts.del(acct);

    res.json(deleted);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/all", async (_req, res) => {
  try {
    const accounts = await stripe.accounts.list({
      limit: 20,
    });

    res.json(accounts.data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
