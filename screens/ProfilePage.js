import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ImageBackground,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { AuthContext } from '../context/AuthContext';
import { getUserData, setUserData, clearAllUserData } from '../utils/userStorage';
import styles from '../styles/appStyles';

const PROFILE_PICTURE_KEY = 'profile_picture';

export default function ProfilePage({ navigation }) {
  const { user, signOut } = useContext(AuthContext);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      // Load profile picture
      const picture = await getUserData(PROFILE_PICTURE_KEY);
      if (picture) {
        setProfilePicture(picture);
      } else if (user?.user?.photo) {
        setProfilePicture(user.user.photo);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const handleChangeProfilePicture = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto
        },
        {
          text: 'Choose from Gallery',
          onPress: handleChooseFromGallery
        },,
        {
          text: 'Use Default',
          onPress: async () => {
            setProfilePicture(null);
            await setUserData(PROFILE_PICTURE_KEY, null);
            Alert.alert('Success', 'Profile picture updated to default.');
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const handleTakePhoto = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: true,
    };

    try {
      const result = await launchCamera(options);
      
      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to take photo');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setProfilePicture(imageUri);
        await setUserData(PROFILE_PICTURE_KEY, imageUri);
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleChooseFromGallery = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };

    try {
      const result = await launchImageLibrary(options);
      
      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to select image');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setProfilePicture(imageUri);
        await setUserData(PROFILE_PICTURE_KEY, imageUri);
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: confirmDeleteAccount,
          style: 'destructive'
        }
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      // Clear ALL user-specific data (semesters, classes, tasks, preferences, etc.)
      await clearAllUserData();
      
      // Sign out (this also clears user ID and global user data)
      await signOut();
      
      // Navigate first, then show alert
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
      
      // Use setTimeout to show alert after navigation completes
      setTimeout(() => {
        Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
      }, 300);
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Log Out',
          onPress: async () => {
            await signOut();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          },
          style: 'destructive'
        }
      ]
    );
  };

  const getUserName = () => {
    return user?.user?.name || user?.name || 'User';
  };

  const getUserEmail = () => {
    return user?.user?.email || user?.email || '';
  };

  const getProfilePictureSource = () => {
    if (profilePicture) {
      return { uri: profilePicture };
    }
    return require('../assests/images/default-profile.jpg');
  };

  return (
    <ImageBackground
      source={require('../assests/images/gradient-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={[styles.container, { backgroundColor: 'transparent', paddingTop: 15 }]}>
        {/* Header */}
        <View style={[styles.headerRow, { marginHorizontal: 25, marginBottom: 6, paddingTop: 18 }]}>
          <View style={styles.leftHeader}>
            <TouchableOpacity onPress={handleGoBack}>
              <FontAwesome5 
                name="angle-left" 
                size={22} 
                color="#461F04" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.titleWrap}>
            <Text style={styles.headerTitle}>Tomo Time</Text>
          </View>

          <View style={{ width: 22 }} />
        </View>

        <ScrollView style={styles.profileScrollView}>
          {/* Profile Picture Section */}
          <View style={styles.profileSection}>
            <LinearGradient
              colors={['#FF5F6D', '#FFC371']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.profileGradientContainer}
            >
              <Image
                source={getProfilePictureSource()}
                style={styles.profileImageLarge}
              />
            </LinearGradient>
            
            <Text style={styles.profileName}>{getUserName()}</Text>
            <Text style={styles.profileEmail}>{getUserEmail()}</Text>

            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={handleChangeProfilePicture}
            >
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Account Actions Section */}
          <View style={styles.dangerSection}>
            <Text style={styles.dangerSectionTitle}>Account Actions</Text>
            
            <TouchableOpacity
              style={[styles.deleteAccountButton, { backgroundColor: '#ffa526ff', marginBottom: 12 }]}
              onPress={handleLogout}
            >
              <FontAwesome name="sign-out" size={20} color="#fff" />
              <Text style={styles.deleteAccountText}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
            >
              <MaterialDesignIcons name="account-minus-outline" size={20} color="#fff" />
              <Text style={styles.deleteAccountText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}
