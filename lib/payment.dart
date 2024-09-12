import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:url_launcher/url_launcher_string.dart';

class PaymentPage extends StatefulWidget {
  @override
  _PaymentPageState createState() => _PaymentPageState();
}

class _PaymentPageState extends State<PaymentPage> {
  int amountToPay = 0;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchAmountToPay();
  }

  void fetchAmountToPay() async {
    final int phoneNumber = 9142299768;
    final url = Uri.parse('http://43.204.23.157:3500/checkOUT');

    try {
      print('Sending request to: $url');
      print('Request body: ${jsonEncode({'phone': phoneNumber})}');

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'phone': phoneNumber}),
      );

      print('Response status code: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        print('Decoded data: $data');

        if (data.containsKey('user')) {
          final amount = data['user']['amountToPay'];
          print('Amount to pay: $amount');

          if (amount is int) {
            setState(() {
              amountToPay = amount;
              isLoading = false;
            });
          } else {
            print('Error: amountToPay is not an integer. Type: ${amount.runtimeType}');
            setState(() {
              isLoading = false;
            });
          }
        } else {
          print('Error: Response does not contain amountToPay');
          setState(() {
            isLoading = false;
          });
        }
      } else {
        setState(() {
          isLoading = false;
        });
        print('Failed to fetch amount: ${response.statusCode}');
        print('Response body: ${response.body}');
      }
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      print('Error fetching amount: $e');
    }
  }

  Future<void> _launchPaymentPage() async {
    const url = 'https://pg-self.vercel.app/';
    if (await canLaunchUrlString(url)) {
      await launchUrlString(
        url,
        mode: LaunchMode.inAppWebView, // Opens the URL within the app
        webViewConfiguration: const WebViewConfiguration(
          enableJavaScript: true, // Enable JavaScript if required
        ),
      );
    } else {
      throw 'Could not launch $url';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Payment',
          style: TextStyle(color: Color(0xFFC9D1D9)), // Light gray text
        ),
        backgroundColor: Color(0xFF0D1117),  // Dark mode background (GitHub dark)
        elevation: 0,
        iconTheme: IconThemeData(color: Color(0xFFC9D1D9)), // Light gray icons
      ),
      body: Container(
        color: Color(0xFF0D1117),
        padding: EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              isLoading
                  ? CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFC9D1D9)),
              )
                  : Text(
                'Amount to Pay: ₹$amountToPay',
                style: TextStyle(
                  fontSize: 24,
                  color: Color(0xFFC9D1D9), // Light gray text for dark mode
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: _launchPaymentPage, // Open the payment URL on press
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color(0xFF28A745), // GitHub green button
                  padding: EdgeInsets.symmetric(horizontal: 50, vertical: 15),
                  textStyle: TextStyle(fontSize: 16),
                ),
                child: Text('Pay', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
