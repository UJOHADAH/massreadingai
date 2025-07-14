import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { ChevronDown, Globe } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSelector() {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLangName = availableLanguages.find(lang => lang.code === currentLanguage)?.name || 'English';

  return (
    <View>
      <TouchableOpacity 
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <Globe size={20} color="#8B5CF6" />
        <Text style={styles.selectorText}>{currentLangName}</Text>
        <ChevronDown size={16} color="#8B5CF6" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <ScrollView style={styles.languageList}>
              {availableLanguages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    currentLanguage === language.code && styles.selectedLanguage
                  ]}
                  onPress={() => {
                    setLanguage(language.code);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.languageText,
                    currentLanguage === language.code && styles.selectedLanguageText
                  ]}>
                    {language.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#333333',
  },
  selectorText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#ffffff',
  },
  languageList: {
    maxHeight: 300,
  },
  languageItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedLanguage: {
    backgroundColor: '#8B5CF6',
  },
  languageText: {
    fontSize: 16,
    color: '#ffffff',
  },
  selectedLanguageText: {
    color: 'white',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#555555',
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
});