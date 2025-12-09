import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from '../../styles/modalStyles';

export default function StudyPlanConfirmationModal({
  visible,
  tasks,
  onApprove,
  onReject,
  conflictingTasks = [],
}) {
  const [selectedTasks, setSelectedTasks] = useState(tasks.map((_, idx) => idx));

  // Reset selections when tasks change or modal becomes visible
  useEffect(() => {
    if (visible && tasks.length > 0) {
      setSelectedTasks(tasks.map((_, idx) => idx));
    }
  }, [tasks, visible]);

  const toggleTaskSelection = (index) => {
    setSelectedTasks(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleApprove = () => {
    if (selectedTasks.length === 0) {
      Alert.alert('No Tasks Selected', 'Please select at least one task to add.');
      return;
    }

    const selectedTasksData = selectedTasks.map(idx => tasks[idx]);
    onApprove(selectedTasksData);
  };

  const getTaskTypeColor = (taskType) => {
    switch (taskType) {
      case 'Study':
        return '#FFBE5B';
      case 'Break':
        return '#D3D3DD';
      case 'Deadline':
        return '#FF8A8A';
      default:
        return '#FFBE5B';
    }
  };

  const renderTaskCard = (task, index) => {
    const isSelected = selectedTasks.includes(index);
    const color = getTaskTypeColor(task.taskType);

    return (
      <TouchableOpacity
        key={index}
        onPress={() => toggleTaskSelection(index)}
        activeOpacity={0.7}
      >
        <View
          style={{
            borderLeftWidth: 4,
            borderLeftColor: color,
            backgroundColor: isSelected ? '#fff9f0' : '#ffffff',
            borderRadius: 8,
            padding: 12,
            marginBottom: 10,
            opacity: isSelected ? 1 : 0.8,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#2C1F17' }}>
                {task.title}
              </Text>
              
              {task.description && (
                <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }} numberOfLines={2}>
                  {task.description}
                </Text>
              )}

              <Text style={{ fontSize: 11, color: '#999', marginTop: 6 }}>
                {task.date} | {task.day}
              </Text>

              {task.taskType === 'Deadline' ? (
                <Text style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                  Deadline: {task.endTime}
                </Text>
              ) : (
                <Text style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                  Time: {task.startTime} - {task.endTime}
                </Text>
              )}

              {task.priority && (
                <Text style={{ fontSize: 10, color: color, marginTop: 4, fontWeight: '600' }}>
                  Priority: {task.priority}
                </Text>
              )}

              <Text style={{ fontSize: 10, color: color, marginTop: 2 }}>
                Type: {task.taskType}
              </Text>
            </View>

            <View style={{ marginLeft: 10 }}>
              <FontAwesome5
                name={isSelected ? 'check-circle' : 'circle'}
                size={20}
                color={color}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { maxHeight: '90%' }]}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Approve Study Plan</Text>
            <TouchableOpacity onPress={onReject} style={styles.closeBtn}>
              <FontAwesome name="times" size={18} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Review and approve tasks to add to your calendar</Text>

          {conflictingTasks.length > 0 && (
            <View
              style={{
                backgroundColor: '#fff3cd',
                borderLeftWidth: 4,
                borderLeftColor: '#ffc107',
                padding: 12,
                marginBottom: 12,
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#856404' }}>
                ⚠ Schedule Conflicts Detected
              </Text>
              <Text style={{ fontSize: 11, color: '#856404', marginTop: 4 }}>
                Some tasks overlap with existing events. Adjust times before adding.
              </Text>
            </View>
          )}

          <ScrollView style={{ flex: 1, marginBottom: 10 }}>
            {tasks.map((task, index) => renderTaskCard(task, index))}
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={onReject}
              style={{ flex: 1 }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#f0f0f0', '#e0e0e0']}
                style={[styles.addBtn, { marginTop: 0 }]}
              >
                <Text style={[styles.addBtnText, { color: '#333' }]}>Reject</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApprove}
              style={{ flex: 1 }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF5A4A', '#FFB84E']}
                style={[styles.addBtn, { marginTop: 0 }]}
              >
                <Text style={styles.addBtnText}>Approve & Add</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
