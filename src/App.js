// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { db } from './firebase'; // Ensure this path is correct
// import { collection, getDocs } from 'firebase/firestore';
// import ReactToPrint from 'react-to-print';
// import QRCode from 'qrcode';

// const App = () => {
//   const [amount, setAmount] = useState('');
//   const [phoneNumbers, setPhoneNumbers] = useState([]);
//   const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('');
//   const [error, setError] = useState(null);
  
//   const [message, setMessage] = useState('');
//   const [invoiceData, setInvoiceData] = useState('');
//   const [qrCodeUrl, setQrCodeUrl] = useState('');
//   const resumeRef = useRef();

//   useEffect(() => {
//     const fetchPhoneNumbers = async () => {
//       try {
//         console.log('Fetching phone numbers from Firestore...');
//         const querySnapshot = await getDocs(collection(db, 'users'));
//         const numbers = querySnapshot.docs.map(doc => {
//           const data = doc.data();
//           return {
//             id: doc.id,
//             phoneNumber: data.email.split('@')[0] // Extract phone number from email
//           };
//         });
//         console.log('Fetched phone numbers:', numbers);
//         setPhoneNumbers(numbers);
//       } catch (error) {
//         console.error('Error fetching phone numbers:', error);
//         setError(`Error fetching phone numbers: ${error.message}`);
//       }
//     };

//     fetchPhoneNumbers();
//   }, []);

//   const handlePhoneNumberChange = (e) => {
//     setSelectedPhoneNumber(e.target.value);
//   };

//   const handlePayment = async () => {
//     // Generate a random amount between 200 and 500
//     const randomAmount = Math.floor(Math.random() * (500 - 200 + 1)) + 200;

//     // Set the amount state to the generated random amount
//     setAmount(randomAmount);

//     if (!selectedPhoneNumber) {
//       alert('Please select a phone number.');
//       return;
//     }

//     try {
//       // Step 1: Create an order on the server with the random amount
//       const response = await axios.post('http://localhost:3000/payments/create-order', {
//         amount: randomAmount * 100, // Convert to paise
//         currency: 'INR'
//       });

//       const { id, amount: orderAmount, currency } = response.data;

//       const options = {
//         key: 'rzp_test_XFLNyCv0gygBT7', // Replace with your actual Razorpay key
//         amount: orderAmount,
//         currency: currency,
//         name: 'SpotFinder',
//         description: 'Pay your money securely and instantly!',
//         order_id: id,
//         handler: async function (response) {
//           console.log('Payment Successful:', response);

//           // Step 2: Send payment confirmation to the server
//           try {
//             const webhookResponse = await axios.post('http://localhost:3000/payments/webhook', {
//               paymentId: response.razorpay_payment_id,
//               orderId: response.razorpay_order_id,
//               signature: response.razorpay_signature,
//               amount: parseFloat(amount), // Convert to paise
//               phoneNumber: selectedPhoneNumber
//             });

//             console.log('Server received payment confirmation');
//             setMessage(`Payment successful!<br />
//                         Payment ID: ${response.razorpay_payment_id}<br />
//                         Order ID: ${response.razorpay_order_id}<br />
//                         Amount: ${randomAmount}<br />
//                         Phone Number: ${selectedPhoneNumber}`);
//             setInvoiceData({
//               paymentId: response.razorpay_payment_id,
//               orderId: response.razorpay_order_id,
//               amount: randomAmount,
//               phoneNumber: selectedPhoneNumber
//             });

//             // Generate QR Code for payment link
//             const paymentLinkResponse = await axios.post('http://localhost:3000/payments/create-payment-link', {
//               amount: randomAmount * 100, // Convert to paise
//               currency: 'INR',
//               description: 'Payment for XYZ'
//             });

//             const { link } = paymentLinkResponse.data;
//             const qrCode = await QRCode.toDataURL(link);
//             setQrCodeUrl(qrCode);

//             console.log('Webhook Response:', webhookResponse.data.message);
//           } catch (error) {
//             console.error('Error sending payment confirmation to server:', error);
//           }
//         },
//         prefill: {
//           name: 'Anurag Chandra', // Replace with actual user name or remove
//           email: 'anurag16@gmail.com', // Replace with actual user email or remove
//           contact: selectedPhoneNumber
//         },
//         theme: {
//           color: '#3399cc'
//         }
//       };

//       if (window.Razorpay) {
//         const paymentObject = new window.Razorpay(options);
//         paymentObject.open();
//       } else {
//         console.error('Razorpay script not loaded.');
//         setError('Razorpay script not loaded.');
//       }
//     } catch (error) {
//       setError(`Error creating order: ${error.message}`);
//     }
//   };

//   return (
//     <div className="App">
//       <h1>Razorpay Payment Integration</h1>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
      
//       {qrCodeUrl && <div><img src={qrCodeUrl} alt="QR Code" /></div>}
      
      
    
//       <input
//         type="number"
//         value={amount}
//         onChange={(e) => setAmount(e.target.value)}
//         placeholder={amount} // Display the amount as placeholder
//         min="1"
//         readOnly // Make amount read-only since it's set randomly
//       />
//       <select onChange={handlePhoneNumberChange} value={selectedPhoneNumber}>
//         <option value="">Select phone number</option>
//         {phoneNumbers.map((entry) => (
//           <option key={entry.id} value={entry.phoneNumber}>
//             {entry.phoneNumber}
//           </option>
//         ))}
//       </select>
//       <button onClick={handlePayment}>Pay with Razorpay</button>
//       {invoiceData && (
//         <div>
          
          
//           <div ref={resumeRef} style={{ textAlign: 'center' }}>
//             <h1>Invoice</h1>
//             <p>Payment ID: {invoiceData.paymentId}</p>
//             <p>Order ID: {invoiceData.orderId}</p>
//             <p>Amount: {invoiceData.amount}</p>
//             <p>Phone Number: {invoiceData.phoneNumber}</p>
//           </div>
//           <ReactToPrint
//             trigger={() => (
//               <button>Download Invoice</button>
//             )}
//             content={() => resumeRef.current}
//             documentTitle="Payment Invoice"
//           />
//         </div>
//       )}

//     </div>
//   );
// };

// export default App;


import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import ReactToPrint from 'react-to-print';
import './App.css';

const App = () => {
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const[intime,setIntime]=useState('');
  const[outtime,setOuttime]=useState('');
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const resumeRef = useRef();
  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      try {
        console.log('Fetching phone numbers from Firestore...');
        const querySnapshot = await getDocs(collection(db, 'users'));
        const numbers = querySnapshot.docs.map(doc => {
          const data = doc.data();
  
          // Convert Firestore Timestamps for 'TimeIn' and 'TimeOut' to Date objects
          const timein = data.TimeIn ? data.TimeIn.toDate() : null;
          const timeout = data.TimeOut ? data.TimeOut.toDate() : null;
  
          // Calculate the difference in minutes if both TimeIn and TimeOut are available
          const duration = timein && timeout ? (timeout - timein) / 1000  : null;
          const amount = duration !== null ? Math.ceil(Math.abs(duration)) : 0;
          setAmount(amount);
          setDuration( Math.ceil(Math.abs(duration)));
          setIntime(timein);
          setOuttime(timeout);
  
          return {
            id: doc.id,
            phoneNumber: data.email.split('@')[0], // Extract phone number from email
            timein: timein ? timein.toLocaleString() : null, // Format TimeIn to readable string
            timeout: timeout ? timeout.toLocaleString() : null, // Format TimeOut to readable string
            duration: duration !== null ? Math.abs(duration) : null // Duration in minutes, absolute value
            
          };
        });
        console.log('Fetched phone numbers and durations:', numbers);
        setPhoneNumbers(numbers);
      } catch (error) {
        console.error('Error fetching phone numbers:', error);
        setError(`Error fetching phone numbers: ${error.message}`);
      }
    };
  
    fetchPhoneNumbers();
  }, []);

  const handlePhoneNumberChange = (e) => {
    setSelectedPhoneNumber(e.target.value);
  };

  const handlePayment = async () => {
    // const randomAmount = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
    

    if (!selectedPhoneNumber) {
      alert('Please select a phone number.');
      return;
    }

    try {
      // Create an order on the server
      const orderResponse = await axios.post('https://payment-po0w.onrender.com/payments/create-order', {
        amount: amount *100, // Convert to paise
        currency: 'INR'
      });

      const { id, amount: orderAmount, currency } = orderResponse.data;

      // Create a payment link
      const linkResponse = await axios.post('https://payment-po0w.onrender.com/payments/create-payment-link', {
        amount: amount *100, // Convert to paise
        currency: 'INR',
        description: 'Payment for your purchase'
      });

      if (linkResponse.data.link) {
        setQrCodeUrl(linkResponse.data.link); 
        console.log(setQrCodeUrl);// Set the QR code URL
      } else {
        console.error('QR Code URL is not available.');
      }

      const options = {
        key: 'rzp_test_XFLNyCv0gygBT7', // Replace with your actual Razorpay key
        amount: orderAmount,
        currency: currency,
        name: 'SpotFinder',
        description: 'Pay your money securely and instantly!',
        order_id: id,
        handler: async function (response) {
          console.log('Payment Successful:', response);

          try {
            const webhookResponse = await axios.post('https://payment-po0w.onrender.com/payments/webhook', {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              amount: amount, // Convert to paise
              phoneNumber: selectedPhoneNumber
            });

            console.log('Webhook Response:', webhookResponse.data.message);

            setMessage(`Payment successful!<br />
                        Payment ID: ${response.razorpay_payment_id}<br />
                        Order ID: ${response.razorpay_order_id}<br />
                        Amount: ${amount}<br />
                        Phone Number: ${selectedPhoneNumber}<br>
                        Entry Time: ${webhookResponse.data.timein}<br />
                      Exit Time: ${webhookResponse.data.timeout}<br />
                      Duration: ${webhookResponse.data.duration} minutes`);
            setInvoiceData({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              amount: amount,
              phoneNumber: selectedPhoneNumber,
              timein: webhookResponse.data.timein,
            timeout: webhookResponse.data.timeout,
            duration: webhookResponse.data.duration
            });
          } catch (error) {
            console.error('Error sending payment confirmation to server:', error);
          }
        },
        prefill: {
          name: 'Anurag Chandra',
          email: 'anurag16@gmail.com',
          contact: selectedPhoneNumber
        },
        theme: {
          color: '#3399cc'
        }
      };

      if (window.Razorpay) {
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else {
        console.error('Razorpay script not loaded.');
        setError('Razorpay script not loaded.');
      }
    } catch (error) {
      setError(`Error creating order: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <div className='container'>
      <h1>Razorpay Payment Integration</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {selectedPhoneNumber && !qrCodeUrl && duration !== null && (
  <>
    <p><strong>Intime:</strong> {intime.toLocaleString()}</p>
    <p><strong>Outtime:</strong> {outtime.toLocaleString()}</p>
    <p><strong>Duration:</strong> {duration} seconds(1 rup/seconds)</p>
    <p><strong>Bill:</strong> {duration} rupees</p>
  </>
)}

      {selectedPhoneNumber && 
      (<input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={amount} // Set placeholder to current amount
        min="1"
        readOnly // Make amount read-only since it's set randomly
      />)
}
      <select onChange={handlePhoneNumberChange} value={selectedPhoneNumber}>
        <option value="">Select phone number</option>
        {phoneNumbers.map((entry) => (
          <option key={entry.id} value={entry.phoneNumber}>
            {entry.phoneNumber}
          </option>
        ))}
      </select>
      {selectedPhoneNumber  &&  
      <button onClick={handlePayment}>Generate Payment Link and QR Code</button>
      }
      {qrCodeUrl && !invoiceData && (
        <div className='qrcode'>
          <QRCodeSVG value={qrCodeUrl} />
          <p>Scan this QR code to complete the payment.</p>
        </div>
      )}

      {invoiceData && (
        <div>
          <div ref={resumeRef} className="invoice">
            <h1>Invoice</h1>
            <p>Payment ID: {invoiceData.paymentId}</p>
            <p>Order ID: {invoiceData.orderId}</p>
            <p>Amount: {invoiceData.amount}</p>
            <p>Phone Number: {invoiceData.phoneNumber}</p>
            <p>Intime:{intime.toLocaleString()}</p>
            <p>Outtime:{outtime.toLocaleString()}</p>
            
          </div>
          <ReactToPrint
            trigger={() => (
              <button>Download Invoice</button>
            )}
            content={() => resumeRef.current}
            documentTitle="Payment Invoice"
          />
        </div>
      )}
      </div>
    </div>
  );
};

export default App;
