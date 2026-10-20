import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, G, Ellipse } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Feuille tropicale (Monstera) en SVG pour le filigrane
const LeafWatermark = ({ style }: any) => (
  <Svg viewBox="0 0 200 300" style={style}>
    <G opacity={0.07} fill="#2D5016">
      {/* Feuille principale */}
      <Path d="M100 10 C60 40 20 80 30 140 C40 200 80 240 100 280 C120 240 160 200 170 140 C180 80 140 40 100 10Z" />
      {/* Nervures */}
      <Path d="M100 10 L100 280" strokeWidth={3} stroke="#2D5016" fill="none" />
      <Path d="M100 80 C80 100 50 110 30 120" strokeWidth={1.5} stroke="#2D5016" fill="none" />
      <Path d="M100 80 C120 100 150 110 170 120" strokeWidth={1.5} stroke="#2D5016" fill="none" />
      <Path d="M100 130 C75 150 45 155 25 150" strokeWidth={1.5} stroke="#2D5016" fill="none" />
      <Path d="M100 130 C125 150 155 155 175 150" strokeWidth={1.5} stroke="#2D5016" fill="none" />
      <Path d="M100 180 C80 195 60 198 45 195" strokeWidth={1.5} stroke="#2D5016" fill="none" />
      <Path d="M100 180 C120 195 140 198 155 195" strokeWidth={1.5} stroke="#2D5016" fill="none" />
      {/* Découpes Monstera */}
      <Path d="M55 100 C40 95 30 100 30 115 C30 120 40 118 55 110Z" fill="#F8F7F4" />
      <Path d="M145 100 C160 95 170 100 170 115 C170 120 160 118 145 110Z" fill="#F8F7F4" />
    </G>
  </Svg>
);

export default function SplashScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Spinner
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Filigranes feuilles — arrière-plan */}
      <LeafWatermark style={styles.leafTopRight} />
      <LeafWatermark style={styles.leafBottomLeft} />
      <LeafWatermark style={styles.leafTopLeft} />
      <LeafWatermark style={styles.leafBottomRight} />

      {/* Contenu principal */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        {/* Logo texte */}
        <View style={styles.logoWrapper}>
          <Text style={styles.brand}>ZARAY</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>BIENVENUE DANS LE MONDE DE LA{'\n'}DÉCORATION</Text>
        </View>

        {/* Spinner */}
        <View style={styles.spinnerWrapper}>
          <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
          <Text style={styles.loadingText}>CHARGEMENT</Text>
        </View>
      </Animated.View>

      {/* Footer */}
      <Animated.Text style={[styles.footer, { opacity: fadeAnim }]}>
        Copyright © 2026
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Filigranes
  leafTopRight: {
    position: 'absolute',
    width: width * 0.65,
    height: height * 0.45,
    top: -40,
    right: -60,
    transform: [{ rotate: '20deg' }],
  },
  leafBottomLeft: {
    position: 'absolute',
    width: width * 0.65,
    height: height * 0.45,
    bottom: -40,
    left: -60,
    transform: [{ rotate: '-160deg' }],
  },
  leafTopLeft: {
    position: 'absolute',
    width: width * 0.4,
    height: height * 0.3,
    top: 20,
    left: -30,
    transform: [{ rotate: '-30deg' }],
  },
  leafBottomRight: {
    position: 'absolute',
    width: width * 0.4,
    height: height * 0.3,
    bottom: 20,
    right: -30,
    transform: [{ rotate: '150deg' }],
  },

  // Contenu
  content: {
    alignItems: 'center',
    gap: 48,
  },
  logoWrapper: {
    alignItems: 'center',
    gap: 12,
  },
  brand: {
    fontSize: 42,
    fontWeight: '800',
    color: '#2D5016',
    letterSpacing: 10,
    fontFamily: 'serif',
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: '#2D5016',
    opacity: 0.3,
    marginVertical: 4,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2D5016',
    letterSpacing: 3,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 16,
  },

  // Spinner
  spinnerWrapper: {
    alignItems: 'center',
    gap: 14,
  },
  spinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#EBEBEB',
    borderTopColor: '#2D5016',
  },
  loadingText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#8A8A8A',
    letterSpacing: 4,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: 10,
    fontWeight: '600',
    color: '#2D5016',
    letterSpacing: 4,
    opacity: 0.4,
  },
});