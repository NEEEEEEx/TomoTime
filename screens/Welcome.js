import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import styles from '../styles/appStyles';

export default function Welcome ()  {
  return (
    <ImageBackground 
      source={require('../assests/images/gradient-bg.png')}
      style={[styles.container, { paddingTop: 25 }]}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ----- Logo -----*/}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assests/images/tomo-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Welcome Text */}
          <Text style={styles.welcomeText}>Welcome to</Text>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, {
              marginRight: 40,
              
            }]}>Tomo</Text>
            <Text style={[styles.title, {
              marginLeft: 40,
              textAlign: 'right',
            }]}>Time</Text>
          </View>

          {/* ----- Description ----- */}
          <Text style={styles.description}>
            The intelligent system that generates personalized schedules,
            creating perfect focus blocks adaptable to your workload and
            deadlines.
          </Text>

          {/* ----- Google Sign In Button (gradient) -----*/}
          <TouchableOpacity style={styles.button} activeOpacity={0.85}>
            <LinearGradient
              colors={['#FF3F41', '#FFBE5B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <FontAwesome name="google" size={20} color="#FFFFFF" style={[styles.icons, {
    marginRight: 10,}]} />
              <Text style={styles.buttonText}>Sign in with Google</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Feature Cards */}
          <View style={styles.cardsContainer}>
            {/* Manage Classes Card */}
            <View style={styles.card}>
              <View style={styles.cardIconContainer}>
                <FontAwesome5 name="calendar-day" size={33} color="#FF4442" style={styles.icons}/>
              </View>
              <Text style={styles.cardTitle}>Manage Classes</Text>
              <Text style={styles.cardDescription}>
                Add your class schedule manually or import from text/images
              </Text>
            </View>

            {/* Track Tasks Card */}
            <View style={styles.card}>
              <View style={styles.cardIconContainer}>
                <FontAwesome name="list-ul" size={33} color="#FF9A54" style={styles.icons}/>
              </View>
              <Text style={styles.cardTitle}>Track Tasks</Text>
              <Text style={styles.cardDescription}>
                Create and prioritize your assignments and study tasks
              </Text>
            </View>

            {/* Set your Free Time Card */}
            <View style={styles.card}>
              <View style={styles.cardIconContainer}>
                <FontAwesome name="clock-o" size={33} color="#FFB95D" style={styles.icons}/>
              </View>
              <Text style={styles.cardTitle}>Set your Free Time</Text>
              <Text style={styles.cardDescription}>
                Define when you're available for studying
              </Text>
            </View>

            {/* AI Optimizer Card */}
            <View style={styles.card}>
              <View style={styles.cardIconContainer}>
                <FontAwesome name="cog" size={33} color="#FFD28E" style={styles.icons}/>
              </View>
              <Text style={styles.cardTitle}>AI Optimizer</Text>
              <Text style={styles.cardDescription}>
                Let AI create your perfect study schedule
              </Text>
            </View>
          </View>
        </ScrollView>
    </ImageBackground>
      
  );
    
}
