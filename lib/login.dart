import 'package:flutter/material.dart';
import 'auth_service.dart';
import 'map_navigation.dart';
import 'register.dart';
import 'admin_main_screen.dart'; // Import the Admin Dashboard Page
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final AuthService _authService = AuthService();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  bool _isAdminLogin = false; // Flag to check if it's admin login

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF0F2027), Color(0xFF203A43), Color(0xFF2C5364)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Text(
                  "Welcome Back",
                  style: TextStyle(
                    fontSize: 36.0,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                SizedBox(height: 32.0),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  style: TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.1),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12.0),
                      borderSide: BorderSide.none,
                    ),
                    labelText: _isAdminLogin ? 'Admin Email' : 'Phone Number',
                    labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
                  ),
                ),
                SizedBox(height: 16.0),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  style: TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.1),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12.0),
                      borderSide: BorderSide.none,
                    ),
                    labelText: 'Password',
                    labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
                  ),
                ),
                SizedBox(height: 32.0),
                ElevatedButton(
                  onPressed: () async {
                    String email = _emailController.text.trim();
                    String password = _passwordController.text.trim();

                    // Append @gmail.com to the email if it's not already present
                    if (!email.contains('@')) {
                      email = email + '@gmail.com';
                    }

                    // Validate email format
                    if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(email)) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Please enter a valid email address')),
                      );
                      return;
                    }

                    // Check for admin login
                    if (_isAdminLogin) {
                      if (email == "admin@admin.com" && password == "admin123") {
                        // Navigate to Admin Dashboard
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (context) => AdminMainScreen()),
                        );
                      } else {
                        // Show error for invalid admin credentials
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Invalid admin credentials')),
                        );
                      }
                    } else {
                      // User login
                      try {
                        User? user = await _authService.signInWithEmailAndPassword(email, password);

                        if (user != null) {
                          // Check if user exists in Firestore
                          DocumentSnapshot userDoc = await _firestore.collection('users').doc(user.uid).get();

                          if (userDoc.exists) {
                            // Navigate to MapScreen
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(builder: (context) => MapScreen()),
                            );
                          } else {
                            // Show error for user not found
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('User not found in database')),
                            );
                          }
                        } else {
                          // Show error for invalid email or password
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Invalid email or password')),
                          );
                        }
                      } catch (e) {
                        // Handle any errors
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('An error occurred: ${e.toString()}')),
                        );
                      }
                    }
                  },

                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF1DB954),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    padding: EdgeInsets.symmetric(horizontal: 100.0, vertical: 18.0),
                  ),
                  child: Text(
                    _isAdminLogin ? 'Admin Login' : 'Login',
                    style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold),
                  ),
                ),
                SizedBox(height: 16.0),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => RegisterPage()),
                    );
                  },
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.white, // Color of the text
                  ),
                  child: Text("Don't have an account? Register"),
                ),
                SizedBox(height: 16.0),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _isAdminLogin = !_isAdminLogin; // Toggle between admin and user login
                    });
                  },
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.white,
                  ),
                  child: Text(_isAdminLogin
                      ? "Switch to User Login"
                      : "Switch to Admin Login"),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
