// const express = require('express');
// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// const router = express.Router();
// const dotenv=require('dotenv');
// dotenv.config();

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// router.post('/create-order', async (req, res) => {
//   const { amount, currency } = req.body;

//   try {
//     const order = await razorpay.orders.create({
//       amount,
//       currency,
//       receipt: crypto.randomBytes(16).toString('hex'),
//     });

//     res.json({
//       id: order.id,
//       amount: order.amount,
//       currency: order.currency
//     });
//   } catch (error) {
//     console.error('Error creating order:', error);
//     res.status(500).json({ error: 'Error creating order' });
//   }
// });

// module.exports = router;


const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Endpoint to create an order
router.post('/create-order', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: crypto.randomBytes(16).toString('hex'),
    });

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error creating order' });
  }
});

// Endpoint to create a payment link
router.post('/create-payment-link', async (req, res) => {
  const { amount, currency, description } = req.body;

  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount,
      currency,
      description,
      // Optional: add callback URL here if needed
    });

    res.json({ link: paymentLink.short_url });
  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({ error: 'Error creating payment link' });
  }
});

// Endpoint to generate QR code
router.post('/generate-qr', async (req, res) => {
  const { amount, currency, description } = req.body;

  try {
    // Create a payment link
    const paymentLink = await razorpay.paymentLink.create({
      amount,
      currency,
      description,
    });

    // Create a URL to generate a QR code that contains the payment link
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(paymentLink.short_url)}`;

    res.json({
      qrCodeUrl, // URL to the generated QR code image
      link: paymentLink.short_url, // The payment link URL
      amount: paymentLink.amount,
      currency: paymentLink.currency
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Error generating QR code' });
  }
});


module.exports = router;
