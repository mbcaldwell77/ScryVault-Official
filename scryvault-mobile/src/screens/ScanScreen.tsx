import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
// import { Camera, CameraType, BarCodeScanner } from 'expo-camera'; // Temporarily disabled for Expo Go
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

export default function ScanScreen() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'manual' | 'upload'>('manual');
  const [manualIsbn, setManualIsbn] = useState('');

  const navigateToInventory = () => {
    navigation.navigate('Inventory');
  };

  useEffect(() => {
    (async () => {
      // Temporarily disabled for Expo Go compatibility
      // const { status } = await Camera.requestCameraPermissionsAsync();
      // setHasPermission(status === 'granted');
      setHasPermission(false); // Set to false to force manual mode
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    Alert.alert(
      'ISBN Scanned!',
      `ISBN: ${data}`,
      [
        { text: 'Scan Again', onPress: () => setScanned(false) },
        { text: 'Continue', onPress: () => console.log('Process ISBN:', data) }
      ]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      Alert.alert('Image Selected', 'AI will analyze the image for ISBN detection');
    }
  };

  const requestPermissions = async () => {
    Alert.alert(
      'Barcode Scanner Unavailable',
      'Barcode scanning requires a development build. Please use manual entry or image upload for now.',
      [{ text: 'OK' }]
    );
  };

  const handleManualSubmit = () => {
    if (manualIsbn.trim()) {
      Alert.alert(
        'ISBN Entered!',
        `ISBN: ${manualIsbn}`,
        [
          { text: 'Enter Another', onPress: () => setManualIsbn('') },
          { text: 'Continue', onPress: () => console.log('Process ISBN:', manualIsbn) }
        ]
      );
    } else {
      Alert.alert('Error', 'Please enter a valid ISBN');
    }
  };

  if (scanMode === 'camera') {
    return (
      <View style={styles.container}>
        <View style={styles.cameraUnavailable}>
          <Ionicons name="camera-off" size={64} color="#6b7280" />
          <Text style={styles.unavailableTitle}>Barcode Scanner Unavailable</Text>
          <Text style={styles.unavailableText}>
            Camera scanning requires a development build.{'\n'}
            Use manual entry or image upload instead.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.modeButton}
              onPress={() => setScanMode('manual')}
            >
              <Ionicons name="create" size={24} color="#ffffff" />
              <Text style={styles.modeButtonText}>Manual Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeButton}
              onPress={() => setScanMode('upload')}
            >
              <Ionicons name="image" size={24} color="#ffffff" />
              <Text style={styles.modeButtonText}>Upload Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Your Book</Text>
        <Text style={styles.subtitle}>Choose your preferred method</Text>
      </View>

      {/* Mode Selection */}
      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[styles.modeCard, scanMode === 'camera' && styles.modeCardActive]}
          onPress={() => setScanMode('camera')}
        >
          <View style={styles.modeIcon}>
            <Ionicons name="camera" size={32} color={scanMode === 'camera' ? '#10b981' : '#6b7280'} />
          </View>
          <Text style={[styles.modeTitle, scanMode === 'camera' && styles.modeTitleActive]}>
            Camera Scan
          </Text>
          <Text style={styles.modeDescription}>
            Use camera to scan ISBN barcode
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeCard, scanMode === 'manual' && styles.modeCardActive]}
          onPress={() => setScanMode('manual')}
        >
          <View style={styles.modeIcon}>
            <Ionicons name="create" size={32} color={scanMode === 'manual' ? '#10b981' : '#6b7280'} />
          </View>
          <Text style={[styles.modeTitle, scanMode === 'manual' && styles.modeTitleActive]}>
            Manual Entry
          </Text>
          <Text style={styles.modeDescription}>
            Enter ISBN manually
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeCard, scanMode === 'upload' && styles.modeCardActive]}
          onPress={() => setScanMode('upload')}
        >
          <View style={styles.modeIcon}>
            <Ionicons name="image" size={32} color={scanMode === 'upload' ? '#10b981' : '#6b7280'} />
          </View>
          <Text style={[styles.modeTitle, scanMode === 'upload' && styles.modeTitleActive]}>
            Upload Photo
          </Text>
          <Text style={styles.modeDescription}>
            Upload image for AI detection
          </Text>
        </TouchableOpacity>
      </View>

      {/* Manual Entry */}
      {scanMode === 'manual' && (
        <View style={styles.manualContainer}>
          <Text style={styles.sectionTitle}>Manual ISBN Entry</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="create" size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="Enter ISBN number..."
              placeholderTextColor="#6b7280"
              value={manualIsbn}
              onChangeText={setManualIsbn}
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleManualSubmit}>
            <Text style={styles.submitButtonText}>Look Up Book</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Upload Photo */}
      {scanMode === 'upload' && (
        <View style={styles.uploadContainer}>
          <Text style={styles.sectionTitle}>Upload Photo</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Ionicons name="cloud-upload" size={48} color="#6b7280" />
            <Text style={styles.uploadText}>Tap to select image</Text>
            <Text style={styles.uploadSubtext}>or drag and drop</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent Scans */}
      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>Recent Scans</Text>
        {[
          { title: "The Great Gatsby", isbn: "978-0743273565", time: "2 hours ago" },
          { title: "To Kill a Mockingbird", isbn: "978-0446310789", time: "4 hours ago" },
          { title: "1984", isbn: "978-0451524935", time: "6 hours ago" },
        ].map((book, index) => (
          <TouchableOpacity
            key={index}
            style={styles.recentItem}
            onPress={navigateToInventory}
          >
            <View style={styles.recentIcon}>
              <Ionicons name="library" size={16} color="#10b981" />
            </View>
            <View style={styles.recentContent}>
              <Text style={styles.recentTitle}>{book.title}</Text>
              <Text style={styles.recentIsbn}>ISBN: {book.isbn}</Text>
            </View>
            <Text style={styles.recentTime}>{book.time}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: '#10b981',
    backgroundColor: 'transparent',
  },
  scanText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  modeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  modeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  scanAgainText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#10b981',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  modeContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modeCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
  },
  modeCardActive: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  modeIcon: {
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
  },
  modeTitleActive: {
    color: '#10b981',
  },
  modeDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  manualContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  inputButton: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 12,
  },
  submitButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraUnavailable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  unavailableTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  unavailableText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  uploadContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 40,
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  uploadText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 12,
  },
  uploadSubtext: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
  recentContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  recentIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  recentIsbn: {
    fontSize: 12,
    color: '#6b7280',
  },
  recentTime: {
    fontSize: 12,
    color: '#6b7280',
  },
});
