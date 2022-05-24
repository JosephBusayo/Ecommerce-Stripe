// const express = require("express");
// const router = express.Router();
// const stripe = require("./routes");

// router.get("/", async (req, res) => {
//   try {
//     const accounts = await stripe.accounts.list({
//       limit: 3,
//     });
//     res.json({ stripe: accounts });
//   } catch (err) {
//     res.status(500).json({
//       error: err.message,
//     });
//   }
// });

// module.exports = router;
