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

export default function EditTaskModal({visible, onClose, onSave, initial}) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState(null);
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:00');

  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? '');
      setPriority(initial.priority ?? '');
      setDescription(initial.description ?? '');
      setStartTime(initial.startTime ?? '00:00');
      setEndTime(initial.endTime ?? '00:00');
    } else {
      setTitle('');
      setPriority('');
      setStartTime('00:00');
      setEndTime('00:00');
    }
  }, [initial, visible]);

  const priorityLevels = [
    {key:'1', value:'Low'},
    {key:'2', value:'Medium'},
    {key:'3', value:'High'},
  ];

  function handleSave() {
    const payload = {
      ...initial,
      title: title || initial?.title || 'Untitled Task',
      priority: priority || initial?.priority || 'Low',
      description: description || initial?.description || 'No description',
      startTime: startTime || initial?.startTime || '',
      endTime: endTime || initial?.endTime || '00:00',
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
              <Text style={styles.title}>Edit Task</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <FontAwesome name="times" size={18} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>Update your Task details</Text>

            <Text style={styles.label}>Class Name</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Quiz 1 - Subject Name"
              style={styles.input}
              placeholderTextColor="#bfbfbf"
            />

            <Text style={styles.label}>Priority Level</Text>
            <SelectList
              data={priorityLevels}
              value={priority}
              setSelected={setPriority}
              defaultOption={{key: days.find(d=>d.value===priority)?.key, value: priority}}
              placeholder={priority || 'Select a priority...'}
              boxStyles={styles.input}
              inputStyles={{color: '#333'}}
              dropdownTextStyles={{color: '#333'}}
            />
{/* ============= FIX THE TIME INPUT ================= */}
            <View style={styles.rowInputs}>
              <View style={styles.smallInputWrap}>
                <Text style={styles.smallLabel}>Start Time </Text>
                <TextInput
                  value={startTime}
                  onChangeText={setStartTime}
                  keyboardType="numeric"
                  style={styles.smallInput}
                  editable={initial?.taskType !== 'Deadline'}
                  selectTextOnFocus={initial?.taskType !== 'Deadline'}
                />
              </View>
              <View style={styles.smallInputWrap}>
                <Text style={styles.smallLabel}>End Time</Text>
                <TextInput
                  value={endTime}
                  onChangeText={setEndTime}
                  keyboardType="numeric"
                  style={styles.smallInput}
                />
              </View>
            </View>
{/* ============================================== */}

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
