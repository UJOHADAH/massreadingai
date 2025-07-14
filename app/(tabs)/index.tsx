import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Calendar, RefreshCw } from 'lucide-react-native';
import { fetchReadings } from '@/services/readingsService';
import { translateText } from '@/services/translationService';
import { ReadingData } from '@/types/readings';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import LanguageSelector from '@/components/LanguageSelector';

export default function ReadingsTab() {
  const [readings, setReadings] = useState<ReadingData | null>(null);
  const [translatedReadings, setTranslatedReadings] = useState<ReadingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const { currentLanguage } = useLanguage();

  const loadReadings = async () => {
    try {
      const data = await fetchReadings();
      setReadings(data);
      
      if (currentLanguage !== 'en') {
        await translateReadings(data);
      } else {
        setTranslatedReadings(data);
      }
    } catch (error) {
      console.error('Error loading readings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const translateReadings = async (readingsData: ReadingData) => {
    if (currentLanguage === 'en') {
      setTranslatedReadings(readingsData);
      return;
    }

    setTranslating(true);
    try {
      const translated: ReadingData = {
        ...readingsData,
        Mass_R1: {
          source: readingsData.Mass_R1.source,
          text: await translateText(readingsData.Mass_R1.text, currentLanguage)
        },
        Mass_Ps: {
          source: readingsData.Mass_Ps.source,
          text: await translateText(readingsData.Mass_Ps.text, currentLanguage)
        },
        Mass_GA: {
          source: readingsData.Mass_GA.source,
          text: await translateText(readingsData.Mass_GA.text, currentLanguage)
        },
        Mass_G: {
          source: readingsData.Mass_G.source,
          text: await translateText(readingsData.Mass_G.text, currentLanguage)
        }
      };

      if (readingsData.Mass_R2) {
        translated.Mass_R2 = {
          source: readingsData.Mass_R2.source,
          text: await translateText(readingsData.Mass_R2.text, currentLanguage)
        };
      }

      setTranslatedReadings(translated);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedReadings(readingsData);
    } finally {
      setTranslating(false);
    }
  };

  useEffect(() => {
    loadReadings();
  }, []);

  useEffect(() => {
    if (readings) {
      translateReadings(readings);
    }
  }, [currentLanguage]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReadings();
  };

  if (loading) {
    return <LoadingSpinner message="Loading today's readings..." />;
  }

  const displayReadings = translatedReadings || readings;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Calendar size={24} color="#8B5CF6" />
          <View>
            <Text style={styles.headerTitle}>Daily Mass Readings</Text>
            <Text style={styles.headerDate}>{displayReadings?.day}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <LanguageSelector />
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <RefreshCw size={20} color="#8B5CF6" />
          </TouchableOpacity>
        </View>
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
        {displayReadings && (
          <View style={styles.content}>
            <ReadingSection
              title="First Reading"
              source={displayReadings.Mass_R1.source}
              text={displayReadings.Mass_R1.text}
            />

            <ReadingSection
              title="Responsorial Psalm"
              source={displayReadings.Mass_Ps.source}
              text={displayReadings.Mass_Ps.text}
            />

            {displayReadings.Mass_R2 && (
              <ReadingSection
                title="Second Reading"
                source={displayReadings.Mass_R2.source}
                text={displayReadings.Mass_R2.text}
              />
            )}

            <ReadingSection
              title="Gospel Acclamation"
              source={displayReadings.Mass_GA.source}
              text={displayReadings.Mass_GA.text}
            />

            <ReadingSection
              title="Gospel"
              source={displayReadings.Mass_G.source}
              text={displayReadings.Mass_G.text}
              isGospel={true}
            />

            <View style={styles.copyright}>
              <Text style={styles.copyrightText}>{displayReadings.copyright.text}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ReadingSection({ title, source, text, isGospel = false }: {
  title: string;
  source: string;
  text: string;
  isGospel?: boolean;
}) {
  return (
    <View style={[styles.readingSection, isGospel && styles.gospelSection]}>
      <Text style={[styles.readingTitle, isGospel && styles.gospelTitle]}>{title}</Text>
      <Text style={styles.readingSource}>{source}</Text>
      <Text style={[styles.readingText, isGospel && styles.gospelText]}>{text}</Text>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 8,
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
  readingSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#333333',
  },
  gospelSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  readingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  gospelTitle: {
    color: '#8B5CF6',
  },
  readingSource: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
    marginBottom: 12,
  },
  readingText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#e5e5e5',
  },
  gospelText: {
    fontWeight: '500',
    color: '#ffffff',
  },
  copyright: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  copyrightText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
});