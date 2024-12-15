import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Card } from 'react-native-paper';
import { useSettings } from '../app/SettingsContext';

//@ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MAX_SEGMENTS = 15; // Maksymalna liczba segmentów
const MAX_TEXT_LENGTH = 10; // Maksymalna długość tekstu

type EditSegmentsProps = {
  segments: string[];
  onSegmentsChange: (updatedSegments: string[]) => void;
};

const EditSegments: React.FC<EditSegmentsProps> = ({ segments, onSegmentsChange }) => {
  const { darkMode, language } = useSettings();
  const [editedSegments, setEditedSegments] = useState<string[]>([...segments]);
  const [newSegment, setNewSegment] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const addSegment = () => {
    if (editedSegments.length >= MAX_SEGMENTS) {
      Alert.alert(
        language === 'pl' ? 'Limit segmentów' : 'Segment limit',
        language === 'pl'
          ? `Nie można dodać więcej niż ${MAX_SEGMENTS} segmentów.`
          : `You cannot add more than ${MAX_SEGMENTS} segments.`
      );
      return;
    }

    if (newSegment.trim().length > MAX_TEXT_LENGTH) {
      Alert.alert(
        language === 'pl' ? 'Za długi tekst' : 'Text too long',
        language === 'pl'
          ? `Tekst segmentu nie może przekraczać ${MAX_TEXT_LENGTH} znaków.`
          : `Segment text cannot exceed ${MAX_TEXT_LENGTH} characters.`
      );
      return;
    }

    if (newSegment.trim()) {
      const updatedSegments = [...editedSegments, newSegment.trim()];
      setEditedSegments(updatedSegments);
      setNewSegment('');
      onSegmentsChange(updatedSegments);
    }
  };

  const removeSegment = (index: number) => {
    const updatedSegments = editedSegments.filter((_, i) => i !== index);
    setEditedSegments(updatedSegments);
    onSegmentsChange(updatedSegments);
  };

  const startEditing = (index: number, text: string) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  const saveEdit = (index: number) => {
    if (editingText.trim().length > MAX_TEXT_LENGTH) {
      Alert.alert(
        language === 'pl' ? 'Za długi tekst' : 'Text too long',
        language === 'pl'
          ? `Tekst segmentu nie może przekraczać ${MAX_TEXT_LENGTH} znaków.`
          : `Segment text cannot exceed ${MAX_TEXT_LENGTH} characters.`
      );
      return;
    }

    const updatedSegments = [...editedSegments];
    updatedSegments[index] = editingText.trim();
    setEditedSegments(updatedSegments);
    setEditingIndex(null);
    setEditingText('');
    onSegmentsChange(updatedSegments);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, darkMode ? styles.darkBackground : styles.lightBackground]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={editedSegments}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Card style={[styles.card, darkMode ? styles.darkCard : styles.lightCard]}>
            <View style={styles.segmentContainer}>
              {editingIndex === index ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={[styles.input, darkMode ? styles.darkInput : styles.lightInput]}
                    value={editingText}
                    onChangeText={setEditingText}
                    maxLength={MAX_TEXT_LENGTH}
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => saveEdit(index)}>
                    <Icon name="check" size={24} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.displayContainer}>
                  <Text style={[styles.segmentText, darkMode ? styles.darkText : styles.lightText]}>{item}</Text>
                  <View style={styles.iconContainer}>
                    <TouchableOpacity onPress={() => startEditing(index, item)}>
                      <Icon name="pencil" size={24} color={darkMode ? '#fff' : '#3F0D72'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeSegment(index)}>
                      <Icon name="trash-can-outline" size={24} color={darkMode ? '#ff6666' : '#ff3333'} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </Card>
        )}
      />

      {editingIndex === null && (
        <>
          <TextInput
            style={[styles.input, darkMode ? styles.darkInput : styles.lightInput]}
            placeholder={language === 'pl' ? 'Dodaj nowy segment' : 'Add new segment'}
            placeholderTextColor={darkMode ? '#888' : '#ccc'}
            value={newSegment}
            onChangeText={setNewSegment}
            maxLength={MAX_TEXT_LENGTH}
          />
          <TouchableOpacity
            onPress={addSegment}
            style={[styles.addButton, darkMode ? styles.darkButton : styles.lightButton]}
          >
            <Text style={styles.addButtonText}>{language === 'pl' ? 'Dodaj segment' : 'Add segment'}</Text>
          </TouchableOpacity>
          <Text style={[styles.limitInfo, darkMode ? styles.darkText : styles.lightText]}>
            {language === 'pl'
              ? `Segmenty: ${editedSegments.length}/${MAX_SEGMENTS} | Max długość tekstu: ${MAX_TEXT_LENGTH} znaków`
              : `Segments: ${editedSegments.length}/${MAX_SEGMENTS} | Max text length: ${MAX_TEXT_LENGTH} characters`}
          </Text>
        </>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  darkBackground: {
    backgroundColor: '#3d3d3d',
  },
  lightBackground: {
    backgroundColor: '#fff',
  },
  card: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#333',
  },
  lightCard: {
    backgroundColor: '#f9f9f9',
  },
  segmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  displayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  segmentText: {
    fontSize: 18,
  },
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginVertical: 10,
  },
  darkInput: {
    borderColor: '#444',
    backgroundColor: '#333',
    color: '#fff',
  },
  lightInput: {
    borderColor: '#ccc',
    backgroundColor: '#fff',
    color: '#333',
  },
  addButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  darkButton: {
    backgroundColor: '#121212',
  },
  lightButton: {
    backgroundColor: '#3F0D72',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  limitInfo: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default EditSegments;