import React, {useState} from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import styles from '../styles/appStyles';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import StepIndicator from 'react-native-step-indicator';
import appStyles from '../styles/appStyles';

const {width} = Dimensions.get('window');

//========= STEP INDICATOR ==========//
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

const sampleSemesters = [
  { id: '1', title: 'Semester 2025-2026', study: '60 min.', break: '15 min.', selected: true },
  { id: '2', title: 's.y. 2024-2025', study: '40 min.', break: '10 min.' },
  { id: '3', title: 'Sem 2023-2024', study: '40 min.', break: '10 min.' },
  { id: '4', title: 'year 2022-2023', study: '50 min.', break: '10 min.' },
];

export default function Semester() {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [semesters, setSemesters] = useState(sampleSemesters);

  const goNext = () => {
    if (currentPosition < 2) {
      setCurrentPosition(currentPosition + 1);
    }
  };
  const goBack = () => {
    if (currentPosition > 0) {
      setCurrentPosition(currentPosition - 1);
    }
  };

  // make a semester selectable: mark only the tapped semester as selected
  const selectSemester = (id) => {
    setSemesters(prev =>
      prev.map(s => ({ ...s, selected: s.id === id }))
    );
  };

  const renderSemCard = ({item, index}) => {
    const isSelected = !!item.selected;
    
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => selectSemester(item.id)}>
        <LinearGradient
          colors={isSelected ? ['#be1c1c', '#f9aa32'] : ['#fffefc', '#fffefc']}
          style={[styles.cardWrapper, isSelected && styles.cardSelected]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={[
              styles.cardTitle,
              isSelected && {color: 'white'}
            ]}>{item.title}</Text>
            <View style={styles.rightIcons}>
              <TouchableOpacity>
                <FontAwesome5 
                  name="edit" 
                  size={16} 
                  color={isSelected ? 'white' : "#FFBE5B"} 
                  style={{marginRight:12}} 
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <FontAwesome 
                  name="trash" 
                  size={16} 
                  color={isSelected ? 'white' : "#FFBE5B"} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.timeRow}>
              <Text style={[
                styles.timeLabel,
                isSelected && {color: 'white'}
              ]}>Study Time:</Text>
              <Text style={[
                styles.timeValue,
                isSelected && {color: 'white'}
              ]}>{item.study}</Text>
            </View>
            <View style={styles.timeRow}>
              <Text style={[
                styles.timeLabel,
                isSelected && {color: 'white'}
              ]}>Break Time:</Text>
              <Text style={[
                styles.timeValue,
                isSelected && {color: 'white'}
              ]}>{item.break}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

//=============== DISPLAY ===============//
  return (
    <ImageBackground
      source={require('../assests/images/gradient-bg.png')}
      style={[appStyles.container, {paddingTop: 25}]}
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
        
        {/* -------- Steps Buttons -------- */}
        <View style={styles.stepButtonsRow}>
          {currentPosition !== 0 && (
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <Text style={styles.nextText}>Back</Text>
              <FontAwesome name="angle-double-left" size={18} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.addButton}>
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
      
      {/* -------- Section Title --------*/}
      <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionTitle}>Semester</Text>
        <Text style={styles.sectionSubtitle}>Create your preferred time duration of studying and rest time</Text>
      </View>
      {/* -------- End of Section Title --------*/}

      {/* -------- Semester Cards List -------- */}
      <FlatList
        data={semesters}
        keyExtractor={(i) => i.id}
        renderItem={renderSemCard}
        contentContainerStyle={{
          paddingBottom:40, paddingHorizontal:20
        }}
        showsVerticalScrollIndicator={false}
      />
      {/* -------- End of Semester Cards List -------- */}
    </ImageBackground>
  );
}