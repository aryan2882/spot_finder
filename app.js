// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const paymentRoutes = require('./routes/payment');
// const { db } = require('./routes/firebase'); // Import Firebase config
// const Razorpay = require('razorpay');
// const crypto = require('crypto');

// dotenv.config();
// const app = express();

// app.use(cors({ origin: 'http://localhost:3001' })); // Adjust for frontend origin
// app.use(express.json());

// // Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET
// });

// // Payment routes
// app.use('/payments', paymentRoutes);

// // Firebase data route - Fetch phone numbers from Firebase
// app.get('/data', async (req, res) => {
//   try {
//     const snapshot = await db.collection('users').get(); // Replace with your collection name
//     const phoneNumbers = snapshot.docs.map(doc => ({
//       id: doc.id,
//       phoneNumber: doc.data().email.split('@')[0]
//     }));
    
//     res.status(200).json(phoneNumbers);
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     res.status(500).json({ error: 'Error fetching data' });
//   }
// });

// // Webhook route to handle Razorpay events
// app.post('/payments/webhook', (req, res) => {
//   const { paymentId, orderId, signature } = req.body;
//   const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
//     .update(`${orderId}|${paymentId}`)
//     .digest('hex');

//   if (generatedSignature === signature) {
//     res.status(200).send('Webhook received');
//     console.log('Payment verified:', paymentId);
//   } else {
//     res.status(400).send('Invalid signature');
//     console.error('Invalid signature for payment:', paymentId);
//   }
// });

// // Root route
// app.get('/', (req, res) => {
//   res.send('Welcome to the Razorpay and Firebase Integration API');
// });

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });


const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const paymentRoutes = require('./routes/payment');
const { db } = require('./routes/firebase'); // Import Firebase config
const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios=require('axios');

dotenv.config();
const app = express();

const corsOptions = {
  origin: ['https://pg-self.vercel.app/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests
//app.options('*', cors(corsOptions)); // Adjust for frontend origin
app.use(express.json());

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Payment routes
app.use('/payments', paymentRoutes);

// Firebase data route - Fetch phone numbers from Firebase
app.get('/data', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get(); // Replace with your collection name
    const phoneNumbers = snapshot.docs.map(doc => {
      const data = doc.data();
      const timein = new Date(data.timein);  // Convert 'timein' to a Date object
      const timeout = new Date(data.timeout); // Convert 'timeout' to a Date object
      
      // Calculate the difference in milliseconds and convert to minutes
      const differenceInMinutes = (timeout - timein) / (1000 * 60); 

      return {
        id: doc.id,
        phoneNumber: data.email.split('@')[0], // Extract phone number from email
        timein: data.timein,
        timeout: data.timeout,
        duration: differenceInMinutes // Add duration in minutes
      };
    });

    res.status(200).json(phoneNumbers);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});


// Webhook route to handle Razorpay events
app.post('/payments/webhook', async (req, res) => {
  const { paymentId, orderId, signature, amount, phoneNumber } = req.body;
  
  // Generate signature
  const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  console.log(generatedSignature);
  console.log(signature);
  if (generatedSignature === signature) {
    try {
      // Make a POST request to your friend's API
      const response = await axios.post('https://spotfinder-llob.onrender.com/AMOUNT', {
        phone: String(phoneNumber),
        
      });

      // Handle success response from friend's API
      res.status(200).json({
        message: 'Payment successfully verified and phone number sent',
        paymentId,
        orderId,
        amount,
        phoneNumber,
       
        friendApiResponse: response.data // Pass response from friend's API
      });
      console.log('Payment verified and phone number sent:', phoneNumber);
    } catch (error) {
      // Handle error when sending to the other API
      console.error('Error sending phone number to the other API:', error.message);
      res.status(500).send('Payment verified, but failed to send phone number to external API');
    }
  } else {
    res.status(400).send('Invalid signature');
    console.error('Invalid signature for payment:', paymentId);
  }
});


// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Razorpay and Firebase Integration API');
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
