import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import Octicons from 'react-native-vector-icons/Octicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/appStyles';
import { TaskContext } from '../context/TaskContext';
import { AuthContext } from '../context/AuthContext';
import EditTaskModal from '../components/modals/EditTaskModal';
import { getUserData } from '../utils/userStorage';
import { useFocusEffect } from '@react-navigation/native';

const PROFILE_PICTURE_KEY = 'profile_picture';


export default function CalendarPage () {
  const navigation = useNavigation();
  const { tasks, loadTasks, updateTask, deleteTask } = useContext(TaskContext);
  const { signOut, user } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [burgerMenuVisible, setBurgerMenuVisible] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  // Load tasks on component mount
  useEffect(() => {
    (async () => {
      console.log('CalendarPage: Loading tasks on mount');
      await loadTasks();
      console.log('CalendarPage: Tasks loaded, count:', tasks.length);
    })();
  }, []);

  // Load profile picture
  const loadProfilePicture = async () => {
    try {
      const picture = await getUserData(PROFILE_PICTURE_KEY);
      if (picture) {
        setProfilePicture(picture);
      } else if (user?.user?.photo) {
        setProfilePicture(user.user.photo);
      } else {
        setProfilePicture(null);
      }
    } catch (error) {
      console.error('Error loading profile picture:', error);
    }
  };

  // Reload tasks and profile picture when screen gains focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      console.log('CalendarPage: Screen focused, reloading tasks');
      await loadTasks();
      await loadProfilePicture();
      console.log('CalendarPage: Tasks reloaded, count:', tasks.length);
    });

    return unsubscribe;
  }, [navigation, loadTasks]);

  //=========== Burger Menu ============//
  const toggleBurgerMenu = () => {
    setBurgerMenuVisible(!burgerMenuVisible);
  }

  const handleMenuItemPress = (screen, stepIdx) => {
    setBurgerMenuVisible(false);

    navigation.navigate(screen, {initialStep: stepIdx});
  }
  //===================================//

  //=========== Profile Menu ============//
  const toggleProfileMenu = () => {
    setProfileMenuVisible(!profileMenuVisible);
  }

  const handleProfile = () => {
    setProfileMenuVisible(false);
    navigation.navigate('ProfilePage');
  }

  const handleLogout = async () => {
    setProfileMenuVisible(false);
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
  }
  //===================================//

  //=========== Initial Sample Data (can be removed once migration is complete) ===========//
  // These are kept for reference - actual tasks come from TaskContext
  const initialSampleTasks = [
    { 
      taskId: '11', 
      title: 'Quiz 1 - IIT414 (Part 1)', 
      description: 'Coverage: JS Basics, React Hooks, Async Storage', 
      date: '2025-12-02', 
      day: 'Saturday',
      startTime: '14:00',
      endTime: '15:00',
      priority: 'Medium',
      taskType: 'Study',
    },
    { 
      taskId: '12', 
      title: 'Break Time', 
      description: 'Short recharge between study blocks', 
      date: '2025-12-02', 
      day: 'Saturday',
      startTime: '15:00',
      endTime: '15:15',
      taskType: 'Break',
    },
    { 
      taskId: '13', 
      title: 'Project 1 - IIT414 (Part 1)', 
      description: 'Coverage: Virtual Assistant System Testing', 
      date: '2025-12-02', 
      day: 'Saturday',
      startTime: '15:15',
      endTime: '16:15',
      priority: 'High',
      taskType: 'Study',
    },
    { 
      taskId: '14', 
      title: 'Project 1 - IIT414 ', 
      description: 'Coverage: Virtual Assistant System Testing', 
      date: '2025-12-12', 
      day: 'Saturday',
      endTime: '23:59',
      priority: 'High',
      taskType: 'Deadline',
    },
  ];
  //==============================================//

  //=========== Task Type Color Identifiers ===========//
  const getTaskColors = (taskType) => {
    switch (taskType) {
      case 'Study':
        return {
          borderColor: '#FFBE5B',
          iconColor: '#FFBE5B',
          dotColor: '#FFBE5B'
        };
      case 'Break':
        return {
          borderColor: '#D3D3DD',
          iconColor: '#9B9BA8',
        };
      case 'Deadline':
        return {
          borderColor: '#FF8A8A',
          iconColor: '#FF8A8A',
          dotColor: '#FF8A8A',
        };
      default:
        return {
          borderColor: '#FFBE5B',
          iconColor: '#FFBE5B',
        };
    }
  };
  //==============================================//

  //=================== Task Handlers ====================//
  // Open/Close Modal Task Editor  
  const handleOpenEditTask = (item) => {
    setItemToEdit(item);
    setEditModalVisible(true);
  };

  // Save Task Edit Button
  const handleSaveTask = (saveData) => {
    updateTask(saveData.taskId, saveData);
    setItemToEdit(null); 
    setEditModalVisible(false);
  };

  // Delete Task Card from List
  const handleDeleteTask = (taskId) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', 
        onPress: () => deleteTask(taskId) }
    ]);
  };

  //=============== End of Task Handlers ================//

  //=========== Render Item for Task Cards ===========//
  const renderTaskItem = ({ item }) => {
    const {
      borderColor,
      iconColor,
    } = getTaskColors(item.taskType);

    return (
      <View style={[styles.cardWrapper, { borderColor }]}>
        <View style={styles.cardHeaderRow}>
          <Text
            style={[styles.cardTitle, { color: '#2C1F17' }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {item.priority && (
            <View
              style={{
                backgroundColor: '#FFFFFF',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  color: iconColor,
                  fontSize: 11,
                  fontWeight: '700',
                }}
              >
                {item.priority}
              </Text>
            </View>
          )}
        </View>

        <View style={{ marginTop: 10 }}>
          {item.description && (
            <Text
              style={{
                color: '#5E5D5D',
                marginBottom: 6,
              }}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          )}

          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>
              {item.date} | {item.day}
            </Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>
              {item.taskType === 'Deadline' ? 'Deadline' : 'Time'}
            </Text>
            <Text style={styles.timeValue}>
              {item.taskType === 'Deadline'
                ? item.endTime
                : `${item.startTime} - ${item.endTime}`}
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 10,
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity onPress={() => handleOpenEditTask(item)}>
            <FontAwesome5
              name="edit"
              size={16}
              color={iconColor}
              style={{ marginRight: 16 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
          onPress={() => handleDeleteTask(item.taskId)}>
            <FontAwesome
              name="trash"
              size={16}
              color={iconColor}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  //================== End of Render Item for Task Cards ================//

  //================== Filter Tasks by Selected Date ================//
  const filteredTasks = selectedDate
  ? tasks.filter(task => task.date === selectedDate)
  : tasks;
  
  console.log('CalendarPage: Selected date:', selectedDate);
  console.log('CalendarPage: Total tasks:', tasks.length);
  console.log('CalendarPage: Filtered tasks:', filteredTasks.length);
  console.log('CalendarPage: Filtered task details:', JSON.stringify(filteredTasks, null, 2));
  //============== End of Filter Tasks by Selected Date ================//

  //=========== Marked Dates for Calendar ===========//
  const markedDates = {};

  // Mark all tasks
  tasks.forEach(task => {
    const colors = getTaskColors(task.taskType);

    markedDates[task.date] = {
      marked: true,
      dotColor: colors.dotColor || '#FFBE5B',
    };
  });

  // Add selected date highlight
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...(markedDates[selectedDate] || {}),
      selected: true,
      selectedColor: '#ffbe5b',
    };
  }

  // ================= DISPLAY =================//
  return (
    <ImageBackground 
      source={require('../assests/images/gradient-bg.png')}
      style={[styles.container, { 
        paddingTop: 0,
        alignItems: 'center', 
      }]}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <ScrollView contentContainerStyle={{
        paddingTop: 25,
        paddingBottom: 15
      }}>
        <View style={{ paddingHorizontal: 24 }}>
          {/* ----- App Header (menu, title, profile) ----- */}
          <View style={styles.headerRow}>
            <View style={styles.leftHeader}>
              <TouchableOpacity onPress={toggleBurgerMenu}>
                <FontAwesome5 name="bars" size={22} color="#461F04" />
              </TouchableOpacity>
            </View>

            {/* -------- Burger Menu Dropdown -------- */}
            {burgerMenuVisible && (
              <View style={styles.burgerMenu}>
                <TouchableOpacity 
                  style={[styles.menuItem,{
                    borderBottomWidth: 1,
                    borderColor: '#3d060633'
                  }]} 
                  onPress={() => handleMenuItemPress('MultiStep', 0)}>
                  <Text style={styles.menuText}>Semester</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.menuItem,{
                    borderBottomWidth: 1,
                    borderColor: '#3d060633'
                  }]} 
                  onPress={() => handleMenuItemPress('MultiStep', 1)}>
                  <Text style={styles.menuText}>Class Schedule</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => handleMenuItemPress('MultiStep', 2)}>
                  <Text style={styles.menuText}>Free Time</Text>
                </TouchableOpacity>
              </View>
              
            )}

            <View style={styles.titleWrap}>
              <Text style={styles.headerTitle}>Tomo Time</Text>
            </View>
            
            <TouchableOpacity onPress={toggleProfileMenu}>
              <LinearGradient
                colors={['#FF5F6D', '#FFC371']} // Your gradient colors
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientContainer}
              >
                  <Image 
                    source={profilePicture ? { uri: profilePicture } : require('../assests/images/default-profile.jpg')} 
                    style={styles.profileCircle} 
                  />
              </LinearGradient>  
            </TouchableOpacity>
            
            {/* ---------- Profile Menu Dropdown ---------- */}
            {profileMenuVisible && (
              <View style={styles.profileMenu}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleProfile}>
                  <Text style={styles.menuText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleLogout}>
                  <Text style={styles.menuText}>Log out</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={{ alignItems: 'center' }}>
            {/* ----- Logo -----*/}
            <View style={styles.logoContainer}>
              <Image
                source={require('../assests/images/tomo-logo.png')}
                style={styles.appLogo}
                resizeMode="contain"
              />
            </View>

            {/* Title */}
            <Text
              style={[styles.sectionTitle, {
                fontSize: 28,
                marginBottom: 15,
                textAlign: 'center',
              }]}
            >
              AI Schedule Optimizer
            </Text>

            {/* ----- Description ----- */}
            <Text
              style={[styles.description, {
                fontSize: 15,
                marginBottom: 20,
                textAlign: 'center',
              }]}
            >
              Ask Tomo to add a task then create the perfect study schedule
              based on your classes and free time.
            </Text>

            {/* ----- Ask Tomo Button (gradient) -----*/}
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChatAi')}>
              <LinearGradient
                colors={['#FF3F41', '#FFBE5B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.buttonGradient, {
                  paddingVertical: 10,
                }]}
              >
                <Octicons
                  name="dependabot"
                  size={27}
                  color="#FFFFFF"
                  style={[styles.icons, {
                    marginRight: 10,
                  }]}
                />
                <Text style={styles.buttonText}>Ask Tomo</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* ----- Calendar -----*/}
            <Calendar
              style={styles.calendar}

              // Theme Customization
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: '#be1c1c',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#ffbe5b',
                dayTextColor: '#000000ff',
                textDisabledColor: '#d6b3b3ff',
                arrowColor: '#ffbe5b'
              }}
              // Specify the current date
              current={'2025-12-02'}
              // Callback that gets called when the user selects a day
              onDayPress={(day) => {
                // Toggle selection: if same day is pressed, deselect it
                setSelectedDate(prevDate => prevDate === day.dateString ? '' : day.dateString);
              }}
              // Mark specific dates as marked
              markedDates={markedDates}
            />
          </View>
        </View>
        {/* -------- Render Dynamic Task Cards List ------- */}
        {filteredTasks.map(task => (
          <View key={task.taskId}>
            {renderTaskItem({ item: task })}
          </View>
        ))}
        {/* -------- End of Dynamic Task Cards List -------- */}
      </ScrollView>

      <EditTaskModal
        visible={editModalVisible}
        onClose={()=>{
          setEditModalVisible(false); 
          setItemToEdit(null);
        }} 
        initial={itemToEdit} //This is passed to the modal (useEffect)
        onSave={handleSaveTask}
      />
    </ImageBackground>
  );
}