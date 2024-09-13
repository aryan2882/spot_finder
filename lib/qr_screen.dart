import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:firebase_auth/firebase_auth.dart';

class QRScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final User? user = FirebaseAuth.instance.currentUser;

    // Extract the part before @gmail.com
    String? emailPrefix = user?.email?.split('@').first;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Your QR Code',
          style: TextStyle(color: Colors.white, fontSize: 24),
        ),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.deepPurple, // Enhance app bar with a nice color
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.deepPurple, Colors.purpleAccent], // Gradient background
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Center(
          child: user == null
              ? Text(
            'No user logged in',
            style: TextStyle(color: Colors.white, fontSize: 20), // Improve the text style
          )
              : Card(
            elevation: 10,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(15),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Scan Your Code',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.deepPurple,
                    ),
                  ),
                  SizedBox(height: 20),
                  QrImageView(
                    data: emailPrefix ?? '',
                    version: QrVersions.auto,
                    size: 300.0,
                    gapless: false,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
