import 'package:flutter/material.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'package:http/http.dart' as http;

class QRScanPage extends StatefulWidget {
  @override
  _QRScanPageState createState() => _QRScanPageState();
}

class _QRScanPageState extends State<QRScanPage> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  Barcode? result;
  QRViewController? controller;
  String apiResponse = '';
  bool isLoading = false; // Add a boolean to track loading state

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'QR Code Scanner',
          style: TextStyle(color: Color(0xFFC9D1D9)), // Light gray text
        ),
        backgroundColor: Color(0xFF0D1117), // Dark mode background
        elevation: 0,
        iconTheme: IconThemeData(color: Color(0xFFC9D1D9)), // Light gray icons
      ),
      backgroundColor: Color(0xFF0D1117), // Dark mode background for body
      body: Column(
        children: <Widget>[
          Expanded(
            flex: 4,
            child: Center(
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.blue, width: 4),
                  borderRadius: BorderRadius.circular(12.0),
                ),
                child: QRView(
                  key: qrKey,
                  onQRViewCreated: _onQRViewCreated,
                ),
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Center(
              child: (result != null)
                  ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'QR Code Data: ${result!.code}',
                    style: TextStyle(
                      color: Color(0xFFC9D1D9), // White text for scanned data
                      fontSize: 18,
                    ),
                  ),
                  SizedBox(height: 10),
                  ElevatedButton(
                    onPressed: () {
                      String phoneNumber = _extractPhoneNumber(result!.code!);
                      _sendPhoneNumberToAPI(phoneNumber);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Color(0xFF28A745), // GitHub green button
                      padding: EdgeInsets.symmetric(horizontal: 50, vertical: 15),
                    ),
                    child: Text(
                      'Check In',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                  SizedBox(height: 20),
                  isLoading
                      ? CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFC9D1D9)),
                  )
                      : Text(
                    apiResponse,
                    style: TextStyle(color: Color(0xFFC9D1D9)), // White text for API response
                  ),
                ],
              )
                  : Text(
                'Scan a code',
                style: TextStyle(
                  color: Color(0xFFC9D1D9), // White text for 'Scan a code'
                  fontSize: 18,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _onQRViewCreated(QRViewController controller) {
    this.controller = controller;
    controller.scannedDataStream.listen((scanData) {
      setState(() {
        result = scanData;
      });
    });
  }

  String _extractPhoneNumber(String scannedText) {
    return scannedText;
  }

  Future<void> _sendPhoneNumberToAPI(String phoneNumber) async {
    setState(() {
      isLoading = true; // Start loading when the API call starts
    });

    try {
      final url = Uri.parse('http://43.204.23.157:3500/checkIN');
      int phoneNumberAsInt = int.parse(phoneNumber);

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: '{"phone": $phoneNumberAsInt}',
      );

      if (response.statusCode == 200) {
        setState(() {
          apiResponse = 'Check-in successful!';
        });
      } else {
        setState(() {
          apiResponse = 'Check-in failed: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        apiResponse = 'Error: $e';
      });
    } finally {
      setState(() {
        isLoading = false; // Stop loading when the API call is finished
      });
    }
  }
}
