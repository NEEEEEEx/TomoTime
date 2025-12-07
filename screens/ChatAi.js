import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/appStyles';

//================== Sample AI Chats ===================//
const initialMessages = [
  {
    id: '1',
    sender: 'user',
    text: 'I have a Test coming up on December 5, 2025. Created a study plan for me.',
  },
  {
    id: '2',
    sender: 'bot',
    text: 'Alright! How difficult is the Quiz?\n1 - Easy\n2 - Medium\n3 - Hard',
  },
  { id: '3', sender: 'user', text: '2', variant: 'pill' },
  {
    id: '4',
    sender: 'bot',
    text: 'Ok! Would you like to add a Description about the task?',
  },
  {
    id: '5',
    sender: 'user',
    text: 'Yes. The description is "Coverage: JS Basics, React Hooks, Async Storage"',
  },
  {
    id: '6',
    sender: 'bot',
    text: "Alright! Is there anything else in your schedule?",
  },
  {
    id: '7',
    sender: 'user',
    text: 'Yes, I have a Project named "Project 1 - Case Study". Description is "Coverage: Virtual Assistant System Testing"',
  },
];
//================== End of Sample AI Chats ===================//

export default function ChatAi() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const listRef = useRef(null);

  // ============= Handle Sending Messages ============= //
  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
    };
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
  };
  // ============= End of Handle Sending Messages ============= //

  // ============= Render Messages ============= //
  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    const isPill = item.variant === 'pill';

    return (
      <View style={[styles.chatMessageRow, isUser && { justifyContent: 'flex-end' }]}>
        {!isUser && (
          <View style={styles.chatAvatarWrap}>
            <Image
              source={require('../assests/images/tomo-logo.png')}
              style={styles.chatAvatar}
            />
          </View>
        )}

        <View
          style={[
            styles.chatBubble,
            isUser ? styles.chatUserBubble : styles.chatBotBubble,
            isPill && styles.chatPillBubble,
          ]}
        >
          <Text
            style={[
              styles.chatBubbleText,
              isUser ? styles.chatUserText : styles.chatBotText,
              isPill && styles.chatPillText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };
  // ============= End of Render Messages ============= //


  const scrollToEnd = () => {
    if (listRef.current) {
      listRef.current.scrollToEnd({ animated: true });
    }
  };

  //=================== DISPLAY ===================//
  return (
    <ImageBackground
      source={require('../assests/images/gradient-bg.png')}
      style={[styles.container, { paddingTop: 0 }]}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={{ flex: 1, paddingTop: 15 }}>
          {/* ----- App Header (Back Button, title, profile) ----- */}
          <View style={[styles.headerRow, { marginHorizontal: 25, marginBottom: 6, paddingTop: 18 }]}>
            <View style={styles.leftHeader}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
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

            <LinearGradient
              colors={['#FF3F41', '#FFBE5B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientContainer}
            >
              <View style={styles.profileCircle}>
                <FontAwesome name="user-o" size={18} color="#BE1C1C" />
              </View>
            </LinearGradient>
          </View>

          {/* Hero */}
          <View style={styles.chatHeroWrap}>
            <Image
              source={require('../assests/images/tomo-logo.png')}
              style={styles.chatHeroImage}
              resizeMode="contain"
            />
            <Text style={styles.chatHeroTitle}>Hi! I’m Tomo!</Text>
            <Text style={styles.chatHeroSubtitle}>Your AI Class Schedule Optimizer Companion</Text>
            <Text style={styles.chatHeroCaption}>How Can I Assist You Today?</Text>
          </View>

          {/* Chat window */}
          <View style={styles.chatWindow}>
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={item => item.id}
              renderItem={renderMessage}
              contentContainerStyle={{ padding: 14, paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToEnd}
              onLayout={scrollToEnd}
            />
          </View>

          {/* Input */}
          <View style={styles.chatInputRow}>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="What would you like to know?"
              placeholderTextColor="#b87b3d"
              style={styles.chatInput}
            />
            <TouchableOpacity onPress={handleSend} activeOpacity={0.8}>
              <LinearGradient
                colors={['#FF5F6D', '#FFC371']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={styles.chatSendButton}
              >
                <FontAwesome5 name="arrow-up" size={18} color="#c15b1c" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

