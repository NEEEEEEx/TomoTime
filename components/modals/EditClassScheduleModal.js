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
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SelectList } from 'react-native-dropdown-select-list';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import styles from '../../styles/modalStyles';

export default function EditClassScheduleModal({visible, onClose, onSave, initial}) {
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(null);
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
      setTitle(initial.title ?? '');
      const initialDayKey = days.find(d => d.value === initial.day)?.key;
      setDay(initialDayKey || null);
      setStartTime(parseTimeString(initial.startTime));
      setEndTime(parseTimeString(initial.endTime));
    } else {
      setTitle('');
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

  const getDayLabel = (key) => days.find(d => d.key === key)?.value;

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
    const dayLabel = getDayLabel(day) || initial?.day || new Date().toLocaleDateString('en-US', {weekday: 'long'});
    const payload = {
      ...initial,
      title: title || initial?.title || 'Untitled Class',
      day: dayLabel,
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
              <Text style={styles.title}>Edit Class</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <FontAwesome name="times" size={18} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>Update your class details</Text>

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
              data={days}
              setSelected={setDay}
              save="key"
              defaultOption={day ? {key: day, value: getDayLabel(day)} : null}
              placeholder={getDayLabel(day) || 'Select a day...'}
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
