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
import styles from '../../styles/modalStyles';

export default function AddClassScheduleModal({visible, onClose, onAdd}) {
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(null);
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:00');

  function handleAdd() {
    const payload = {
      title: title || 'Untitled Class',
      day: day || new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      startTime: parseInt(startTime, 10) || 0,
      endTime: parseInt(endTime, 10) || 0,
    };
    if (onAdd) onAdd(payload);
    // reset
    setTitle('');
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
                <TextInput
                  value={startTime}
                  onChangeText={setStartTime}
                  keyboardType="numeric"
                  style={styles.smallInput}
                  maxLength={2}
                />
              </View>
              <View style={styles.smallInputWrap}>
                <Text style={styles.smallLabel}>End Time</Text>
                <TextInput
                  value={endTime}
                  onChangeText={setEndTime}
                  keyboardType="numeric"
                  style={styles.smallInput}
                  maxLength={2}
                />
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

