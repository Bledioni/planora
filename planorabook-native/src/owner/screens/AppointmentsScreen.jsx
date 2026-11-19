import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Phone, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react-native';
import { api } from '../../api/api';
import { colors, spacing, radius, fontSize, shadow } from '../../styles/theme';

const { width } = Dimensions.get('window');
const DAY_WIDTH = (width - spacing.lg * 2 - 80) / 7;

const getLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const DAYS = ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'];

const getStatusColor = (status) => {
  if (status === 'completed') return colors.green;
  if (status === 'cancelled') return colors.red;
  if (status === 'confirmed') return colors.primary;
  return colors.amber;
};

const getStatusBg = (status) => {
  if (status === 'completed') return colors.greenLight;
  if (status === 'cancelled') return colors.redLight;
  if (status === 'confirmed') return colors.primaryLight;
  return colors.amberLight;
};

const getStatusLabel = (status) => {
  if (status === 'completed') return 'Kryer';
  if (status === 'cancelled') return 'Anuluar';
  if (status === 'confirmed') return 'Konfirmuar';
  return 'Pritje';
};

export default function AppointmentsScreen() {
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [employees, setEmployees]       = useState([]);
  const [selectedEmp, setSelectedEmp]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  const calendarDays = (() => {
    const days = [];
    const [y, m, d] = selectedDate.split('-').map(Number);
    for (let i = -3; i <= 3; i++) {
      const date = new Date(y, m - 1, d + i);
      days.push({
        full: getLocalDateString(date),
        num:  date.getDate(),
        name: DAYS[date.getDay()],
      });
    }
    return days;
  })();

  useEffect(() => { fetchEmployees(); }, []);

  useEffect(() => {
    if (selectedEmp !== null) fetchAppointments();
  }, [selectedDate, selectedEmp]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/owner/analytics/employees-schedules');
      const emps = res.data.employees || [];
      setEmployees(emps);
      if (emps.length > 0) setSelectedEmp(emps[0].id);
      else setLoading(false);
    } catch { setLoading(false); }
  };

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/owner/appointments/list', {
        params: { date: selectedDate, employee_id: selectedEmp }
      });
      setAppointments(res.data.appointments || []);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate, selectedEmp]);

  const handleCancel = (apt) => {
    Alert.alert(
      'Anulo Terminin?',
      `A jeni të sigurt? Klienti ${apt.client_name} do të njoftohet me email.`,
      [
        { text: 'Mbyll', style: 'cancel' },
        {
          text: 'Po, Anulo!',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(
                apt.ids.map(id => api.put(`/owner/appointments/update-status/${id}`, { status: 'cancelled' }))
              );
              fetchAppointments();
            } catch {
              Alert.alert('Gabim', 'Ndodhi një gabim gjatë anulimit.');
            }
          }
        }
      ]
    );
  };

  const navigate = (dir) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d + dir);
    setSelectedDate(getLocalDateString(date));
  };

  const today    = getLocalDateString(new Date());
  const active    = appointments.filter(a => a.status !== 'cancelled');
  const cancelled = appointments.filter(a => a.status === 'cancelled');

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('sq-AL', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <SafeAreaView style={styles.container}>

      {/* Fixed Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Terminet</Text>
          <Text style={styles.headerSub}>{formattedDate}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{active.length}</Text>
        </View>
      </View>

      {/* Employee Pills */}
      {employees.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.empRow}
          style={styles.empScroll}
        >
          {employees.map(emp => (
            <TouchableOpacity
              key={emp.id}
              onPress={() => setSelectedEmp(emp.id)}
              style={[styles.empPill, selectedEmp === emp.id && styles.empPillActive]}
              activeOpacity={0.8}
            >
              <View style={[styles.empAvatar, selectedEmp === emp.id && styles.empAvatarActive]}>
                <Text style={[styles.empAvatarText, selectedEmp === emp.id && { color: '#fff' }]}>
                  {emp.name?.[0]}
                </Text>
              </View>
              <Text style={[styles.empPillText, selectedEmp === emp.id && styles.empPillTextActive]}>
                {emp.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Calendar Strip */}
      <View style={styles.calendarCard}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.navBtn} activeOpacity={0.7}>
          <ChevronLeft size={18} color={colors.primary} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.daysRow}>
          {calendarDays.map(day => {
            const isActive = day.full === selectedDate;
            const isToday  = day.full === today;
            return (
              <TouchableOpacity
                key={day.full}
                onPress={() => setSelectedDate(day.full)}
                style={[styles.dayBox, isActive && styles.dayBoxActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayName, isActive && styles.dayNameActive]}>
                  {day.name}
                </Text>
                <Text style={[styles.dayNum, isActive && styles.dayNumActive]}>
                  {day.num}
                </Text>
                {isToday && (
                  <View style={[styles.todayDot, isActive && styles.todayDotActive]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity onPress={() => navigate(1)} style={styles.navBtn} activeOpacity={0.7}>
          <ChevronRight size={18} color={colors.primary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchAppointments(); }}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
        ) : appointments.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Calendar size={36} color={colors.primaryMid} />
            </View>
            <Text style={styles.emptyTitle}>Nuk ka termine</Text>
            <Text style={styles.emptyText}>Nuk ka termine të planifikuara për këtë ditë.</Text>
          </View>
        ) : (
          <>
            {/* Active appointments */}
            {active.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Aktive • {active.length}</Text>
                {active.map((apt) => (
                  <View key={apt.ids?.join('-') || apt.id} style={styles.aptCard}>

                    {/* Time column */}
                    <View style={styles.timeCol}>
                      <Text style={styles.timeText}>{apt.appointment_time?.slice(0, 5)}</Text>
                      <View style={[styles.timeDot, { backgroundColor: getStatusColor(apt.status) }]} />
                    </View>

                    {/* Main content */}
                    <View style={styles.aptBody}>
                      <View style={styles.aptTop}>
                        <View style={styles.avatarCircle}>
                          <Text style={styles.avatarText}>{apt.client_name?.[0]?.toUpperCase()}</Text>
                        </View>
                        <View style={styles.aptInfo}>
                          <Text style={styles.clientName}>{apt.client_name}</Text>
                          <Text style={styles.serviceName} numberOfLines={1}>
                            {apt.services?.map(s => s?.name).filter(Boolean).join(' · ') || apt.service?.name}
                          </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(apt.status) }]}>
                          <Text style={[styles.statusText, { color: getStatusColor(apt.status) }]}>
                            {getStatusLabel(apt.status)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.aptBottom}>
                        {apt.client_phone && (
                          <View style={styles.metaItem}>
                            <Phone size={11} color={colors.muted} />
                            <Text style={styles.metaText}>{apt.client_phone}</Text>
                          </View>
                        )}
                        <View style={styles.aptBottomRight}>
                          <Text style={styles.priceText}>{Number(apt.total_price || 0).toFixed(2)}€</Text>
                          {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                            <TouchableOpacity
                              onPress={() => handleCancel(apt)}
                              style={styles.cancelBtn}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.cancelBtnText}>Anulo</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Cancelled appointments */}
            {cancelled.length > 0 && (
              <View style={styles.section}>
                <View style={styles.cancelledHeader}>
                  <AlertCircle size={13} color={colors.red} />
                  <Text style={styles.cancelledLabel}>Të Anuluara • {cancelled.length}</Text>
                </View>
                {cancelled.map((apt) => (
                  <View key={apt.ids?.join('-') || apt.id} style={[styles.aptCard, styles.aptCardCancelled]}>
                    <View style={styles.timeCol}>
                      <Text style={[styles.timeText, { color: colors.muted }]}>{apt.appointment_time?.slice(0, 5)}</Text>
                      <View style={[styles.timeDot, { backgroundColor: colors.red }]} />
                    </View>
                    <View style={styles.aptBody}>
                      <View style={styles.aptTop}>
                        <View style={[styles.avatarCircle, styles.avatarCancelled]}>
                          <Text style={[styles.avatarText, { color: colors.red }]}>{apt.client_name?.[0]?.toUpperCase()}</Text>
                        </View>
                        <View style={styles.aptInfo}>
                          <Text style={[styles.clientName, { color: colors.muted }]}>{apt.client_name}</Text>
                          <Text style={styles.serviceName} numberOfLines={1}>
                            {apt.services?.map(s => s?.name).filter(Boolean).join(' · ')}
                          </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: colors.redLight }]}>
                          <Text style={[styles.statusText, { color: colors.red }]}>Anuluar</Text>
                        </View>
                      </View>
                      <View style={styles.aptBottom}>
                        <View style={styles.aptBottomRight}>
                          <Text style={[styles.priceText, { color: colors.muted }]}>
                            {Number(apt.total_price || 0).toFixed(2)}€
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  /* Header */
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: colors.dark, letterSpacing: -0.5 },
  headerSub:   { fontSize: fontSize.sm, color: colors.muted, marginTop: 3, textTransform: 'capitalize' },
  headerBadge: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    minWidth: 36, height: 36, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerBadgeText: { color: '#fff', fontWeight: '800', fontSize: fontSize.md },

  /* Employee */
  empScroll: { maxHeight: 52 },
  empRow:    { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  empPill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
  },
  empPillActive: { backgroundColor: colors.primaryLight, borderColor: colors.primaryMid },
  empAvatar: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  empAvatarActive: { backgroundColor: colors.primary },
  empAvatarText:   { fontSize: 11, fontWeight: '700', color: colors.muted },
  empPillText:     { fontSize: fontSize.sm, fontWeight: '600', color: colors.muted },
  empPillTextActive: { color: colors.primary },

  /* Calendar */
  calendarCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, marginHorizontal: spacing.lg,
    borderRadius: radius.lg, padding: spacing.sm,
    marginBottom: spacing.md, marginTop: spacing.sm,
    ...shadow.sm,
  },
  navBtn: { padding: spacing.sm },
  daysRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  dayBox: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, borderRadius: radius.md,
    flex: 1,
  },
  dayBoxActive: { backgroundColor: colors.primary },
  dayName: { fontSize: 9, fontWeight: '700', color: colors.mutedLight, textTransform: 'uppercase', letterSpacing: 0.4 },
  dayNameActive: { color: 'rgba(255,255,255,0.75)' },
  dayNum:  { fontSize: fontSize.lg, fontWeight: '800', color: colors.dark, marginTop: 2 },
  dayNumActive: { color: '#fff', fontSize: fontSize.xl },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: 3 },
  todayDotActive: { backgroundColor: 'rgba(255,255,255,0.6)' },

  /* Scroll content */
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 100 },

  /* Empty */
  empty: { alignItems: 'center', paddingVertical: 60, gap: spacing.sm },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.dark },
  emptyText:  { fontSize: fontSize.sm, color: colors.muted, textAlign: 'center', maxWidth: 240 },

  /* Section */
  section: { marginBottom: spacing.lg },
  sectionLabel: {
    fontSize: fontSize.xs, fontWeight: '700', color: colors.muted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  cancelledHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  cancelledLabel: {
    fontSize: fontSize.xs, fontWeight: '700', color: colors.red,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },

  /* Appointment Card */
  aptCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    marginBottom: spacing.sm, flexDirection: 'row',
    overflow: 'hidden', ...shadow.sm,
  },
  aptCardCancelled: { opacity: 0.65 },

  timeCol: {
    width: 56, alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.md, gap: 6,
    borderRightWidth: 1, borderRightColor: colors.border,
    backgroundColor: colors.bg,
  },
  timeText: { fontSize: 11, fontWeight: '700', color: colors.primary, fontVariant: ['tabular-nums'] },
  timeDot:  { width: 8, height: 8, borderRadius: 4 },

  aptBody: { flex: 1, padding: spacing.md },

  aptTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarCancelled: { backgroundColor: colors.redLight },
  avatarText: { fontSize: fontSize.md, fontWeight: '800', color: colors.primary },

  aptInfo: { flex: 1 },
  clientName:  { fontSize: fontSize.md, fontWeight: '700', color: colors.dark },
  serviceName: { fontSize: fontSize.xs, color: colors.muted, marginTop: 2 },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full, flexShrink: 0 },
  statusText:  { fontSize: 10, fontWeight: '700' },

  aptBottom: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: fontSize.xs, color: colors.muted },
  aptBottomRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginLeft: 'auto' },
  priceText: { fontSize: fontSize.md, fontWeight: '800', color: colors.dark },

  cancelBtn: {
    backgroundColor: colors.redLight, borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 5,
    borderWidth: 1, borderColor: '#fecaca',
  },
  cancelBtnText: { fontSize: 11, fontWeight: '700', color: colors.red },
});