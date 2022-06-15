const express = require("express");
const router = express.Router();
const { resolve } = require("path");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.get("/", (_req, res) => {
  const path = resolve("public" + "/addBank.html");
  res.sendFile(path);
});

const storeItems = new Map([
  [1, { priceInCents: 10000, name: "Nodejs Course" }],
  [2, { priceInCents: 20000, name: "apple JukeBox" }],
  [3, { priceInCents: 40000, name: "Learn Css Today" }],
]);

// router.post("/create-checkout-session", async (req, res) => {
//   //const items = req.body;
//   try {
//     const session = await stripe.checkout.sessions.create(
//       {
//         payment_method_types: ["card"],
//         mode: "payment",
//         line_items: req.body.items.map((item) => {
//           const storeItem = storeItems.get(item.id);
//           return {
//             price_data: {
//               currency: "usd",
//               product_data: {
//                 name: storeItem.name,
//               },
//               unit_amount: storeItem.priceInCents,
//             },
//             quantity: item.quantity,
//           };
//         }),
//         success_url: `${process.env.url}/successful`,
//         cancel_url: `${process.env.url}/failure`,
//       },
//       {
//         stripeAccount: "acct_1L5qJWQgiWMchdSI",
//       }
//     );

//     res.json({ url: session.url });
//   } catch (err) {
//     res.status(500).json({
//       error: err.message,
//     });
//   }
// });
router.post("/create-checkout-session", async (req, res) => {
  const { ProductName, price, quantity } = req.body;
  try {
    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: ProductName,
              },
              unit_amount: price,
            },
            quantity: quantity,
          },
        ],
        success_url: `${process.env.url}/successful`,
        cancel_url: `${process.env.url}/failure`,
      },
      {
        stripeAccount: "acct_1L5qJWQgiWMchdSI",
      }
    );

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
