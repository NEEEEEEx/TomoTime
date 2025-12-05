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

export default function EditTaskModal({visible, onClose, onSave, initial}) {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [priority, setPriority] = useState(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

//================= Load Initial Data ==============//
  useEffect(() => {
    if (initial) {
      setTitle(initial.title || "");
      setDescription(initial.description || "");
      setPriority(initial.priority || null);
  
      // Convert strings to JS Dates
      if (initial.date) 
        setDate(new Date(initial.date));
      if (initial.startTime) 
        setStartTime(new Date(`${initial.date}T${initial.startTime}`));
      if (initial.endTime) 
        setEndTime(new Date(`${initial.date}T${initial.endTime}`));
    }
  }, [initial, visible]);
//=============== End of Load Initial Data ================//
  
  function handleSave() {
    onSave({
      taskId: initial.taskId, title, description, priority,
      date: date.toISOString().split("T")[0], // yyyy-mm-dd
      startTime: formatTime(startTime),
      endTime: formatTime(endTime)
    });
  }
  
  const priorityLevels = [
    {key:'1', value:'Low'},
    {key:'2', value:'Medium'},
    {key:'3', value:'High'},
  ];

  //============ Date and Time Pickers =========//

  // Start Time Picker
  const openStartTimePicker = () => {
    DateTimePickerAndroid.open({
      value: startTime,
      onChange: (event, selectedTime) => {
        if (selectedTime) 
          setStartTime(selectedTime);
      },
      mode: 'time',
      is24Hour: false
    });
  };
  
  // End Time Picker
  const openEndTimePicker = () => {
    DateTimePickerAndroid.open({
      value: endTime,
      onChange: (event, selectedTime) => {
        if (selectedTime) 
          setEndTime(selectedTime);
      },
      mode: 'time',
      is24Hour: false
    });
  };

  // Date Picker
  const openDatePicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: (event, selectedDate) => {
        if (selectedDate)
          setDate(selectedDate);
        },
      mode: 'date',
    });
  };
  //============ End of Date and Time Pickers =========//

  //============ Date and Time Formatting Helpers =========//
  const formatDate = d => d?.toLocaleDateString() || 'Select date';
  const formatTime = t => t?.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }) ||
  'Select time';
  //============ End of Date and Time Formatting Helpers =========//

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Edit Task</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <FontAwesome name="times" size={18} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>Edit your Task details</Text>

            <Text style={styles.label}>Task Name</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              placeholderTextColor="#bfbfbf"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              placeholderTextColor="#bfbfbf"
            />

            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.input} onPress={openDatePicker}>
              <Text style={styles.label}>{formatDate(date)}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Priority Level</Text>
            <SelectList
              data={priorityLevels}
              value={priority}
              setSelected={setPriority}
              defaultOption={priorityLevels.find(p => p.value === priority)}
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
