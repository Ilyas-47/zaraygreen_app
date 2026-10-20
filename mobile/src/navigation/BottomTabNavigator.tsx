import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import HomeScreen from '../screens/shop/HomeScreen';
import SearchScreen from '../screens/shop/SearchScreen';
import ServicesScreen from '../screens/shop/ServicesScreen';
import CartScreen from '../screens/shop/CartScreen';

const Tab = createBottomTabNavigator();

const COLORS = {
  active: '#2D5016',
  inactive: '#B5B5B5',
  bg: '#FFFFFF',
  border: '#EBEBEB',
};

const TABS = [
  { name: 'HomeTab',     labelKey: 'tabs.home',     iconActive: 'home',   iconInactive: 'home-outline'   },
  { name: 'SearchTab',   labelKey: 'tabs.search',   iconActive: 'search', iconInactive: 'search-outline' },
  { name: 'ServicesTab', labelKey: 'tabs.services', iconActive: 'leaf',   iconInactive: 'leaf-outline'   },
  { name: 'CartTab',     labelKey: 'tabs.cart',     iconActive: 'bag',    iconInactive: 'bag-outline'    },
];

const SCREENS: Record<string, React.ComponentType<any>> = {
  HomeTab:     HomeScreen,
  SearchTab:   SearchScreen,
  ServicesTab: ServicesScreen,
  CartTab:     CartScreen,
};

function TabIcon({ focused, iconActive, iconInactive, label }: {
  focused: boolean;
  iconActive: string;
  iconInactive: string;
  label: string;
}) {
  return (
    <View style={styles.tabItem}>
      <Ionicons
        name={(focused ? iconActive : iconInactive) as any}
        size={24}
        color={focused ? COLORS.active : COLORS.inactive}
      />
      <Text 
        style={[styles.tabLabel, focused && styles.tabLabelActive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export default function BottomTabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={SCREENS[tab.name]}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                iconActive={tab.iconActive}
                iconInactive={tab.iconInactive}
                label={t(tab.labelKey)}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: Platform.OS === 'ios' ? 82 : 65,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 4,
    width: 90,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.inactive,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: COLORS.active,
  },
});