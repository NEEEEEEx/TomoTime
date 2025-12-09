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
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { SelectList } from 'react-native-dropdown-select-list';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from '../../styles/modalStyles';

export default function AddFreeTimeModal({visible, onClose, onAdd}) {
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:00');

  const DAY = {
      '1': 'Monday',
      '2': 'Tuesday',
      '3': 'Wednesday',
      '4': 'Thursday',
      '5': 'Friday',
      '6': 'Saturday',
      '7': 'Sunday',
    };

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
      return text;
    };

        const handleStartTimeChange = (text) => {
      setStartTime(text);

    };

    const handleEndTimeChange = (text) => {
      setEndTime(text);
    }

    //Wag galawin please. Nawawala yung display
  function handleAdd() {
    const dayName = DAY[day] || 'Unknown Day';
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);

    const payload = {
      title: dayName,
      time: `${formattedStartTime} - ${formattedEndTime}`,
    };
    if (onAdd) onAdd(payload);
    // reset
    setDay('');
    setStartTime('00:00');
    setEndTime('00:00');
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
              <Text style={styles.title}>Add Free Time Slot</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <FontAwesome name="times" size={18} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>Add your preferred Free Time Slot for Studying</Text>

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
              inputStyles={{color: '#333'}}
              dropdownTextStyles={{color: '#333'}}
              dropdownStyles={{borderColor: '#F9AA31'}}
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

            <TouchableOpacity activeOpacity={0.9} onPress={handleAdd} style={styles.addBtnWrap}>
              <LinearGradient colors={["#FF5A4A", "#FFB84E"]} style={styles.addBtn} start={{x:0,y:0}} end={{x:1,y:0}}>
                <Text style={styles.addBtnText}>Add Free Time</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

