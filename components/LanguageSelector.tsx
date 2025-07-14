import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, TextInput } from 'react-native';
import { ChevronDown, Globe, Search } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSelector() {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);
  const currentLangName = currentLang?.nativeName || 'English';

  const filteredLanguages = availableLanguages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group languages by region/family for better organization
  const popularLanguages = ['en', 'es', 'fr', 'it', 'pt', 'de', 'la'];
  const popular = filteredLanguages.filter(lang => popularLanguages.includes(lang.code));
  const others = filteredLanguages.filter(lang => !popularLanguages.includes(lang.code));

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
            
            <View style={styles.searchContainer}>
              <Search size={20} color="#8B5CF6" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search languages..."
                placeholderTextColor="#666666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
              {searchQuery === '' && (
                <>
                  <Text style={styles.sectionHeader}>Popular Languages</Text>
                  {popular.map((language) => (
                    <TouchableOpacity
                      key={language.code}
                      style={[
                        styles.languageItem,
                        currentLanguage === language.code && styles.selectedLanguage
                      ]}
                      onPress={() => {
                        setLanguage(language.code);
                        setModalVisible(false);
                        setSearchQuery('');
                      }}
                    >
                      <View style={styles.languageInfo}>
                        <Text style={[
                          styles.languageNativeName,
                          currentLanguage === language.code && styles.selectedLanguageText
                        ]}>
                          {language.nativeName}
                        </Text>
                        <Text style={[
                          styles.languageEnglishName,
                          currentLanguage === language.code && styles.selectedLanguageSubtext
                        ]}>
                          {language.name}
                        </Text>
                      </View>
                      {currentLanguage === language.code && (
                        <View style={styles.selectedIndicator} />
                      )}
                    </TouchableOpacity>
                  ))}

                  <Text style={styles.sectionHeader}>All Languages</Text>
                </>
              )}
              
              {(searchQuery === '' ? others : filteredLanguages).map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    currentLanguage === language.code && styles.selectedLanguage
                  ]}
                  onPress={() => {
                    setLanguage(language.code);
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <View style={styles.languageInfo}>
                    <Text style={[
                      styles.languageNativeName,
                      currentLanguage === language.code && styles.selectedLanguageText
                    ]}>
                      {language.nativeName}
                    </Text>
                    <Text style={[
                      styles.languageEnglishName,
                      currentLanguage === language.code && styles.selectedLanguageSubtext
                    ]}>
                      {language.name}
                    </Text>
                  </View>
                  {currentLanguage === language.code && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                setSearchQuery('');
              }}
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  languageList: {
    maxHeight: 400,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 1,
  },
  selectedLanguage: {
    backgroundColor: '#8B5CF6',
  },
  languageInfo: {
    flex: 1,
  },
  languageNativeName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  languageEnglishName: {
    fontSize: 14,
    color: '#cccccc',
    marginTop: 2,
  },
  selectedLanguageText: {
    color: 'white',
    fontWeight: '600',
  },
  selectedLanguageSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  closeButton: {
    backgroundColor: '#333333',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
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