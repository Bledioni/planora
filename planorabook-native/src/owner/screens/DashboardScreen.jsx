import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, CheckCircle, Clock, XCircle, TrendingUp, User } from 'lucide-react-native';
import { api } from '../../api/api';
import { colors, spacing, radius, fontSize, shadow } from '../../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen() {
  const [stats, setStats]       = useState(null);
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUser();
    fetchStats();
  }, []);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/owner/business/dashboard');
      setStats(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const StatCard = ({ label, value, icon: Icon, color, bg }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Icon size={18} color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value ?? '—'}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  if (loading) return (
    <SafeAreaView style={styles.centered}>
      <ActivityIndicator size="large" color={colors.primary} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Mirëmëngjesi 👋</Text>
            <Text style={styles.name}>{user?.name || 'Pronar'}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0] || 'P'}</Text>
          </View>
        </View>

        {/* Date */}
        <View style={styles.dateCard}>
          <Calendar size={16} color={colors.primary} />
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('sq-AL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Statistikat e Sotme</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Gjithsej"
            value={stats?.total_appointments}
            icon={Calendar}
            color={colors.primary}
            bg={colors.primaryLight}
          />
          <StatCard
            label="Përfunduar"
            value={stats?.completed}
            icon={CheckCircle}
            color={colors.green}
            bg={colors.greenLight}
          />
          <StatCard
            label="Në Pritje"
            value={stats?.pending}
            icon={Clock}
            color={colors.amber}
            bg={colors.amberLight}
          />
          <StatCard
            label="Anuluar"
            value={stats?.cancelled}
            icon={XCircle}
            color={colors.red}
            bg={colors.redLight}
          />
        </View>

        {/* Top Services */}
        {stats?.top_services?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Shërbimet Kryesore</Text>
            <View style={styles.card}>
              {stats.top_services.map((s, i) => (
                <View key={i} style={styles.serviceRow}>
                  <Text style={styles.serviceName}>{s.service_name}</Text>
                  <View style={styles.serviceBarWrap}>
                    <View style={[styles.serviceBar, {
                      width: `${(s.total / stats.top_services[0].total) * 100}%`
                    }]} />
                  </View>
                  <Text style={styles.serviceCount}>{s.total}</Text>
                </View>
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  scroll:    { padding: spacing.lg, paddingBottom: spacing.xxl },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greeting: { fontSize: fontSize.sm, color: colors.muted, fontWeight: '500' },
  name:     { fontSize: fontSize.xxl, fontWeight: '800', color: colors.dark, marginTop: 2 },
  avatar: {
    width: 48, height: 48, borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.md,
  },
  avatarText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '800' },

  dateCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md, padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.primaryMid,
  },
  dateText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },

  sectionTitle: {
    fontSize: fontSize.md, fontWeight: '700', color: colors.dark,
    marginBottom: spacing.sm, marginTop: spacing.sm,
  },

  statsGrid: { gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    borderLeftWidth: 4,
    ...shadow.sm,
  },
  statIcon: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: fontSize.xl, fontWeight: '800', color: colors.dark },
  statLabel: { fontSize: fontSize.xs, color: colors.muted, fontWeight: '500', marginTop: 2 },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.lg,
    ...shadow.sm,
  },
  serviceRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  serviceName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.dark, width: 100 },
  serviceBarWrap: {
    flex: 1, height: 8, backgroundColor: colors.bg,
    borderRadius: radius.full, overflow: 'hidden',
  },
  serviceBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  serviceCount: { fontSize: fontSize.sm, fontWeight: '700', color: colors.muted, width: 24, textAlign: 'right' },
});