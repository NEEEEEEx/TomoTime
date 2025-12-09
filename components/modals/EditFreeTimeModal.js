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
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import styles from '../../styles/modalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function EditFreeTimeModal({visible, onClose, onSave, initial}) {
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  const parseTimeString = (timeString) => {
    if (!timeString) return new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date;
  };

  useEffect(() => {
    if (initial) {
      setDay(initial.title ?? '');
      // Parse time from "HH:MM - HH:MM" or separate startTime/endTime fields
      if (initial.startTime && initial.endTime) {
        setStartTime(parseTimeString(initial.startTime));
        setEndTime(parseTimeString(initial.endTime));
      } else if (initial.time) {
        const [start, end] = initial.time.split('-').map(s => s.trim());
        setStartTime(parseTimeString(start));
        setEndTime(parseTimeString(end));
      }
    } else {
      setDay('');
      setStartTime(new Date());
      setEndTime(new Date());
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

  const getDayName = (keyOrValue) => {
    // If it's already a day name, return it
    const dayByValue = days.find(d => d.value === keyOrValue);
    if (dayByValue) return keyOrValue;
    
    // If it's a key, get the value
    const dayByKey = days.find(d => d.key === keyOrValue);
    return dayByKey ? dayByKey.value : keyOrValue;
  };

  const formatTime = (date) => {
    if (!date || isNaN(date.getTime())) return '00:00';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const openStartTimePicker = () => {
    DateTimePickerAndroid.open({
      value: startTime,
      onChange: (event, selectedTime) => {
        if (selectedTime) setStartTime(selectedTime);
      },
      mode: 'time',
      is24Hour: true
    });
  };

  const openEndTimePicker = () => {
    DateTimePickerAndroid.open({
      value: endTime,
      onChange: (event, selectedTime) => {
        if (selectedTime) setEndTime(selectedTime);
      },
      mode: 'time',
      is24Hour: true
    });
  };

  function handleSave() {
    const dayName = getDayName(day) || initial?.title || new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const payload = {
      ...initial,
      title: dayName,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
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
              save="key"
              setSelected={setDay}
              defaultOption={days.find(d => d.value === initial?.title)}
              placeholder={getDayName(day) || 'Select a day...'}
              boxStyles={styles.input}
              inputStyles={{color: '#333'}}
              dropdownTextStyles={{color: '#333'}}
            />

            <View style={styles.rowInputs}>
              <View style={styles.smallInputWrap}>
                <Text style={styles.smallLabel}>Start Time </Text>
                <TouchableOpacity style={styles.smallInput} onPress={openStartTimePicker}>
                  <Text style={styles.smallLabel}>{formatTime(startTime)}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.smallInputWrap}>
                <Text style={styles.smallLabel}>End Time</Text>
                <TouchableOpacity style={styles.smallInput} onPress={openEndTimePicker}>
                  <Text style={styles.smallLabel}>{formatTime(endTime)}</Text>
                </TouchableOpacity>
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
