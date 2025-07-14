import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { MessageCircle, Sparkles, RefreshCw } from 'lucide-react-native';
import { fetchReadings } from '@/services/readingsService';
import { fetchSaintOfTheDay } from '@/services/saintsService';
import { generateHomily, translateText } from '@/services/translationService';
import { ReadingData, Saint } from '@/types/readings';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import LanguageSelector from '@/components/LanguageSelector';

export default function HomilyTab() {
  const [homily, setHomily] = useState<string>('');
  const [translatedHomily, setTranslatedHomily] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const { currentLanguage } = useLanguage();

  const loadHomily = async () => {
    setGenerating(true);
    try {
      // Fetch readings and saint data
      const [readings, saint] = await Promise.all([
        fetchReadings(),
        fetchSaintOfTheDay()
      ]);

      // Create a summary of readings for homily generation
      const readingsSummary = `
        First Reading: ${readings.Mass_R1.source} - ${readings.Mass_R1.text.substring(0, 200)}...
        Psalm: ${readings.Mass_Ps.source}
        ${readings.Mass_R2 ? `Second Reading: ${readings.Mass_R2.source} - ${readings.Mass_R2.text.substring(0, 200)}...` : ''}
        Gospel: ${readings.Mass_G.source} - ${readings.Mass_G.text.substring(0, 300)}...
      `;

      const saintSummary = `${saint.name} - ${saint.description}`;

      // Generate homily
      const generatedHomily = await generateHomily(readingsSummary, saintSummary);
      setHomily(generatedHomily);

      // Translate if needed
      if (currentLanguage !== 'en') {
        await translateHomily(generatedHomily);
      } else {
        setTranslatedHomily(generatedHomily);
      }
    } catch (error) {
      console.error('Error loading homily:', error);
      setHomily('Unable to generate homily at this time. Please check your internet connection and try again.');
      setTranslatedHomily('Unable to generate homily at this time. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
      setGenerating(false);
      setRefreshing(false);
    }
  };

  const translateHomily = async (homilyText: string) => {
    if (currentLanguage === 'en') {
      setTranslatedHomily(homilyText);
      return;
    }

    setTranslating(true);
    try {
      const translated = await translateText(homilyText, currentLanguage);
      setTranslatedHomily(translated);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedHomily(homilyText);
    } finally {
      setTranslating(false);
    }
  };

  useEffect(() => {
    loadHomily();
  }, []);

  useEffect(() => {
    if (homily) {
      translateHomily(homily);
    }
  }, [currentLanguage]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHomily();
  };

  const regenerateHomily = () => {
    setGenerating(true);
    loadHomily();
  };

  if (loading) {
    return <LoadingSpinner message="Generating today's homily..." />;
  }

  const displayHomily = translatedHomily || homily;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MessageCircle size={24} color="#8B5CF6" />
          <View>
            <Text style={styles.headerTitle}>Today's Homily</Text>
            <Text style={styles.headerSubtitle}>AI-Generated Reflection</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <LanguageSelector />
          <TouchableOpacity onPress={regenerateHomily} style={styles.regenerateButton}>
            <Sparkles size={20} color="#8B5CF6" />
          </TouchableOpacity>
        </View>
      </View>

      {(generating || translating) && (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>
            {generating ? 'Generating homily...' : 'Translating...'}
          </Text>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={styles.homilyCard}>
            <View style={styles.homilyHeader}>
              <MessageCircle size={20} color="#8B5CF6" />
              <Text style={styles.homilyTitle}>Reflection on Today's Readings</Text>
            </View>
            
            <Text style={styles.homilyText}>{displayHomily}</Text>

            <View style={styles.footer}>
              <View style={styles.aiNotice}>
                <Sparkles size={16} color="#8B5CF6" />
                <Text style={styles.aiNoticeText}>Generated by AI • For reflection purposes</Text>
              </View>
              
              <TouchableOpacity onPress={regenerateHomily} style={styles.regenerateTextButton}>
                <RefreshCw size={16} color="#8B5CF6" />
                <Text style={styles.regenerateText}>Generate New</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>About AI-Generated Homilies</Text>
            <Text style={styles.disclaimerText}>
              This homily is generated by artificial intelligence based on today's Mass readings and saint. 
              While it aims to provide meaningful reflection, it should complement, not replace, 
              traditional spiritual guidance from ordained clergy and the Church's teaching authority.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  regenerateButton: {
    padding: 8,
  },
  statusBanner: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  statusText: {
    color: '#6366F1',
    fontSize: 14,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  homilyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homilyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  homilyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  homilyText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  aiNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiNoticeText: {
    fontSize: 12,
    color: '#8B5CF6',
  },
  regenerateTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  regenerateText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  disclaimerCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#78350F',
  },
});