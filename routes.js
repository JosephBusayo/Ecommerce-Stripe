const express = require('express');
const router = express.Router();
const { resolve } = require("path");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


router.get("/", (_req, res) => {
    const path = resolve('public' + "/homepg.html");
    res.sendFile(path);
  });


router.post("/onboard-user", async(req, res) => {
    try {
        const account = await stripe.accounts.create({type: "express"});
        // setting account Id to session 
        req.session.accountID = account.id;

        const origin = `${req.headers.origin}`;
        const accountLinkURL = await generateAccountLink(account.id, origin);

        res.send({url : accountLinkURL})
        
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
        
    }
})


module.exports = router