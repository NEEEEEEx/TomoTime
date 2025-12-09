import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SelectList } from 'react-native-dropdown-select-list';
import styles from '../../styles/modalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function EditFreeTimeModal({visible, onClose, onSave, initial}) {
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:00');

        const formatTime = (text) => {
      const dataCleaning = text.replace(/[^\d]/g, '');

      if (dataCleaning.length === 4) {
        const hours = dataCleaning.substring(0, 2);
        const minutes = dataCleaning.substring(2, 4);

        const validHours = Math.min(23, parseInt(hours, 10)).toString().padStart(2, '0');
        const validMinutes = Math.min(59, parseInt(minutes, 10)).toString().padStart(2, '0');
        return `${validHours}:${validMinutes}`;
      }
      //return default 00:00
      return text.length > 0 ? text : '00:00';
    };

      const handleStartTimeChange = (text) => {
      setStartTime(text);

    };

    const handleEndTimeChange = (text) => {
      setEndTime(text);
    }

  useEffect(() => {
    if (initial) {
      setDay(initial.days ?? '');
      
      if (initial.time){
        const [start, end] = initial.time.split (' - ');
        setStartTime(start?.trim() ?? '00:00');
        setEndTime(end?.trim() ?? '00:00');
      } else {
        setStartTime('00:00');
        setEndTime('00:00');
      }

    } else {
      setDay('');
      setStartTime('00:00');
      setEndTime('00:00');
    }
  }, [initial, visible]);

  const days = [
    {key:'1', value:'Monday'},
    {key:'2', value:'Tuesday'},
    {key:'3', value:'Wednesday'},
    {key:'4', value:'Thursday'},
    {key:'5', value:'Friday'},
    {key:'6', value:'Saturday'},
    {key:'7', value:'Sunday'},
  ];

    const getDayName = (keyOrName) => {
      let dayObject = days.find(d => d.key === keyOrName);
      if(!dayObject) {
        dayObject = days.find(d => d.value === keyOrName);
      }
      return dayObject?.value;
    }
  function handleSave() {
    const dayName = getDayName(day) || initial?.day || new Date().toLocalDateString('en-US', {weekday: 'long'});
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);

    const payload = {
      ...initial,
      day: dayName,
      time: `${formattedStartTime} - ${formattedEndTime}`,
    };
    if (onSave) onSave(payload);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Edit Free Time</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <FontAwesome name="times" size={18} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>Update available free time</Text>

            <Text style={styles.label}>Day</Text>
            <SelectList
              data={days}
              value={day}
              setSelected={setDay}
              defaultOption={{key: days.find(d=>d.value===day)?.key, value: day}}
              placeholder={day || 'Select a day...'}
              boxStyles={styles.input}
              inputStyles={{color: '#333'}}
              dropdownTextStyles={{color: '#333'}}
            />

            <View style={styles.rowInputs}>
              <View style={styles.smallInputWrap}>
                <Text style={styles.smallLabel}>Start Time </Text>
                <TextInput
                  value={startTime}
                  onChangeText={handleStartTimeChange}
                  keyboardType="numeric"
                  style={styles.smallInput}
                  maxLength={5}
                  onBlur={() => setStartTime(formatTime(startTime))}
                />
              </View>
              <View style={styles.smallInputWrap}>
                <Text style={styles.smallLabel}>End Time</Text>
                <TextInput
                  value={endTime}
                  onChangeText={handleEndTimeChange}
                  keyboardType="numeric"
                  style={styles.smallInput}
                  maxLength={5}
                  onBlur={() => setEndTime(formatTime(endTime))}
                />
              </View>
            </View>

            <TouchableOpacity activeOpacity={0.9} onPress={handleSave} style={styles.addBtnWrap}>
              <LinearGradient colors={["#FF5A4A", "#FFB84E"]} style={styles.addBtn} start={{x:0,y:0}} end={{x:1,y:0}}>
                <Text style={styles.addBtnText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
