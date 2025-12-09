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
import styles from '../../styles/modalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditSemesterModal({visible, onClose, onSave, initial}) {
  const [title, setTitle] = useState('');
  const [study, setStudy] = useState('0');
  const [brk, setBrk] = useState('0');

  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? '');
      setStudy(String(initial.study ?? '0'));
      setBrk(String(initial.break ?? initial.brk ?? '0'));
    } else {
      setTitle('');
      setStudy('0');
      setBrk('0');
    }
  }, [initial, visible]);

  function handleSave() {
    const payload = {
      ...initial,
      title: title || initial?.title || 'Sem ' + new Date().getFullYear(),
      study: parseInt(study, 10) || 0,
      break: parseInt(brk, 10) || 0,
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
              <Text style={styles.title}>Edit Semester</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <FontAwesome name="times" size={18} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>Update the semester details</Text>

            <Text style={styles.label}>Semester Name</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Semester 2025 - 2026"
              style={styles.input}
              placeholderTextColor="#bfbfbf"
            />

            <View style={styles.rowInputs}>
              <View style={styles.smallInputWrap}>
                <Text style={styles.smallLabel}>Study Duration (min)</Text>
                <TextInput
                  value={study}
                  onChangeText={setStudy}
                  keyboardType="numeric"
                  style={styles.smallInput}
                  maxLength={4}
                />
              </View>
              <View style={styles.smallInputWrap}>
                <Text style={styles.smallLabel}>Break Duration (min)</Text>
                <TextInput
                  value={brk}
                  onChangeText={setBrk}
                  keyboardType="numeric"
                  style={styles.smallInput}
                  maxLength={4}
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
