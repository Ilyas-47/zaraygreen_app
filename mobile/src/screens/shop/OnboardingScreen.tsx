import React, { useState } from 'react';
import { View, Text, Image, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Button } from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';

export default function OnboardingScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();

  const ONBOARDING_DATA = [
    {
      title: t('onboarding.slide1.title'),
      description: t('onboarding.slide1.description'),
      image: 'https://images.unsplash.com/photo-1558904541-efa843a96f09?q=80&w=1000&auto=format&fit=crop',
    },
    {
      title: t('onboarding.slide2.title'),
      description: t('onboarding.slide2.description'),
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop',
    },
    {
      title: t('onboarding.slide3.title'),
      description: t('onboarding.slide3.description'),
      image: 'https://images.unsplash.com/photo-1416879598555-220023ee0b2b?q=80&w=1000&auto=format&fit=crop',
    },
  ];

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Home');
    }
  };

  return (
    <View className="flex-1 bg-[#F5F5DC]">
      <StatusBar style="dark" />
      <View className="flex-1">
        <Image
          source={{ uri: ONBOARDING_DATA[currentIndex].image }}
          className="w-full h-[60%]"
          resizeMode="cover"
        />
        <View className="flex-1 bg-white -mt-8 rounded-t-[40px] px-8 pt-10 pb-8 items-center justify-between shadow-sm">
          <View className="items-center">
            <View className="flex-row mb-8 space-x-2">
              {ONBOARDING_DATA.map((_, index) => (
                <View
                  key={index}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentIndex ? 'w-8 bg-[#14532D]' : 'w-2.5 bg-gray-200'
                  }`}
                />
              ))}
            </View>
            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              {ONBOARDING_DATA[currentIndex].title}
            </Text>
            <Text className="text-base text-gray-500 text-center leading-relaxed px-4">
              {ONBOARDING_DATA[currentIndex].description}
            </Text>
          </View>

          <View className="w-full mt-8">
            <Button
              title={currentIndex === ONBOARDING_DATA.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
              onPress={handleNext}
              className="w-full"
            />
            <Button
              title={t('onboarding.skip')}
              variant="ghost"
              onPress={() => navigation.replace('Home')}
              className="mt-2"
              textClassName="text-gray-500"
            />
          </View>
        </View>
      </View>
    </View>
  );
}
