import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import StepIndicator from 'react-native-step-indicator';
import styles from '../styles/appStyles';
import AddSemesterModal from '../components/modals/AddSemesterModal';
import AddClassScheduleModal from '../components/modals/AddClassScheduleModal';
import AddFreeTimeModal from '../components/modals/AddFreeTimeModal';
import EditSemesterModal from '../components/modals/EditSemesterModal';
import EditClassScheduleModal from '../components/modals/EditClassScheduleModal';
import EditFreeTimeModal from '../components/modals/EditFreeTimeModal';
import { 
  saveSemesterPreferences, 
  saveClassSchedule, 
  saveFreeTime,
  getSemesterPreferences,
  getClassSchedule,
  getFreeTime,
  saveSemesters,
  getSemesters,
  saveSelectedSemester,
  getSelectedSemester,
  saveClassScheduleForSemester,
  saveFreeTimeForSemester,
  getClassScheduleForSemester,
  getFreeTimeForSemester,
  updateStepValidation,
  getMultiStepValidation
} from '../utils/userPreferences';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';


//========= ASYNC STORAGE KEYS ===========//
const SEMESTERS_KEY = '@TomoTime:semester_key';
const CLASSES_KEY = '@TomoTime:classes_key';
const FREE_TIME_KEY = '@TomoTime:free_time_key';

//========= STEP  INDICATOR ==========//
const steps = [
  'Step 1 \nWhat is your Semester?', 
  'Step 2 \nWhat is your Class Schedule?', 
  'Step 3 \nWhen is your Vacant Time?'
];
//==================================//

//========= STEP INDICATOR STYLES ==========//
const stepsIndicatorStyles = {
  ///------ Unfinished Styles ------//
  stepStrokeUnFinishedColor: '#aaaaaa',
  separatorUnFinishedColor: '#aaaaaa',
  stepIndicatorUnFinishedColor: '#aaaaaa',
  stepIndicatorLabelFontSize: 13,
  stepIndicatorLabelUnFinishedColor: '#ffffffff',
  
  //------ Current styles ------//
  stepStrokeCurrentColor: '#ff9900ff',
  stepIndicatorCurrentColor: '#ff9900ff',
  currentStepIndicatorLabelFontSize: 17,
  currentStepLabelColor: '#ff9900ff',
  stepIndicatorLabelCurrentColor: '#ffffffff',
  currentStepStrokeWidth: 3,
  currentStepIndicatorSize: 40,
  
  //------ Finished Styles ------//
  stepStrokeFinishedColor: '#BE1C1C',
  separatorFinishedColor: '#BE1C1C',
  stepIndicatorFinishedColor: '#BE1C1C',
  stepIndicatorLabelFinishedColor: '#ffffffff',
  
  // ----- General Styles ----- //
  labelColor: '#BE1C1C',
  labelSize: 13,
  stepIndicatorSize: 25,
  separatorStrokeWidth: 3,
  stepStrokeWidth: 3,
};
//==================================//

export default function MultiStep({ navigation, route}) {

  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const { signOut } = useContext(AuthContext);
  const [semesters, setSemesters] = useState([]); //initialize as empty arrays
  const [classes, setClasses] = useState([]);
  const [freeTime, setFreeTime] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(0);// Step Indicator Posistion
  const [addModalVisible, setAddModalVisible] = useState(false); // Add New Item Modal Visibility
  const [editModalVisible, setEditModalVisible] = useState(false); // Edit Item Modal Visibility
  const [itemToEdit, setItemToEdit] = useState(null); // currently editing item
  const [loading, setLoading] = useState(true);
  const [stepValidation, setStepValidation] = useState({
    step0Complete: false,
    step1Complete: false,
    step2Complete: false
  });
  const { completeMultiStep } = useContext(AuthContext);

  //=========== Profile Menu ============//
    const toggleProfileMenu = () => {
      setProfileMenuVisible(!profileMenuVisible);
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
 

  //====== ASYNC STORAGE FUNCS -======//

  const storeData = async (key, value) => {
    try {
      const asyncValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, asyncValue);
      console.log(`Data stored in key success: ${key}`); //checks if json value is stored in asyncStorage
    } catch (error) {
      console.error(`Error saving data for: ${key}`, error);
    }
  };

  const getData = async (key, fallbackData) => {
    try {
      const asyncValue = await AsyncStorage.getItem(key);
      if (asyncValue != null) {
        return JSON.parse(asyncValue);
      } else {
        return fallbackData; //if there is nothing in storage use sample data
      }
    } catch (error) {
      console.error(`Error reading data for: ${key}`, error);
      return fallbackData;
    }
  };
  

  //=========== Sample Data for Each Step ===========//
  
  useEffect(() => {
    const sampleData = async () => {
      const sampleSemesters = [
    { id: '1', title: 'Semester 2025-2026', study: '60 min.', break: '15 min.', selected: true },
    { id: '2', title: 's.y. 2024-2025', study: '40 min.', break: '10 min.', selected: false },
    { id: '3', title: 'Sem 2023-2024', study: '40 min.', break: '10 min.', selected: false },
  ];

  
    const sampleClasses = [
      { id: '1',  title: 'ITECC',  day: 'Friday',    startTime: '8:00',  endTime: '13:00' },
      { id: '2',  title: 'ITS406', day: 'Wednesday', startTime: '13:30', endTime: '16:00' },
      { id: '3',  title: 'ITS406', day: 'Monday',    startTime: '13:30', endTime: '16:00' },
      { id: '4',  title: 'IIT413', day: 'Monday',    startTime: '16:30', endTime: '19:00' },
      { id: '5',  title: 'IIT413', day: 'Wednesday', startTime: '16:30', endTime: '19:00' },
      { id: '6',  title: 'IIT414', day: 'Saturday',  startTime: '7:30',  endTime: '12:30' },
      { id: '7',  title: 'IIT415', day: 'Tuesday',   startTime: '7:30',  endTime: '9:00' },
      { id: '8',  title: 'IIT415', day: 'Thursday',  startTime: '7:30',  endTime: '9:00' },
      { id: '9',  title: 'GEE2',   day: 'Tuesday',   startTime: '13:30', endTime: '15:00' },
      { id: '10', title: 'ITS405', day: 'Tuesday',   startTime: '17:00', endTime: '19:30' },
      { id: '11', title: 'GEE2',   day: 'Thursday',  startTime: '13:30', endTime: '15:00' },
      { id: '12', title: 'ITS405', day: 'Thursday',  startTime: '17:00', endTime: '19:30' },
    ];  
  
     const sampleFreeTime = [
      { id: '1', title: 'Monday', startTime: '7:30', endTime: '9:00' },
      { id: '2', title: 'Wednesday', startTime: '7:30', endTime: '9:00' },
      { id: '3', title: 'Friday', startTime: '14:00', endTime: '18:00' },
    ];
    
    // Load validation state
    const validation = await getMultiStepValidation();
    setStepValidation(validation);
    
    // Load semesters from new storage system
    const savedSemesters = await getSemesters();
    if (savedSemesters && savedSemesters.length > 0) {
      setSemesters(savedSemesters);
      
      // Load classes and free time for selected semester
      const selectedSemester = savedSemesters.find(s => s.selected);
      if (selectedSemester) {
        const semesterClasses = await getClassScheduleForSemester(selectedSemester.id);
        const semesterFreeTime = await getFreeTimeForSemester(selectedSemester.id);
        
        if (semesterClasses.length > 0) setClasses(semesterClasses);
        else setClasses(await getData(CLASSES_KEY, sampleClasses));
        
        if (semesterFreeTime.length > 0) setFreeTime(semesterFreeTime);
        else setFreeTime(await getData(FREE_TIME_KEY, sampleFreeTime));
      } else {
        setClasses(await getData(CLASSES_KEY, sampleClasses));
        setFreeTime(await getData(FREE_TIME_KEY, sampleFreeTime));
      }
    } else {
      // Use sample data if no semesters exist
      setSemesters(await getData(SEMESTERS_KEY, sampleSemesters));
      setClasses(await getData(CLASSES_KEY, sampleClasses));
      setFreeTime(await getData(FREE_TIME_KEY, sampleFreeTime));
    }

    setLoading(false);
  };
    sampleData();
}, []);

  //save semesters
  useEffect(() => {
    if (!loading)
    {
      storeData(SEMESTERS_KEY, semesters);
      saveSemesters(semesters);
      
      // Update step 0 validation if a semester is selected
      const hasSelectedSemester = semesters.some(s => s.selected);
      if (hasSelectedSemester && !stepValidation.step0Complete) {
        updateStepValidation(0, true).then(validation => {
          if (validation) setStepValidation(validation);
        });
      }
    }

  }, [semesters, loading]);

  //save classes
  useEffect(() => {
    if (!loading) {
      storeData(CLASSES_KEY, classes);
      
      // Save to selected semester
      const selectedSemester = semesters.find(s => s.selected);
      if (selectedSemester) {
        saveClassScheduleForSemester(selectedSemester.id, classes);
        
        // Update step 1 validation if classes exist
        if (classes.length > 0 && !stepValidation.step1Complete) {
          updateStepValidation(1, true).then(validation => {
            if (validation) setStepValidation(validation);
          });
        }
      }
    }
  }, [classes, loading]);
  
    //freetime
  useEffect(() => {
    if (!loading) {
      storeData(FREE_TIME_KEY, freeTime);
      
      // Save to selected semester
      const selectedSemester = semesters.find(s => s.selected);
      if (selectedSemester) {
        saveFreeTimeForSemester(selectedSemester.id, freeTime);
        
        // Update step 2 validation if free time exists
        if (freeTime.length > 0 && !stepValidation.step2Complete) {
          updateStepValidation(2, true).then(validation => {
            if (validation) setStepValidation(validation);
          });
        }
      }
    }
  }, [freeTime, loading]);
  //===========End of async storage funcs==========//


  //=========== Load Data from AsyncStorage on Mount ===========//
  useEffect(() => {
    (async () => {
      const savedSemester = await getSemesterPreferences();
      const savedClasses = await getClassSchedule();
      const savedFreeTime = await getFreeTime();

      if (savedClasses && savedClasses.length > 0) {
        setClasses(savedClasses);
      }
      
      if (savedFreeTime && savedFreeTime.length > 0) {
        setFreeTime(savedFreeTime);
      }
    })();
  }, []);

  //=========== Save Data to AsyncStorage when it changes ===========//
  useEffect(() => {
    const selectedSemester = semesters.find(s => s.selected);
    if (selectedSemester) {
      saveSemesterPreferences(selectedSemester);
    }
  }, [semesters]);

  useEffect(() => {
    if (classes.length > 0) {
      saveClassSchedule(classes);
    }
  }, [classes]);

  useEffect(() => {
    if (freeTime.length > 0) {
      saveFreeTime(freeTime);
    }
  }, [freeTime]);
  //================================================//

  //=========== Use Effect for Route Params ===========//
  //This is for Burger Menu Navigation to Specific Step
  useEffect(() => {
    const initial = route?.params?.initialStep;
    if (initial !== undefined && initial !== null) {
      // ensure number and within range 0..2
      const stepIndex = Math.max(0, Math.min(2, Number(initial)));
      setCurrentPosition(stepIndex);
    }
  }, [route?.params?.initialStep]);
  //================================================//
  
  //============ Steps Navigation ============//
  const goNext = async () => {
    // Validation for Step 0 (Semester)
    if (currentPosition === 0) {
      const hasSelectedSemester = semesters.some(s => s.selected);
      if (!hasSelectedSemester) {
        Alert.alert(
          'Semester Required',
          'Please create and select a semester before proceeding.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    
    // Validation for Step 1 (Classes)
    if (currentPosition === 1) {
      if (classes.length === 0) {
        Alert.alert(
          'Class Schedule Required',
          'Please add at least one class to your schedule before proceeding.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    
    // Validation for Step 2 (Free Time)
    if (currentPosition === 2) {
      if (freeTime.length === 0) {
        Alert.alert(
          'Free Time Required',
          'Please add at least one free time slot before proceeding.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // All steps complete - mark MultiStep as done and navigate
      console.log('All steps complete! Navigating to CalendarPage');
      await completeMultiStep();
      navigation.replace('CalendarPage');
      return;
    }
    
    // Move to next step
    if (currentPosition < 2) {
      setCurrentPosition(currentPosition + 1);
    }
  };
  
  const goBack = () => {
    if (currentPosition > 0) {
      setCurrentPosition(currentPosition - 1);
    }
  };
  //=========================================//

  // =========== Handlers for Selecting and Adding Items ============ //
  //============ Semester Handlers
  const handleSelectSemester = async (id) => { 
    setSemesters(prev => 
      prev.map(sem => ({ ...sem, selected: sem.id === id })) 
    );
    
    // Save selected semester
    await saveSelectedSemester(id);
    
    // Load classes and free time for this semester
    const semesterClasses = await getClassScheduleForSemester(id);
    const semesterFreeTime = await getFreeTimeForSemester(id);
    
    setClasses(semesterClasses);
    setFreeTime(semesterFreeTime);
  };

  const handleAddSemester = (payload) => {
    setSemesters(prev => [{ id: Date.now(), ...payload }, ...prev]);
  };

  const handleDeleteSemester = (id) => {
      // simple confirmation
      Alert.alert('Delete Semester', 'Are you sure you want to delete this semester?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => setSemesters(prev => prev.filter(sem => sem.id !== id)) }
      ]);
    };

  const handleOpenEditSemester = (item) => {
    setItemToEdit(item);
    setEditModalVisible(true);
  };

  const handleSaveSemester = (payload) => {
    setSemesters(prev => prev.map(s => (s.id == payload.id ? { ...s, ...payload } : s)));
    setItemToEdit(null);
    setEditModalVisible(false);
  };

  //============ Class Schedule Handlers
  const handleAddClassSchedule = (payload) => {
    setClasses(prev => [{ id: Date.now(), ...payload }, ...prev]);
  };

  const handleOpenEditClass = (item) => {
    setItemToEdit(item);
    setEditModalVisible(true);
  };

  const handleSaveClassSchedule = (payload) => {
    setClasses(prev => prev.map(c => (c.id == payload.id ? { ...c, ...payload } : c)));
    setItemToEdit(null);
    setEditModalVisible(false);
  };

  const handleDeleteClassSchedule = (id) => {
    Alert.alert('Delete Class', 'Are you sure you want to delete this class?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setClasses(prev => prev.filter(cls => cls.id !== id)) }
    ]);
  };

  //============ Free Time Handlers
  const handleAddFreeTime = (payload) => {
    setFreeTime(prev => [{ id: Date.now(), ...payload }, ...prev]);
  };

  const handleOpenEditFreeTime = (item) => {
    setItemToEdit(item);
    setEditModalVisible(true);
  };

  const handleSaveFreeTime = (payload) => {
    setFreeTime(prev => prev.map(f => (f.id == payload.id ? { ...f, ...payload } : f)));
    setItemToEdit(null);
    setEditModalVisible(false);
  };

  const handleDeleteFreeTime = (id) => {
    Alert.alert('Delete Free Time', 'Are you sure you want to delete this free time slot?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setFreeTime(prev => prev.filter(ft => ft.id !== id)) }
    ]);
  };

  // =========================================================== //

    
  // 1. Render Semester Card (Selectable)
  const renderSemesterItem = ({ item }) => {
    const studyTime = String(item.study).includes('min') ? item.study : `${item.study} min.`;
    const breakTime = String(item.break).includes('min') ? item.break : `${item.break} min.`;
    const isSelected = item.selected;
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => handleSelectSemester(item.id)}>
        <LinearGradient
          colors={isSelected ? ['#be1c1c', '#f9aa32'] : ['#fffefc', '#fffefc']}
          style={[styles.cardWrapper, isSelected && styles.cardSelected]} // Ensure styles.cardSelected exists or remove
        >
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, isSelected && { color: 'white' }]}>{item.title}</Text>
            {/* Edit/Trash Icons */}
            <View style={styles.rightIcons}>
              <TouchableOpacity onPress={() => handleOpenEditSemester(item)}>
                <FontAwesome5 
                  name="edit" 
                  size={16} 
                  color={isSelected ? 'white' : "#FFBE5B"} 
                  style={{ marginRight: 12 }} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>handleDeleteSemester(item.id)}>
                <FontAwesome 
                  name="trash" 
                  size={16} 
                  color={isSelected ? 'white' : "#FFBE5B"} 
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.timeLabel, isSelected && { color: 'white' }]}>
              Study: {studyTime} | Break: {breakTime}
              </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // 2. Render Class Schedule Card (Display Only)
  const renderClassItem = ({ item }) => (
    <View style={styles.cardWrapper}> 
      <View style={styles.cardHeaderRow}>
        <Text style={[styles.cardTitle, { color: '#000' }]}>
            {item.title}
        </Text>
        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={() => handleOpenEditClass(item)}>
            <FontAwesome5 
              name="edit" 
              size={16} 
              color="#FFBE5B" 
              style={{ marginRight: 12 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteClassSchedule(item.id)}>
            <FontAwesome 
            name="trash" 
            size={16} 
            color="#FFBE5B" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ marginTop: 5 }}>
        <Text style={{ color: '#333', fontWeight: 'bold' }}>
          Day: {item.day}
        </Text>
        <Text style={{ color: '#333' }}>
          Time: {item.startTime} - {item.endTime}
        </Text>
      </View>
    </View>
  );

  // 3. Render Free Time Card
  const renderFreeTimeItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <View style={styles.cardHeaderRow}>
        <Text style={[styles.cardTitle, { color: '#000' }]}>{item.title}</Text>
         <View style={styles.rightIcons}>
            <TouchableOpacity onPress={() => handleOpenEditFreeTime(item)}>
              <FontAwesome5 
                name="edit" 
                size={16} 
                color="#FFBE5B" 
                style={{ marginRight: 12 }} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteFreeTime(item.id)}>
              <FontAwesome 
                name="trash" 
                size={16} 
                color="#FFBE5B" 
              />
            </TouchableOpacity>
         </View>
      </View>
      <View style={{ marginTop: 5 }}>
        <Text style={{ color: '#333' }}>
          Time: {item.startTime} - {item.endTime}
        </Text>
      </View>
    </View>
  );


  // ============== DYNAMIC CONTENT SELECTOR ============== //
  const getStepContent = () => {
    switch (currentPosition) {
      case 0:
        return {
          title: "Semester",
          subtitle: "Create your preferred time duration of studying",
          data: semesters,
          renderItem: renderSemesterItem,
        };
      case 1:
        return {
          title: "Class Schedule",
          subtitle: "Manage your classes",
          data: classes,
          renderItem: renderClassItem,
        };
      case 2:
        return {
          title: "Available Free Time",
          subtitle: "Define when you're free to study",
          data: freeTime,
          renderItem: renderFreeTimeItem,
        };
      default:
        return null;
    }
  };
  //========================================================//

  const currentContent = getStepContent();

//=============== DISPLAY ===============//
  return (
    <ImageBackground
      source={require('../assests/images/gradient-bg.png')}
      style={[styles.container, {paddingTop: 25}]}
      imageStyle={{resizeMode: 'cover'}}
    >
      {/* -------- Header -------- */}
      <View style={styles.headerRow}>

        <View style={styles.leftHeader}>
          <Image source={require('../assests/images/tomo-logo.png')} style={styles.headerLogo} />
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle}>Tomo Time</Text>
        </View>

        {/* ----- Profile Circle ----- */}
        <TouchableOpacity onPress={toggleProfileMenu}>
          <LinearGradient
            colors={['#FF5F6D', '#FFC371']} // Your gradient colors
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientContainer}
          >
              <Image source={require('../assests/images/default-profile.jpg')} style={styles.profileCircle} />
          </LinearGradient>  
        </TouchableOpacity>
        {/* ----- End of Profile Circle ----- */}

        {profileMenuVisible && (
          <View style={styles.profileMenu}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleLogout}>
              <Text style={styles.menuText}>Log out</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* -------- End of Header -------- */}

      
      <View style={styles.stepWrap}>
        {/* -------- Step Indicator -------- */}
        <StepIndicator
          customStyles={stepsIndicatorStyles}
          currentPosition={currentPosition}
          labels={steps}
          stepCount={3}
        />
        {/* -------- End of Step Indicator -------- */}
        
        {/* -------- Navigation Buttons -------- */}
        <View style={styles.stepButtonsRow}>
          {currentPosition > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <Text style={styles.nextText}>Back</Text>
              <FontAwesome 
                name="angle-double-left" 
                size={18} 
                color="#fff" 
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.addButton} onPress={()=>setAddModalVisible(true)}> 
            <FontAwesome 
              name="plus" 
              size={18} 
              color="#fff" 
            />
            <Text style={styles.addText}> Add</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={goNext}>
            <Text style={styles.nextText}>Next </Text>
            <FontAwesome 
              name="angle-double-right" 
              size={18} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
        {/* -------- End of Steps Buttons -------- */}
      </View>
      
      {/* -------- Dynamic Section Title --------*/}
      <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionTitle}>{currentContent.title}</Text>
        <Text style={styles.sectionSubtitle}>{currentContent.subtitle}</Text>
      </View>
      {/* -------- End of Section Title --------*/}

      {/* -------- Dynamic Cards List -------- */}
      <FlatList
        data={currentContent.data}
        keyExtractor={(item) => String(item.id)}
        renderItem={currentContent.renderItem}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      />
      {/* -------- End of Dynamic Cards List -------- */}

      {/* -------- Add Modal -------- */}
      {currentPosition === 0 && 
        <AddSemesterModal 
          visible={addModalVisible} 
          onClose={()=>setAddModalVisible(false)} 
          onAdd={handleAddSemester} 
      />}
      {currentPosition === 1 && 
        <AddClassScheduleModal 
          visible={addModalVisible} 
          onClose={()=>setAddModalVisible(false)} 
          onAdd={handleAddClassSchedule}
      />}
      {currentPosition === 2 && 
        <AddFreeTimeModal 
          visible={addModalVisible} 
          onClose={()=>setAddModalVisible(false)} 
          onAdd={handleAddFreeTime}
      />}
      {/* -------- End of Add Modal -------- */}

      {/* -------- Edit Modal -------- */}
      {currentPosition === 0 && 
        <EditSemesterModal 
          visible={editModalVisible} 
          onClose={()=>{setEditModalVisible(false); setItemToEdit(null);}} 
          initial={itemToEdit} 
          onSave={handleSaveSemester} 
        />}
      {currentPosition === 1 && 
        <EditClassScheduleModal 
          visible={editModalVisible} 
          onClose={()=>{setEditModalVisible(false); setItemToEdit(null);}} 
          initial={itemToEdit} onSave={handleSaveClassSchedule}
      />}
      {currentPosition === 2 && 
        <EditFreeTimeModal 
          visible={editModalVisible} 
          onClose={()=>{setEditModalVisible(false); 
          setItemToEdit(null);}} 
          initial={itemToEdit} 
          onSave={handleSaveFreeTime}
      />}
      {/* -------- End of Edit Modal -------- */}
    </ImageBackground>
  );
};
