import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Image } from 'react-native';
import { Star, Calendar } from 'lucide-react-native';
import { fetchSaintOfTheDay } from '@/services/saintsService';
import { translateText, generateSaintPrayer } from '@/services/translationService';
import { Saint } from '@/types/readings';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import LanguageSelector from '@/components/LanguageSelector';

export default function SaintsTab() {
  const [saint, setSaint] = useState<Saint | null>(null);
  const [translatedSaint, setTranslatedSaint] = useState<Saint | null>(null);
  const [prayer, setPrayer] = useState<string>('');
  const [translatedPrayer, setTranslatedPrayer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const { currentLanguage } = useLanguage();

  const loadSaint = async () => {
    try {
      const data = await fetchSaintOfTheDay();
      setSaint(data);
      
      // Generate prayer for the saint
      const saintPrayer = await generateSaintPrayer(data.name);
      setPrayer(saintPrayer);
      
      if (currentLanguage !== 'en') {
        await translateSaint(data, saintPrayer);
      } else {
        setTranslatedSaint(data);
        setTranslatedPrayer(saintPrayer);
      }
    } catch (error) {
      console.error('Error loading saint:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const translateSaint = async (saintData: Saint, prayerText: string = prayer) => {
    if (currentLanguage === 'en') {
      setTranslatedSaint(saintData);
      setTranslatedPrayer(prayerText);
      return;
    }

    setTranslating(true);
    try {
      const translated: Saint = {
        name: saintData.name, // Keep name in original language
        feast: await translateText(saintData.feast, currentLanguage),
        description: await translateText(saintData.description, currentLanguage),
        biography: await translateText(saintData.biography, currentLanguage),
      };

      const translatedPrayerText = await translateText(prayerText, currentLanguage);

      setTranslatedSaint(translated);
      setTranslatedPrayer(translatedPrayerText);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedSaint(saintData);
      setTranslatedPrayer(prayerText);
    } finally {
      setTranslating(false);
    }
  };

  useEffect(() => {
    loadSaint();
  }, []);

  useEffect(() => {
    if (saint) {
      translateSaint(saint, prayer);
    }
  }, [currentLanguage]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSaint();
  };

  if (loading) {
    return <LoadingSpinner message="Loading saint of the day..." />;
  }

  const displaySaint = translatedSaint || saint;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Star size={24} color="#8B5CF6" />
          <View>
            <Text style={styles.headerTitle}>Saint of the Day</Text>
            <Text style={styles.headerDate}>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>
        <LanguageSelector />
      </View>

      {translating && (
        <View style={styles.translatingBanner}>
          <Text style={styles.translatingText}>Translating...</Text>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {displaySaint && (
          <View style={styles.content}>
            <View style={styles.saintCard}>
              <View style={styles.saintHeader}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/8468/angel-wings-statue-sculpture.jpg?auto=compress&cs=tinysrgb&w=400' }}
                  style={styles.saintImage}
                />
                <View style={styles.saintInfo}>
                  <Text style={styles.saintName}>{displaySaint.name}</Text>
                  <View style={styles.feastBadge}>
                    <Calendar size={16} color="#8B5CF6" />
                    <Text style={styles.feastText}>{displaySaint.feast}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.description}>{displaySaint.description}</Text>

              <View style={styles.biographySection}>
                <Text style={styles.biographyTitle}>Biography</Text>
                <Text style={styles.biographyText}>{displaySaint.biography}</Text>
              </View>

              <View style={styles.prayerSection}>
                <Text style={styles.prayerTitle}>Prayer</Text>
                <Text style={styles.prayerText}>
                  {translatedPrayer || prayer}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerDate: {
    fontSize: 14,
    color: '#cccccc',
  },
  translatingBanner: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  translatingText: {
    color: '#8B5CF6',
    fontSize: 14,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  saintCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#333333',
  },
  saintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  saintImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  saintInfo: {
    flex: 1,
  },
  saintName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  feastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: '#333333',
  },
  feastText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  biographySection: {
    marginBottom: 20,
  },
  biographyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  biographyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#e5e5e5',
  },
  prayerSection: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    borderWidth: 1,
    borderColor: '#333333',
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  prayerText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#e5e5e5',
    fontStyle: 'italic',
  },
});