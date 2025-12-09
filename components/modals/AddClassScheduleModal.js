import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SelectList } from 'react-native-dropdown-select-list';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import styles from '../../styles/modalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddClassScheduleModal({visible, onClose, onAdd}) {
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

    const DAY = {
      '1': 'Monday',
      '2': 'Tuesday',
      '3': 'Wednesday',
      '4': 'Thursday',
      '5': 'Friday',
      '6': 'Saturday',
      '7': 'Sunday',
    };

  const formatTime = (date) => {
    if (!date || isNaN(date.getTime())) return '12:00 AM';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const openStartTimePicker = () => {
    DateTimePickerAndroid.open({
      value: startTime,
      onChange: (event, selectedTime) => {
        if (selectedTime) setStartTime(selectedTime);
      },
      mode: 'time',
      is24Hour: false
    });
  };

  const openEndTimePicker = () => {
    DateTimePickerAndroid.open({
      value: endTime,
      onChange: (event, selectedTime) => {
        if (selectedTime) setEndTime(selectedTime);
      },
      mode: 'time',
      is24Hour: false
    });
  };

  function handleAdd() {
    const dayName = DAY[day] || 'Unknown Day';
    const payload = {
      title: title || 'Untitled Class',
      day: dayName,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
    };
    if (onAdd) onAdd(payload);
    // reset
    setTitle('');
    setDay('');
    setStartTime(new Date());
    setEndTime(new Date());
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Add New Class</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <FontAwesome name="times" size={18} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>Enter Your Class Details Manually</Text>

            <Text style={styles.label}>Class Name</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Math 101"
              style={styles.input}
              placeholderTextColor="#bfbfbf"
            />

            <Text style={styles.label}>Day</Text>
            <SelectList
              data={[
                {key:'1', value:'Monday'},
                {key:'2', value:'Tuesday'},
                {key:'3', value:'Wednesday'},
                {key:'4', value:'Thursday'},
                {key:'5', value:'Friday'},
                {key:'6', value:'Saturday'},
                {key:'7', value:'Sunday'},
              ]}
              value={day}
              setSelected={setDay}
              placeholder="Select a day..."
              boxStyles={styles.input}
              inputStyles={{color: '#000000ff'}}
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

            <TouchableOpacity activeOpacity={0.9} onPress={handleAdd} style={styles.addBtnWrap}>
              <LinearGradient colors={["#FF5A4A", "#FFB84E"]} style={styles.addBtn} start={{x:0,y:0}} end={{x:1,y:0}}>
                <Text style={styles.addBtnText}>Add Class</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

