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
  try {
    const account = await stripe.accounts.create({ type: "standard" });

    // setting account Id to session
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

router.get("/succesful", (req, res) => {
  const path = resolve("public" + "/success.html");
  res.sendFile(path);
});
router.get("/failure", (req, res) => {
  const path = resolve("public" + "/failure.html");
  res.sendFile(path);
});

router.get("/mybalance", (req, res) => {
  stripe.balance.retrieve(function (err, balance) {
    // asynchronously called
    if (err) {
      res.json(err);
    } else {
      res.json(balance);
    }
  });
});

//Handle users that haven’t completed onboarding
// https://stripe.com/docs/connect/enable-payment-acceptance-guide?platform=web#handle-incomplete-onboarding

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
    // const mappedAcct = accounts.data.map((data) => {
    //   return {
    //     id: data.id,
    //     country: data.business_profile.support_address.country,
    //     email: data.email,
    //     bank_account: data.external_accounts.data,
    //   };
    // });

    res.json(accounts.data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/checkAccount", async (req, res) => {
  const { acct } = req.body;
  try {
    const accountBankAccounts = await stripe.accounts.listExternalAccounts(
      acct,
      { object: "bank_account", limit: 3 }
    );

    res.json(accountBankAccounts);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
