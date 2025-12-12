import React, { useRef, useState, useEffect, useCallback, useContext } from 'react';
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
  Alert,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/appStyles';
import { makeChatRequest } from '../utils/openRouter';
import { addUserMessage, addAssistantMessage, getConversation,  resetConversation, loadConversation, removeLastMessage } from '../utils/conversationHistory';
import { parseStudyPlan, formatStudyPlanConfirmation, isStudyPlanResponse } from '../utils/studyPlanParser';
import { detectConflicts, suggestScheduleAdjustments } from '../utils/scheduleConflictDetection';
import { TaskContext } from '../context/TaskContext';
import Bubble from '../components/chat/bubble';
import StudyPlanConfirmationModal from '../components/modals/StudyPlanConfirmationModal';

export default function ChatAi() {
  const navigation = useNavigation();
  const { addTask, getAllTasks, checkTimeConflict, loadTasks } = useContext(TaskContext);
  const [conversation, setConversation] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [conflictingTasks, setConflictingTasks] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    (async () => {
      await loadConversation();
      setConversation([ ...getConversation()]);
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      await loadConversation();
      setConversation([ ...getConversation()]);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (conversation.length > 0) {
      setTimeout(() => scrollToEnd(), 100);
    }
  }, [conversation]);

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => scrollToEnd(), 100);
      }
    );
    return () => {
      keyboardShowListener.remove();
    };
  }, []);

  // ============= Handle Sending Messages ============= //
  const handleSend = useCallback( async () => {
    if (messageText === '') return;

    const text = messageText;
    
    const isApproval = pendingPlan && (
      text.toLowerCase().includes('yes') ||
      text.toLowerCase().includes('approve') ||
      text.toLowerCase().includes('add it') ||
      text.toLowerCase().includes('looks good') ||
      text.toLowerCase().includes('perfect') ||
      text.toLowerCase().includes('ok') ||
      text.toLowerCase().includes('confirm')
    );

    const isRejection = pendingPlan && (
      text.toLowerCase().includes('no') ||
      text.toLowerCase().includes('reject') ||
      text.toLowerCase().includes('modify') ||
      text.toLowerCase().includes('change') ||
      text.toLowerCase().includes('different')
    );

    try {
      setLoading(true);
      await addUserMessage(messageText)
      setMessageText('');
      setConversation([ ...getConversation() ]);
      
      setTimeout(() => scrollToEnd(), 100);

      if (isApproval) {
        const existingTasks = getAllTasks();
        const conflicts = detectConflicts(pendingPlan, existingTasks);
        setConflictingTasks(conflicts.map(c => c.existingTask));
        setPlanModalVisible(true);
        setLoading(false);
        return;
      }

      if (isRejection) {
        setPendingPlan(null);
        setConflictingTasks([]);
      }

      try {
        const response = await makeChatRequest();
        
        if (response && isStudyPlanResponse(response)) {
          try {
            const parsedTasks = parseStudyPlan(response);
            
            if (parsedTasks && parsedTasks.length > 0) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              const validTasks = parsedTasks.filter(task => {
                const taskDate = new Date(task.date);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate >= today;
              });
              
              if (validTasks.length > 0) {
                setPendingPlan(validTasks);
                const promptMsg = `\n📋 **Study Plan Generated!**\n\nIf you want to adjust something, let me know what you'd like to change.\n\nIf you're satisfied with the plan:\n✅ Type **'yes'** to add this to your calendar\n\nIf you'd like a different plan:\n❌ Type **'no'** and I'll create a new suggestion\n\nWhat would you like to do?`;
                await addAssistantMessage(promptMsg);
                setConversation([ ...getConversation() ]);
                setTimeout(() => scrollToEnd(), 100);
              }
            }
          } catch (parseError) {
            console.log('Failed to parse study plan:', parseError);
          }
        }
        
        setConversation([ ...getConversation() ]);
        setTimeout(() => scrollToEnd(), 100);
      } catch (chatError) {
        await removeLastMessage();
        setConversation([ ...getConversation() ]);
        setMessageText(text);
        Alert.alert('Connection Error', 'Failed to get response from AI.');
      }
    } catch (error) {
      console.log('Sending Message Failed', error);
      setMessageText(text);
    }
    finally {
      setConversation([ ...getConversation() ]);
      setLoading(false);
      setTimeout(() => scrollToEnd(), 100);
    }
  }, [messageText, getAllTasks]);

  // =============== Handle Reset ================= //
  const handleReset = async () => {
    setConversation([]);
    await resetConversation();
    setConversation([ ...getConversation() ]);
  }

  // =============== Handle Study Plan Approval ================= //
  const handleApprovePlan = async (tasksToAdd) => {
    try {
      const addedTasks = [];
      tasksToAdd.forEach(task => {
        const formattedTask = {
          title: task.title || 'Untitled Task',
          description: task.description || '',
          date: task.date, 
          day: task.day || getDayFromDate(task.date),
          startTime: task.startTime || '09:00 AM',
          endTime: task.endTime || '10:00 AM',
          priority: task.priority || 'Medium',
          taskType: task.taskType || 'Study',
        };
        const addedTask = addTask(formattedTask);
        addedTasks.push(addedTask);
      });

      const taskList = addedTasks.map(t => {
        if (t.taskType === 'Deadline') {
          return `- ${t.title} on ${t.date} (Deadline: ${t.endTime})`;
        }
        return `- ${t.title} on ${t.date} from ${t.startTime} to ${t.endTime}`;
      }).join('\n');
      
      const confirmationMsg = `Perfect! I've added the study plan to my calendar. The following tasks have been scheduled:\n${taskList}`;
      await addUserMessage(confirmationMsg);
      setConversation([ ...getConversation() ]);

      setPlanModalVisible(false);
      setPendingPlan(null);
      setConflictingTasks([]);
      await loadTasks();

      Alert.alert('Success', `${addedTasks.length} task${addedTasks.length > 1 ? 's' : ''} added to your calendar!`);
    } catch (error) {
      console.error('Failed to approve plan:', error);
      Alert.alert('Error', 'Failed to add study plan to calendar');
    }
  };

  const getDayFromDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const handleRejectPlan = async () => {
    const rejectMsg = 'I would like a different study plan. Please create a new schedule with adjustments.';
    try {
      await addUserMessage(rejectMsg);
      setConversation([ ...getConversation() ]);
      setPlanModalVisible(false);
      setPendingPlan(null);
      setConflictingTasks([]);
      
      setLoading(true);
      try {
        await makeChatRequest();
        setConversation([ ...getConversation() ]);
      } catch (chatError) {
        await removeLastMessage();
        setConversation([ ...getConversation() ]);
        setMessageText(rejectMsg);
        Alert.alert('Connection Error', 'Failed to get response from AI.');
      } finally {
        setLoading(false);
      }
    } catch (error) {
      setMessageText(rejectMsg);
      Alert.alert('Error', 'Failed to send rejection message.');
    }
  };

  const scrollToEnd = () => {
    if (listRef.current) {
      listRef.current.scrollToEnd({ animated: true });
    }
  };

  const displayable = conversation.filter(c => c.role !== 'system'); 

  // ============== 1. HEADER COMPONENT FOR FLATLIST ============= //
  // We move the Hero section here so it becomes part of the scrollable list
  const renderListHeader = () => (
    <View style={styles.chatHeroWrap}>
      <Image
        source={require('../assests/images/tomo-logo.png')}
        style={styles.chatHeroImage}
        resizeMode="contain"
      />
      <Text style={styles.chatHeroTitle}>Hi! I’m Tomo!</Text>
      <Text style={styles.chatHeroSubtitle}>Your AI Class Schedule Optimizer Companion</Text>
      <Text style={styles.chatHeroCaption}>How Can I Assist You Today?</Text>

      {/* Show empty state message inside header if chat is empty */}
      {!loading && displayable.length === 0 &&
        <View style={styles.emptyChatWindow}>
          <FontAwesome5 name='lightbulb' size={35} color='#2e0000' />
          <Text style={styles.emptyChatWindowText}>Type a Message to get Started!</Text>
        </View>
      }
    </View>
  );

  return (
    <ImageBackground
      source={require('../assests/images/gradient-bg.png')}
      style={[styles.container, { paddingTop: 0 }]}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // Adjust offset if needed, but 'height' usually works best on Android
      >
        <View style={{ flex: 1, paddingTop: 15 }}>
          
          {/* ----- Navigation Header (Kept Fixed so you can always go back) ----- */}
          <View style={[styles.headerRow, { marginHorizontal: 25, marginBottom: 6, paddingTop: 18 }]}>
            <View style={styles.leftHeader}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <FontAwesome5 name="angle-left" size={22} color="#461F04" />
              </TouchableOpacity>
            </View>

            <View style={styles.titleWrap}>
              <Text style={styles.headerTitle}>Tomo Time</Text>
            </View>

            <TouchableOpacity onPress={handleReset}>
              <FontAwesome name="trash" size={25} color="#BE1C1C" />
            </TouchableOpacity>
          </View>

          {/* ----- Chat Window ----- */}
          {/* We removed the fixed Hero section and put it inside the FlatList below */}
          <View style={styles.chatWindow}>
            <FlatList
              ref={listRef}
              data={conversation}
              // 2. Add the Header Component here
              ListHeaderComponent={renderListHeader} 
              renderItem={(itemData) => {
                const convoItem = itemData.item;
                const { role, content } = convoItem;
                if (role === 'system') return null;
                return <Bubble text={content} type={role} />
              }}
              contentContainerStyle={{ padding: 14, paddingBottom: 20 }} // Reduced bottom padding
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={scrollToEnd}
              onLayout={scrollToEnd}
            />
          </View>

          { loading && 
            <View style={{ paddingHorizontal: 20 }}>
              <Bubble text='Loading...' />
            </View>
          }

          {/* ----- Input ----- */}
          <View style={styles.chatInputRow}>
            <TextInput
              value={messageText}
              onChangeText={(text) => setMessageText(text)}
              placeholder="What would you like to do?"
              placeholderTextColor="#b87b3d"
              style={styles.chatInput}
              editable={!loading}
            />
            <TouchableOpacity 
              onPress={handleSend} 
              activeOpacity={0.8}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#CCCCCC', '#999999'] : ['#FF5F6D', '#FFC371']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={[styles.chatSendButton, loading && { opacity: 0.5 }]}
              >
                <FontAwesome5 name="arrow-up" size={18} color={loading ? "#666666" : "#9c440dff"} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <StudyPlanConfirmationModal
        visible={planModalVisible}
        tasks={pendingPlan || []}
        onApprove={handleApprovePlan}
        onReject={handleRejectPlan}
        conflictingTasks={conflictingTasks}
      />
    </ImageBackground>
  );
}