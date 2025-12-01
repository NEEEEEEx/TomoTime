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

export default function EditFreeTimeModal({visible, onClose, onSave, initial}) {
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (initial) {
      setDay(initial.day ?? '');
      setTime(initial.time ?? '');
    } else {
      setDay('');
      setTime('');
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

  function handleSave() {
    const payload = {
      ...initial,
      day: day || initial?.day || new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      time: time || initial?.time || '',
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

            <Text style={styles.label}>Time</Text>
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="e.g. 14:00 - 18:00"
              style={styles.input}
              placeholderTextColor="#bfbfbf"
            />

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
