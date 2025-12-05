import React, { useState } from 'react';
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
import EditTaskModal from '../components/modals/EditTaskModal';


export default function CalendarPage () {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  //=========== Burger Menu ============//
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  }

  const handleMenuItemPress = (screen, stepIdx) => {
    setMenuVisible(false);

    navigation.navigate(screen, {initialStep: stepIdx});
  }
  //===================================//


  //=========== Sample Data for Tasks ===========//
  const [tasks, setTasks] = useState([
    { 
      taskId: '11', 
      title: 'Quiz 1 - IIT414 (Part 1)', 
      description: 'Coverage: JS Basics, React Hooks, Async Storage', 
      date: '2025-12-02', 
      day: 'Saturday',
      startTime: '14:00',
      endTime: '15:00',
      priority: 'Medium',
      taskType: 'Study', // Possible values: 'Study', 'Break', 'Deadline'
    },
    { 
      taskId: '12', 
      title: 'Break Time', 
      description: 'Short recharge between study blocks', 
      date: '2025-12-02', 
      day: 'Saturday',
      startTime: '15:00',
      endTime: '15:15',
      taskType: 'Break', // Possible values: 'Study', 'Break', 'Deadline'
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
      taskType: 'Study', // Possible values: 'Study', 'Break', 'Deadline'
    },
    { 
      taskId: '14', 
      title: 'Project 1 - IIT414 ', 
      description: 'Coverage: Virtual Assistant System Testing', 
      date: '2025-12-12', 
      day: 'Saturday',
      endTime: '23:59',
      priority: 'High',
      taskType: 'Deadline', // Possible values: 'Study', 'Break', 'Deadline'
    },
  ]);
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
    setTasks(prev =>
      prev.map(task => 
        task.taskId === saveData.taskId ? { ...task, ...saveData } : task
      ));
    setItemToEdit(null); 
    setEditModalVisible(false);
  };

  // Delete Task Card from List
  const handleDeleteTask = (taskId) => {
    Alert.alert('Delete Class', 'Are you sure you want to delete this class?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', 
        onPress: () => setTasks(prev => prev.filter(task => task.taskId !== taskId)) }
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
              <TouchableOpacity onPress={toggleMenu}>
                <FontAwesome5 name="bars" size={22} color="#461F04" />
              </TouchableOpacity>
            </View>

            {/* -------- Burger Menu Dropdown -------- */}
            {menuVisible && (
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

            <LinearGradient
              colors={['#FF3F41', '#FFBE5B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientContainer}
            >
              <View style={styles.profileCircle}>
                <FontAwesome5 name="user-alt" size={18} color="#BE1C1C" />
              </View>
            </LinearGradient>
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
            <TouchableOpacity style={styles.button}>
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
              }}
              // Specify the current date
              current={'2025-12-02'}
              // Callback that gets called when the user selects a day
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
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