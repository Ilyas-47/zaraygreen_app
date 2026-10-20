import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Image, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { aiApi } from '../../api/ai.api';

const COLORS = {
  primary: '#2D5016', primaryLight: '#4A7C2A',
  bg: '#F8F7F4', white: '#FFFFFF',
  text: '#1A1A1A', textMuted: '#8A8A8A', border: '#EBEBEB',
  botBubble: '#EEF4E8', userBubble: '#2D5016',
};

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  products?: any[];
  services?: any[];
}

export default function ZarayAiScreen({ navigation }: any) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', text: 'Bonjour ! Je suis Zaray AI 🌿, votre conseiller personnel. Que recherchez-vous pour votre jardin ou votre intérieur aujourd\'hui ?', isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const userMsg = { id: Date.now().toString(), text: inputText.trim(), isBot: false };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const history = messages.filter(m => m.id !== 'welcome').map(m => ({
        role: m.isBot ? 'model' : 'user',
        text: m.text
      }));

      const res = await aiApi.chat(userMsg.text, history);
      const data = (res.data as any).data || res.data;
      
      let rawText = data?.reply || "Désolé, je n'ai pas compris.";
      
      const productRegex = /\[PRODUIT:([a-zA-Z0-9-]+)\]/g;
      const serviceRegex = /\[SERVICE:([a-zA-Z0-9-]+)\]/g;
      
      const suggestedProducts: any[] = [];
      const suggestedServices: any[] = [];
      
      let match;
      while ((match = productRegex.exec(rawText)) !== null) {
        const id = match[1];
        const product = data?.catalog?.products?.find((p: any) => p.id === id);
        if (product && !suggestedProducts.some(p => p.id === id)) {
          suggestedProducts.push(product);
        }
      }
      
      while ((match = serviceRegex.exec(rawText)) !== null) {
        const id = match[1];
        const service = data?.catalog?.services?.find((s: any) => s.id === id);
        if (service && !suggestedServices.some(s => s.id === id)) {
          suggestedServices.push(service);
        }
      }
      
      rawText = rawText.replace(productRegex, '').replace(serviceRegex, '').trim();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: rawText,
        isBot: true,
        products: suggestedProducts.length > 0 ? suggestedProducts : undefined,
        services: suggestedServices.length > 0 ? suggestedServices : undefined,
      }]);
    } catch (error) {
      console.error("AI FRONTEND ERROR:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Désolé, il y a eu une erreur de connexion à l'IA.",
        isBot: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Zaray AI Expert</Text>
          <Text style={styles.headerSub}>En ligne 🟢</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 12 }}>
              <View style={[styles.bubbleWrapper, item.isBot ? styles.botWrapper : styles.userWrapper]}>
                {item.isBot && <View style={styles.avatar}><Ionicons name="leaf" size={16} color={COLORS.primary} /></View>}
                {!!item.text && (
                  <View style={[styles.bubble, item.isBot ? styles.botBubble : styles.userBubble]}>
                    <Text style={[styles.msgText, item.isBot ? styles.botText : styles.userText]}>{item.text}</Text>
                  </View>
                )}
              </View>

              {item.products && item.products.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsContainer}>
                  {item.products.map((product, index) => {
                    let imageUrl = 'https://placehold.co/100x100.png';
                    try {
                      if (product.images) {
                        const parsed = JSON.parse(product.images);
                        if (parsed.length > 0) imageUrl = parsed[0];
                      }
                    } catch(e){}
                    return (
                      <TouchableOpacity 
                        key={`prod-${product.id}-${index}`} 
                        style={styles.card}
                        onPress={() => navigation.navigate('ProductDetails', { product })}
                      >
                        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardTitle} numberOfLines={2}>{product.name}</Text>
                          <Text style={styles.cardPrice}>{product.price} MAD</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {item.services && item.services.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsContainer}>
                  {item.services.map((service, index) => {
                    return (
                      <TouchableOpacity 
                        key={`serv-${service.id}-${index}`} 
                        style={styles.card}
                        onPress={() => navigation.navigate('ServiceBooking', { service })}
                      >
                        <Image source={{ uri: service.image || 'https://placehold.co/100x100.png' }} style={styles.cardImage} />
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardTitle} numberOfLines={2}>{service.name}</Text>
                          <Text style={styles.cardPrice}>{service.basePrice ? `${service.basePrice} MAD` : 'Sur Devis'}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}
          ListFooterComponent={loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : null}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Écrivez votre message..."
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, inputText.trim() ? styles.sendBtnActive : null]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4 },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.primaryLight, fontWeight: '600' },
  
  chatContent: { padding: 16, paddingBottom: 30, gap: 16 },
  bubbleWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  botWrapper: { justifyContent: 'flex-start', paddingRight: 40 },
  userWrapper: { justifyContent: 'flex-end', paddingLeft: 40 },
  avatar: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.pill,
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  bubble: { padding: 14, borderRadius: 20 },
  botBubble: { backgroundColor: COLORS.botBubble, borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: COLORS.userBubble, borderBottomRightRadius: 4 },
  msgText: { fontSize: 14, lineHeight: 20 },
  botText: { color: COLORS.text },
  userText: { color: COLORS.white },
  
  loadingContainer: { padding: 10, alignItems: 'flex-start', paddingLeft: 40 },

  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  input: {
    flex: 1, backgroundColor: COLORS.bg, borderRadius: 20, paddingHorizontal: 16,
    paddingTop: 12, paddingBottom: 12, fontSize: 14, maxHeight: 100,
    color: COLORS.text, marginRight: 10,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnActive: { backgroundColor: COLORS.primary },
  cardsContainer: {
    paddingLeft: 44, paddingRight: 16, marginTop: 4, gap: 12,
  },
  card: {
    width: 140, backgroundColor: COLORS.white, borderRadius: 12,
    overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border,
  },
  cardImage: { width: '100%', height: 100, backgroundColor: COLORS.bg },
  cardInfo: { padding: 8 },
  cardTitle: { fontSize: 12, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  cardPrice: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
});
