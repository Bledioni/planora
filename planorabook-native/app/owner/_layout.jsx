import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Calendar, BarChart3, Clock, ClipboardList, Home } from 'lucide-react-native';
import { colors } from '../../src/styles/theme';

const TabIcon = ({ icon: Icon, label, focused, isCenter }) => {
  if (isCenter) {
    return (
      <View style={styles.centerWrapper}>
        <View style={[styles.centerBtn, focused && styles.centerBtnActive]}>
          <Clock size={28} color={focused ? '#fff' : colors.primary} strokeWidth={2.2} />
        </View>
        <Text style={[styles.centerLabel, focused && styles.centerLabelActive]}>Orari</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabItem}>
      <Icon
        size={24}
        color={focused ? colors.primary : '#c4ccd8'}
        strokeWidth={focused ? 2.5 : 1.8}
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

export default function OwnerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={Home} label="Kryefaqja" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={Calendar} label="Terminet" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={Clock} label="Orari" focused={focused} isCenter />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={ClipboardList} label="Shërbimet" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={BarChart3} label="Statistika" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 72,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: 64,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#c4ccd8',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  centerWrapper: {
    alignItems: 'center',
    marginTop: -28,
    gap: 4,
  },
  centerBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  centerBtnActive: {
    backgroundColor: colors.primary,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#c4ccd8',
  },
  centerLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});