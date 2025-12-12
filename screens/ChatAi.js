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
  Alert
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
// Note: Data isolation is handled through conversationHistory and TaskContext utilities

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

  // Reload conversation when screen gets focus (in case user updated preferences)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      await loadConversation();
      setConversation([ ...getConversation()]);
    });

    return unsubscribe;
  }, [navigation]);

  // Auto-scroll when conversation changes
  useEffect(() => {
    if (conversation.length > 0) {
      setTimeout(() => scrollToEnd(), 100);
    }
  }, [conversation]);

  // ============= Handle Sending Messages ============= //
  const handleSend = useCallback( async () => {
    if (messageText === '') return;

    const text = messageText;
    
    // Check if user is approving a pending plan
    const isApproval = pendingPlan && (
      text.toLowerCase().includes('yes') ||
      text.toLowerCase().includes('approve') ||
      text.toLowerCase().includes('add it') ||
      text.toLowerCase().includes('looks good') ||
      text.toLowerCase().includes('perfect') ||
      text.toLowerCase().includes('ok') ||
      text.toLowerCase().includes('confirm')
    );

    // Check if user is rejecting/modifying a pending plan
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
      
      // Scroll to end after adding user message
      setTimeout(() => scrollToEnd(), 100);

      // If user is approving a pending plan, show the modal
      if (isApproval) {
        const existingTasks = getAllTasks();
        const conflicts = detectConflicts(pendingPlan, existingTasks);
        setConflictingTasks(conflicts.map(c => c.existingTask));
        setPlanModalVisible(true);
        setLoading(false);
        return;
      }

      // If user is rejecting, clear the pending plan and continue conversation
      if (isRejection) {
        setPendingPlan(null);
        setConflictingTasks([]);
        // Continue to get AI response for modification
      }

      try {
        const response = await makeChatRequest();
        
        // Check if AI response contains a study plan
        if (response && isStudyPlanResponse(response)) {
          try {
            const parsedTasks = parseStudyPlan(response);
            
            if (parsedTasks && parsedTasks.length > 0) {
              // Validate that no tasks are in the past
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              const validTasks = parsedTasks.filter(task => {
                const taskDate = new Date(task.date);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate >= today;
              });
              
              if (validTasks.length !== parsedTasks.length) {
                const removedCount = parsedTasks.length - validTasks.length;
                console.warn(`⚠️ Removed ${removedCount} past task(s) from study plan`);
                
                // Notify user if tasks were removed
                if (validTasks.length === 0) {
                  await addUserMessage('The study plan contained only past dates. Please create a new plan with future dates.');
                  setConversation([ ...getConversation() ]);
                } else if (removedCount > 0) {
                  // Add a silent note that some tasks were filtered
                  console.log(`Proceeding with ${validTasks.length} valid future tasks`);
                }
              }
              
              if (validTasks.length > 0) {
                // Store plan and add clear confirmation prompt
                setPendingPlan(validTasks);
                
                // Add clear approval/rejection instructions
                const promptMsg = `\n📋 **Study Plan Generated!**\n\nIf you want to adjust something, let me know what you'd like to change.\n\nIf you're satisfied with the plan:\n✅ Type **'yes'** to add this to your calendar\n\nIf you'd like a different plan:\n❌ Type **'no'** and I'll create a new suggestion\n\nWhat would you like to do?`;
                await addAssistantMessage(promptMsg);
                setConversation([ ...getConversation() ]);
                
                // Scroll to show the prompt
                setTimeout(() => scrollToEnd(), 100);
              }
            }
          } catch (parseError) {
            console.log('Failed to parse study plan:', parseError);
          }
        }
        
        // Scroll to end after AI response
        setConversation([ ...getConversation() ]);
        setTimeout(() => scrollToEnd(), 100);
      } catch (chatError) {
        // Remove the failed user message from conversation history
        await removeLastMessage();
        setConversation([ ...getConversation() ]);
        
        // Restore the message to the input box
        setMessageText(text);
        
        // Show error alert
        Alert.alert(
          'Connection Error',
          'Failed to get response from AI. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
        
        console.log('Chat request failed:', chatError);
      }
    } catch (error) {
      console.log('Sending Message Failed', error);
      setMessageText(text); //If error, put the message again in the input box
    }
    finally {
      setConversation([ ...getConversation() ]);
      setLoading(false);
      // Ensure scroll to end after final state update
      setTimeout(() => scrollToEnd(), 100);
    }

  }, [messageText, getAllTasks]);
  // ============= End of Handle Sending Messages ============= //

  // =============== Handle Reset ================= //
  const handleReset = async () => {
    setConversation([]);
    await resetConversation();
    setConversation([ ...getConversation() ]);
  }
  // ============ End of Handle Reset ============ //

  // =============== Handle Study Plan Approval ================= //
  const handleApprovePlan = async (tasksToAdd) => {
    try {
      console.log('Approving plan with tasks:', JSON.stringify(tasksToAdd, null, 2));
      // Format and add each task to the calendar
      const addedTasks = [];
      
      tasksToAdd.forEach(task => {
        // Ensure task has all required fields in the correct format
        const formattedTask = {
          title: task.title || 'Untitled Task',
          description: task.description || '',
          date: task.date, // Already in YYYY-MM-DD format
          day: task.day || getDayFromDate(task.date),
          startTime: task.startTime || '09:00 AM',
          endTime: task.endTime || '10:00 AM',
          priority: task.priority || 'Medium',
          taskType: task.taskType || 'Study',
        };
        
        console.log('Adding task to calendar:', JSON.stringify(formattedTask, null, 2));
        const addedTask = addTask(formattedTask);
        console.log('Task added with ID:', addedTask.taskId);
        addedTasks.push(addedTask);
      });

      // Send confirmation message to AI
      const taskList = addedTasks.map(t => {
        if (t.taskType === 'Deadline') {
          return `- ${t.title} on ${t.date} (Deadline: ${t.endTime})`;
        }
        return `- ${t.title} on ${t.date} from ${t.startTime} to ${t.endTime}`;
      }).join('\n');
      
      const confirmationMsg = `Perfect! I've added the study plan to my calendar. The following tasks have been scheduled:\n${taskList}`;
      await addUserMessage(confirmationMsg);
      setConversation([ ...getConversation() ]);

      // Reset modal state
      setPlanModalVisible(false);
      setPendingPlan(null);
      setConflictingTasks([]);

      // Reload tasks to ensure UI is updated
      await loadTasks();

      Alert.alert('Success', `${addedTasks.length} task${addedTasks.length > 1 ? 's' : ''} added to your calendar!`);
    } catch (error) {
      console.error('Failed to approve plan:', error);
      Alert.alert('Error', 'Failed to add study plan to calendar');
    }
  };

  // Helper function to get day name from date string
  const getDayFromDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const handleRejectPlan = async () => {
    const rejectMsg = 'I would like a different study plan. Please create a new schedule with adjustments.';
    
    try {
      // Add rejection message to conversation
      await addUserMessage(rejectMsg);
      setConversation([ ...getConversation() ]);
      
      setPlanModalVisible(false);
      setPendingPlan(null);
      setConflictingTasks([]);
      
      // Trigger AI to create new plan
      setLoading(true);
      try {
        await makeChatRequest();
        setConversation([ ...getConversation() ]);
      } catch (chatError) {
        // Remove the failed rejection message from conversation history
        await removeLastMessage();
        setConversation([ ...getConversation() ]);
        
        // Restore the rejection message to the input box for re-entering
        setMessageText(rejectMsg);
        
        // Show error alert
        Alert.alert(
          'Connection Error',
          'Failed to get response from AI. Your rejection message has been restored to the input box. Please try again.',
          [{ text: 'OK' }]
        );
        
        console.error('Failed to get new plan:', chatError);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to reject plan:', error);
      // Restore the rejection message to the input box
      setMessageText(rejectMsg);
      Alert.alert(
        'Error',
        'Failed to send rejection message. The message has been restored to the input box. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  // ============ End of Handle Study Plan Approval ============ //

  // ============ Handle Scroll-to-End Animation =========== //
  const scrollToEnd = () => {
    if (listRef.current) {
      listRef.current.scrollToEnd({ animated: true });
    }
  };
  // ============ End of Handle Scroll-to-End Animation =========== //


  const displayable = conversation.filter(c => c.role !== 'system'); // To exclude the system message from the display

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

            <TouchableOpacity onPress={handleReset}>
              <FontAwesome 
                name="trash" 
                size={25} 
                color="#BE1C1C" 
              />
            </TouchableOpacity>
            {/* <LinearGradient
              colors={['#FF3F41', '#FFBE5B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientContainer}
            >
              <View style={styles.profileCircle}>
                <FontAwesome name="user-o" size={18} color="#BE1C1C" />
              </View>
            </LinearGradient> */}
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

            {!loading && displayable.length === 0 &&
              <View style={styles.emptyChatWindow}>
                <FontAwesome5 name='lightbulb' size={35} color='#2e0000' />
                <Text style={styles.emptyChatWindowText}>Type a Message to get Started!</Text>
              </View>
            }
            <FlatList
              ref={listRef}
              data={conversation}
              renderItem={(itemData) => {
                const convoItem = itemData.item;
                const { role, content } = convoItem;

                if (role === 'system') return null;

                return <Bubble
                    text={content}
                    type={role}
                  />
              }}
              contentContainerStyle={{ padding: 14, paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToEnd}
              onLayout={scrollToEnd}
            />
          </View>

          { //If there is time, let's add a loading gif 3:33:00 https://www.youtube.com/watch?v=42pSa8BkzWA
            loading && 
            <View>
              <Bubble 
                text='Loading...'
              />
            </View>
          }

          {/* Input */}
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

