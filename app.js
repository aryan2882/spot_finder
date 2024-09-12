import express from "express"
import { initializeApp } from "firebase/app"
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import { getDatabase, ref, set, get } from "firebase/database"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBz2EzdH6_C-pp_F5Z0XcqjdHGZxEX0cNw",
  authDomain: "smart-parking-22920.firebaseapp.com",
  databaseURL:
    "https://smart-parking-22920-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-parking-22920",
  storageBucket: "smart-parking-22920.appspot.com",
  messagingSenderId: "411285618782",
  appId: "1:411285618782:web:54276b1e18c6246c0e34cf",
  measurementId: "G-XQGQCCFFS0",
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)
const db = getFirestore(firebaseApp)
const rtdb = getDatabase(firebaseApp)

// Initialize Express
const app = express()
const PORT = process.env.PORT

// Middleware
app.use(express.json())

//display the users
const fetchUsers = async (req, res) => {
  try {
    // Reference to the 'users' collection
    const colRef = collection(db, "users")

    // Fetch documents with async/await
    const snapshot = await getDocs(colRef)

    // Map through snapshot docs and extract data
    const users = snapshot.docs.map((doc) => ({
      id: doc.id, // Capture document ID
      ...doc.data(), // Capture the document data
    }))

    // Log or return the users array
    console.log(users)
    res.json(users)
  } catch (error) {
    console.error("Error fetching documents: ", error)
    res.status(500).json({ message: "Error fetching users" })
  }
}

//CheckIN function
const checkAndUpdateUserAccess = async (req, res) => {
  const { phone } = req.body

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" })
  }

  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("Phone", "==", Number(phone)))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return res.status(404).json({ message: "User not found" })
    }

    const userDoc = querySnapshot.docs[0]

    await updateDoc(userDoc.ref, {
      Access: true,
      TimeIn: serverTimestamp(),
    })

    // Control the servo motor
    const rtdb = getDatabase()
    const servoRef = ref(rtdb, "servoControl1")

    // Set servo to 1
    await set(servoRef, 1)
    console.log("Servo set to 1")

    // Verify the value was set
    const snapshot = await get(servoRef)
    console.log("Current servo value:", snapshot.val())

    // Wait for 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 3500))

    // Set servo back to 0
    await set(servoRef, 0)
    console.log("Servo set back to 0")

    // Verify the value was set back to 0
    const finalSnapshot = await get(servoRef)
    console.log("Final servo value:", finalSnapshot.val())

    // Fetch the updated document
    const updatedDoc = await getDocs(
      query(usersRef, where("Phone", "==", Number(phone)))
    )
    const updatedUserData = updatedDoc.docs[0].data()

    res.json({
      message: "User access updated successfully and servo controlled",
      user: {
        name: updatedUserData.Name,
        phone: updatedUserData.Phone,
        access: updatedUserData.Access,
        timeIn: updatedUserData.TimeIn ? updatedUserData.TimeIn.toDate() : null,
        timeOut: updatedUserData.TimeOut
          ? updatedUserData.TimeOut.toDate()
          : null,
      },
    })
  } catch (error) {
    console.error("Error checking/updating user or controlling servo:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

//checkOUT function
const checkOUT = async (req, res) => {
  const { phone } = req.body

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" })
  }

  try {
    const db = getFirestore()
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("Phone", "==", Number(phone)))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return res.status(404).json({ message: "User not found" })
    }

    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()

    // 1. Calculate Amount to be paid
    const timeIn = userData.TimeIn.toDate()
    const timeOut = new Date() // Use current time as timeOut
    const durationInSeconds = Math.ceil((timeOut - timeIn) / 1000)
    const amountToPay = durationInSeconds * 1 // 1 Rs. per second

    // 2. Update TimeOut and Amount_To_Pay in Firestore
    await updateDoc(userDoc.ref, {
      TimeOut: serverTimestamp(),
      Amount_To_Pay: amountToPay,
    })

    // 3. Fetch the updated user document
    const updatedQuerySnapshot = await getDocs(q)
    const updatedUserData = updatedQuerySnapshot.docs[0].data()

    res.json({
      message: "User checked out successfully",
      user: {
        name: updatedUserData.Name,
        phone: updatedUserData.Phone,
        timeIn: updatedUserData.TimeIn ? updatedUserData.TimeIn.toDate() : null,
        timeOut: updatedUserData.TimeOut
          ? updatedUserData.TimeOut.toDate()
          : null,
        durationInSeconds,
        amountToPay: updatedUserData.Amount_To_Pay,
      },
    })
  } catch (error) {
    console.error("Error during checkout process:", error)
    res.status(500).json({ message: "Internal server error during checkout" })
  }
}

//AMOUNT function
const AMOUNT = async (req, res) => {
  const { phone } = req.body

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" })
  }

  try {
    // 3. Control the servo motor
    const rtdb = getDatabase()
    const servoRef = ref(rtdb, "servoControl1")

    // Set servo to 1
    await set(servoRef, 1)
    console.log("Servo set to 1 for checkout")

    // Wait for 3.5 seconds
    await new Promise((resolve) => setTimeout(resolve, 3500))

    // Set servo back to 0
    await set(servoRef, 0)
    console.log("Servo set back to 0 after checkout")

    // Verify the final servo value
    const finalSnapshot = await get(servoRef)
    console.log("Final servo value after checkout:", finalSnapshot.val())

    res.json({
      message: "User Successfully Paid the AMount",
    })
  } catch (error) {
    console.error("Error during checkout process:", error)
    res.status(500).json({ message: "Internal server error during checkout" })
  }
}

// Routes
app.post("/checkIN", checkAndUpdateUserAccess)
app.post("/checkOUT", checkOUT)
app.post("/AMOUNT", AMOUNT)
app.get("/users", fetchUsers)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
