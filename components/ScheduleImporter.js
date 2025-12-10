// components/ScheduleImporter.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { parseScheduleImage } from '../services/AIService';

const ScheduleImporter = ({ onImportSuccess, onClose }) => {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setStatus('Image selected. Ready to analyze.');
    }
  };

  const processImage = async () => {
    if (!imageUri) {
      Alert.alert("No Image", "Please select an image first.");
      return;
    }

    setLoading(true);
    setStatus('AI is analyzing your schedule... (This may take a moment)');

    try {
      const parsedClasses = await parseScheduleImage(imageUri);
      
      // Pass data back to parent
      if (onImportSuccess) {
        onImportSuccess(parsedClasses);
      }

    } catch (error) {
      Alert.alert("Error", "Failed to parse schedule. Please try again or enter manually.");
      console.error(error);
      setStatus('Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Schedule from Image</Text>
      
      <View style={styles.previewContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        ) : (
          <Text style={styles.placeholderText}>No image selected</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.pickButton]} 
          onPress={pickImage} 
          disabled={loading}
        >
          <Text style={styles.buttonText}>Pick Image</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.processButton, !imageUri && styles.disabledButton]} 
          onPress={processImage}
          disabled={loading || !imageUri}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Analyze</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Added Cancel Button */}
      <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
         <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>

      {status ? <Text style={styles.statusText}>{status}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%', // Make it fit in modal
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  previewContainer: {
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#888',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  pickButton: {
    backgroundColor: '#6c757d',
  },
  processButton: {
    backgroundColor: '#007bff',
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    padding: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#be1c1c',
  },
  statusText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#007bff',
    fontStyle: 'italic',
  },
});

export default ScheduleImporter;