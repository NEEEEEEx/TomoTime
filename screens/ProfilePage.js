import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'; // Ensure you have this installed or switch to FontAwesome
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { AuthContext } from '../context/AuthContext';
import { getUserData, clearAllUserData } from '../utils/userStorage';
import styles from '../styles/appStyles';

const PROFILE_PICTURE_KEY = 'profile_picture';

export default function ProfilePage({ navigation }) {
  const { user, signOut } = useContext(AuthContext);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    loadUserSettings();
  }, [user]); // Added user as dependency

  const loadUserSettings = async () => {
    try {
      // 1. Check local storage (in case a custom photo was saved previously)
      const picture = await getUserData(PROFILE_PICTURE_KEY);
      
      if (picture) {
        setProfilePicture(picture);
      } 
      // 2. Fallback to Google Photo from AuthContext
      // UPDATED: Changed user.user.photo to user.photo
      else if (user?.photo) {
        setProfilePicture(user.photo);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
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
      // Clear ALL user-specific data
      await clearAllUserData();
      
      // Sign out
      await signOut();
      
      // Navigate first
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
      
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

  // UPDATED: Removed extra nesting
  const getUserName = () => {
    return user?.name || 'User';
  };

  // UPDATED: Removed extra nesting
  const getUserEmail = () => {
    return user?.email || '';
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
            
            {/* REMOVED: Change Photo Button */}
            
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
              {/* Note: If MaterialDesignIcons is not working, swap with FontAwesome */}
              {/* <FontAwesome name="user-times" size={20} color="#fff" /> */}
              <MaterialDesignIcons name="account-minus-outline" size={20} color="#fff" />
              <Text style={styles.deleteAccountText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}