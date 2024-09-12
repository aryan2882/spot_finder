import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:sliding_up_panel/sliding_up_panel.dart';
import 'qr_screen.dart';
import 'payment.dart';
import 'auth_service.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:firebase_core/firebase_core.dart';

class MapScreen extends StatefulWidget {
  @override
  _MapScreenState createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> with AutomaticKeepAliveClientMixin<MapScreen> {
  final List<Map<String, String>> parkingSlots = [
    {"name": "Parking Slot 1", "lat": "12.880153645206287", "lng": "80.08242861506423"},
    {"name": "Parking Slot 2", "lat": "13.082157150962871", "lng": "80.27625475592505"},
    {"name": "Parking Slot 3", "lat": "12.92641350503571", "lng": "80.11763683187955"},
    {"name": "Parking Slot 4", "lat": "12.98020043539306", "lng": "80.16361259697061"},
  ];

  List<int> sensorValues = List.filled(4, 0);
  Set<Marker> _markers = Set<Marker>();
  GoogleMapController? _mapController;
  final AuthService _authService = AuthService();
  bool isLoading = true;
  late DatabaseReference _databaseReference;

  @override
  void initState() {
    super.initState();
    _initializeFirebase();
    _setMarkers();
  }
  Future<void> _initializeFirebase() async {
    await Firebase.initializeApp();
    FirebaseDatabase.instance.databaseURL = 'https://smart-parking-22920-default-rtdb.asia-southeast1.firebasedatabase.app';
    _databaseReference = FirebaseDatabase.instance.ref();
    _listenToSensorValues();
  }

  @override
  bool get wantKeepAlive => true;

  void _listenToSensorValues() {
    for (int i = 1; i <= 4; i++) {
      _databaseReference.child('irsensor$i').onValue.listen((event) {
        if (event.snapshot.value != null) {
          setState(() {
            sensorValues[i - 1] = int.parse(event.snapshot.value.toString());
            isLoading = false;
          });
        }
      });
    }
  }

  void _setMarkers() async {
    final markers = _createMarkers(parkingSlots);
    setState(() {
      _markers = markers;
    });
  }

  Set<Marker> _createMarkers(List<Map<String, String>> slots) {
    Set<Marker> markers = Set<Marker>();
    for (var slot in slots) {
      final marker = Marker(
        markerId: MarkerId(slot["name"]!),
        position: LatLng(
          double.parse(slot["lat"]!),
          double.parse(slot["lng"]!),
        ),
        infoWindow: InfoWindow(
          title: slot["name"],
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      );
      markers.add(marker);
    }
    return markers;
  }

  Future<void> _signOut() async {
    try {
      await _authService.signOut();
      Navigator.pushReplacementNamed(context, '/login');
    } catch (e) {
      print('Sign out failed: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      appBar: AppBar(
        title: Text('Map Navigation'),
        leading: IconButton(
          icon: Icon(Icons.logout),
          onPressed: _signOut,
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.qr_code),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => QRScreen()),
              );
            },
          ),
          IconButton(
            icon: Icon(Icons.currency_rupee),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => PaymentPage(),
              ));
            },
          ),
        ],
      ),
      body: Stack(
        children: <Widget>[
          GoogleMap(
            key: ValueKey('mapKey'),
            initialCameraPosition: CameraPosition(
              target: LatLng(12.92641350503571, 80.11763683187955),
              zoom: 12.0,
            ),
            markers: _markers,
            onMapCreated: (GoogleMapController controller) {
              _mapController = controller;
            },
          ),
          SlidingUpPanel(
            minHeight: 100.0,
            maxHeight: MediaQuery.of(context).size.height * 0.45,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24.0)),
            panel: isLoading ? Center(child: CircularProgressIndicator()) : _buildParkingSlots(),
            body: Container(),
          ),
        ],
      ),
    );
  }

  Widget _buildParkingSlots() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: List.generate(parkingSlots.length, (index) {
          final status = sensorValues[index] == 0 ? "Occupied" : "Free";
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: Row(
              children: [
                Expanded(
                  flex: 7,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: status == "Free"
                          ? Color(0xFF28A745)
                          : Colors.red,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                      padding: EdgeInsets.symmetric(vertical: 18.0),
                      elevation: 10.0,
                      shadowColor: status == "Free"
                          ? Color(0xFF28A745).withOpacity(0.6)
                          : Colors.red.withOpacity(0.6),
                    ),
                    onPressed: () {},  // Changed from `null` to an empty function
                    child: Text(
                      "${parkingSlots[index]["name"]!} - $status",
                      style: TextStyle(fontSize: 16.0, color: Colors.white),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
                SizedBox(width: 8.0),
                Expanded(
                  flex: 3,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: sensorValues[index] == 1 ? Colors.blue : Colors.grey,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                      padding: EdgeInsets.symmetric(vertical: 18.0),
                      elevation: 10.0,
                      shadowColor: sensorValues[index] == 1 ? Colors.blue.withOpacity(0.6) : Colors.grey.withOpacity(0.6),
                    ),
                    onPressed: sensorValues[index] == 1
                        ? () => _getUserLocationAndLaunchMap(index)
                        : null,
                    child: Icon(
                      Icons.navigation,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }


  Future<void> _getUserLocationAndLaunchMap(int index) async {
    LocationPermission permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
        print('Location permissions are denied');
        return;
      }
    }

    try {
      Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      String startLat = position.latitude.toString();
      String startLng = position.longitude.toString();
      String destinationLat = parkingSlots[index]["lat"]!;
      String destinationLng = parkingSlots[index]["lng"]!;

      String mapUrl = 'https://www.google.com/maps/dir/?api=1&origin=$startLat,$startLng&destination=$destinationLat,$destinationLng&travelmode=driving';

      if (await canLaunch(mapUrl)) {
        await launch(mapUrl, forceSafariVC: false, forceWebView: false);
      } else {
        throw 'Could not launch $mapUrl';
      }
    } catch (e) {
      print('Could not get user location: $e');
    }
  }
}