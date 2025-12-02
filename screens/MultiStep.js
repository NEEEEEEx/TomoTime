import React, {useState} from 'react';
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


export default function MultiStep() {
  // =========== Use States ============ //
  const [currentPosition, setCurrentPosition] = useState(0);// Step Indicator Posistion
  
  const [addModalVisible, setAddModalVisible] = useState(false); // Add New Item Modal Visibility
  const [editModalVisible, setEditModalVisible] = useState(false); // Edit Item Modal Visibility
  const [itemToEdit, setItemToEdit] = useState(null); // currently editing item
  // =================================== //
  
  //=========== Sample Data for Each Step ===========//
  const [semesters, setSemesters] = useState([
    { id: '1', title: 'Semester 2025-2026', study: '60 min.', break: '15 min.', selected: true },
    { id: '2', title: 's.y. 2024-2025', study: '40 min.', break: '10 min.', selected: false },
    { id: '3', title: 'Sem 2023-2024', study: '40 min.', break: '10 min.', selected: false },
  ]);

  
  const [classes, setClasses] = useState([
    { id: '1', title: 'IIT415 - Software Engineer', day: 'Tuesday, Thursday', time: '7:30 - 9:00' },
    { id: '2', title: 'IIT414 - Mob. Prog.', day: 'Saturday', time: '7:30 - 12:30' },
  ]);
  
  const [freeTime, setFreeTime] = useState([
    { id: '1', title: 'Monday, Wednesday', time: '7:30 - 9:00' },
    { id: '2', title: 'Friday', time: '14:00 - 18:00' },
  ]);
  //================================================//

  //============ Steps Navigation ============//
  const goNext = () => {
    if (currentPosition < 2) {
      setCurrentPosition(currentPosition + 1);
    } else {
      console.log('Submit Form. Navigate to Main Page')// Handle Form Submission Here
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
  const handleSelectSemester = (id) => { 
    setSemesters(prev => 
    prev.map(sem => ({ ...sem, selected: sem.id === id })) 
    ); 
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
                <FontAwesome5 name="edit" size={16} color={isSelected ? 'white' : "#FFBE5B"} style={{ marginRight: 12 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>handleDeleteSemester(item.id)}>
                <FontAwesome name="trash" size={16} color={isSelected ? 'white' : "#FFBE5B"} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.timeLabel, isSelected && { color: 'white' }]}>Study: {item.study} | Break: {item.break}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // 2. Render Class Schedule Card (Display Only)
  const renderClassItem = ({ item }) => (
    <View style={styles.cardWrapper}> 
      <View style={styles.cardHeaderRow}>
        <Text style={[styles.cardTitle, { color: '#000' }]}>{item.title}</Text>
         <View style={styles.rightIcons}>
            <TouchableOpacity onPress={() => handleOpenEditClass(item)}>
              <FontAwesome5 name="edit" size={16} color="#FFBE5B" style={{ marginRight: 12 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteClassSchedule(item.id)}>
              <FontAwesome name="trash" size={16} color="#FFBE5B" />
            </TouchableOpacity>
         </View>
      </View>
      <View style={{ marginTop: 5 }}>
        <Text style={{ color: '#333', fontWeight: 'bold' }}>Day: {item.day}</Text>
        <Text style={{ color: '#333' }}>Time: {item.time}</Text>
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
              <FontAwesome5 name="edit" size={16} color="#FFBE5B" style={{ marginRight: 12 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteFreeTime(item.id)}>
              <FontAwesome name="trash" size={16} color="#FFBE5B" />
            </TouchableOpacity>
         </View>
      </View>
      <View style={{ marginTop: 5 }}>
        <Text style={{ color: '#333' }}>Time: {item.time}</Text>
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
        <TouchableOpacity>
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
              <FontAwesome name="angle-double-left" size={18} color="#fff" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.addButton} onPress={()=>setAddModalVisible(true)}> 
            <FontAwesome name="plus" size={18} color="#fff" />
            <Text style={styles.addText}> Add</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={goNext}>
            <Text style={styles.nextText}>Next </Text>
            <FontAwesome name="angle-double-right" size={18} color="#fff" />
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
      {currentPosition === 0 && <AddSemesterModal visible={addModalVisible} onClose={()=>setAddModalVisible(false)} onAdd={handleAddSemester} />}
      {currentPosition === 1 && <AddClassScheduleModal visible={addModalVisible} onClose={()=>setAddModalVisible(false)} onAdd={handleAddClassSchedule}/>}
      {currentPosition === 2 && <AddFreeTimeModal visible={addModalVisible} onClose={()=>setAddModalVisible(false)} onAdd={handleAddFreeTime}/>}
      {/* -------- End of Add Modal -------- */}

      {/* -------- Edit Modal -------- */}
      {currentPosition === 0 && <EditSemesterModal visible={editModalVisible} onClose={()=>{setEditModalVisible(false); setItemToEdit(null);}} initial={itemToEdit} onSave={handleSaveSemester} />}
      {currentPosition === 1 && <EditClassScheduleModal visible={editModalVisible} onClose={()=>{setEditModalVisible(false); setItemToEdit(null);}} initial={itemToEdit} onSave={handleSaveClassSchedule}/>}
      {currentPosition === 2 && <EditFreeTimeModal visible={editModalVisible} onClose={()=>{setEditModalVisible(false); setItemToEdit(null);}} initial={itemToEdit} onSave={handleSaveFreeTime}/>}
      {/* -------- End of Edit Modal -------- */}
    </ImageBackground>
  );
}