import React, { useEffect, useState, useCallback } from 'react';
import {
	View, Text, StyleSheet,
	TouchableOpacity, StatusBar, ScrollView,
	Modal, FlatList, SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vnsData } from '../data/vns';
import { amdData } from '../data/amd';
import { resolveTimings } from '../utils/api';
import { getCurrentAndNext, getCountdown } from '../utils/prayerUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JantariWidget } from '../widget/JantariWidget';
import { requestWidgetUpdate } from 'react-native-android-widget';

// ─── Constants ───────────────────────────────────────────────────────────────

const PRAYERS = ['Fajr', 'Sunrise', 'Zawal', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Midnight'];
const TABLE_COLS = ['Fajr', 'Sunrise', 'Zawal', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Midnight'];

const CITIES = [
	{ key: 'vns', label: 'Varanasi' },
	{ key: 'amd', label: 'Ahmedabad' },
];

const MONTHS = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December',
];

const QUARTERS = {
	all: MONTHS,
	q1: MONTHS.slice(0, 3),
	q2: MONTHS.slice(3, 6),
	q3: MONTHS.slice(6, 9),
	q4: MONTHS.slice(9, 12),
};

const staticDataMap = { vns: vnsData, amd: amdData };

// ─── Yearly View ─────────────────────────────────────────────────────────────
const COL_EMOJIS = {
	Date: '📅', Fajr: '🌌', Sunrise: '🌅', Zawal: '☀️',
	Dhuhr: '🌤️', Asr: '😊', Maghrib: '🌆', Isha: '🌙', Midnight: '✨',
};

const COL_COLORS = {
	Date: 'rgba(255,255,255,0.03)',
	Fajr: 'rgba(224,247,250,0.07)',
	Sunrise: 'rgba(224,247,250,0.07)',
	Zawal: 'rgba(255,248,225,0.07)',
	Dhuhr: 'rgba(255,248,225,0.07)',
	Asr: 'rgba(255,243,224,0.07)',
	Maghrib: 'rgba(252,228,236,0.07)',
	Isha: 'rgba(243,229,245,0.08)',
	Midnight: 'rgba(243,229,245,0.08)',
};

const ROW_GLOW_COLORS = [
	'rgba(109, 40, 217, 0.5)',   // base purple
	'rgba(124, 58, 237, 0.4)',   // medium purple
	'rgba(139, 92, 246, 0.3)',   // light purple
	'rgba(91, 33, 182, 0.5)',    // deep purple
];

function YearlyView({ cityKey }) {
	const [quarter, setQuarter] = useState('all');
	const data = staticDataMap[cityKey];

	const today = new Date();
	const todayMonth = today.toLocaleString('en-US', { month: 'long' });
	const todayDate = String(today.getDate()).padStart(2, '0');

	const visibleMonths = QUARTERS[quarter].filter(m => data?.[m]);

	return (
		<View style={{ flex: 1 }}>
			{/* Quarter filter */}
			<View style={y.quarterRow}>
				{Object.keys(QUARTERS).map(q => (
					<TouchableOpacity
						key={q}
						style={[y.qBtn, quarter === q && y.qBtnActive]}
						onPress={() => setQuarter(q)}
					>
						<Text style={[y.qBtnText, quarter === q && y.qBtnTextActive]}>
							{q.toUpperCase()}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* Glowing card wrapper */}
			<View style={y.glowCard}>
				<View style={y.glowCardInner}>
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<View>

							{/* Header */}
							<View style={y.tableHeader}>
								<View style={[y.thCell, y.colDate]}>
									<Text style={y.thEmoji}>📅</Text>
									<Text style={y.thLabel}>DATE</Text>
								</View>
								{TABLE_COLS.map(col => (
									<View key={col} style={[y.thCell, y.colTime]}>  {/* ← no backgroundColor here */}
										<Text style={y.thEmoji}>{COL_EMOJIS[col]}</Text>
										<Text style={y.thLabel}>{col.toUpperCase()}</Text>
									</View>
								))}
							</View>

							{/* Rows */}
							<ScrollView
								nestedScrollEnabled={true}
								showsVerticalScrollIndicator={false}
								style={{ flex: 1 }}
							>
								{visibleMonths.map(month => (
									<View key={month}>
										<View style={y.monthHeader}>
											<Text style={y.monthTitle}>✦  {month.toUpperCase()}</Text>
										</View>
										{data[month].map((item, idx) => {
											const isToday = item.Date === todayDate && month === todayMonth;
											const glowColor = ROW_GLOW_COLORS[idx % ROW_GLOW_COLORS.length];
											return (
												<View
													key={item.Date}
													style={[
														y.row,
														{ borderBottomColor: glowColor },
														isToday && y.rowToday,
													]}
												>
													<View style={[y.colDate, y.tdDateCell, { backgroundColor: isToday ? 'transparent' : '' }]}>
														{isToday && <Text style={y.todayTag}>TODAY</Text>}
														<Text style={[y.tdDate, isToday && y.tdTodayText]}>{item.Date}</Text>
													</View>
													{TABLE_COLS.map(col => (
														<Text
															key={col}
															style={[y.td, y.colTime, isToday && y.tdTodayText, { backgroundColor: isToday ? 'transparent' : '' }]}
														>
															{item[col] || '---'}
														</Text>
													))}
												</View>
											);
										})}
									</View>
								))}
							</ScrollView>

						</View>
					</ScrollView>
				</View>
			</View>
		</View>
	);
}

// ─── City Dropdown ────────────────────────────────────────────────────────────

function CityDropdown({ cityKey, onChange }) {
	const [open, setOpen] = useState(false);
	const current = CITIES.find(c => c.key === cityKey);

	return (
		<>
			<TouchableOpacity style={d.pill} onPress={() => setOpen(true)}>
				<Text style={d.pillText}>{current?.label}</Text>
				<Text style={d.pillArrow}>▾</Text>
			</TouchableOpacity>

			<Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
				<TouchableOpacity style={d.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
					<View style={d.sheet}>
						<Text style={d.sheetTitle}>Select City</Text>
						{CITIES.map(c => (
							<TouchableOpacity
								key={c.key}
								style={[d.option, c.key === cityKey && d.optionActive]}
								onPress={() => { onChange(c.key); setOpen(false); }}
							>
								<Text style={[d.optionText, c.key === cityKey && d.optionTextActive]}>
									{c.label}
								</Text>
								{c.key === cityKey && <Text style={d.check}>✓</Text>}
							</TouchableOpacity>
						))}
					</View>
				</TouchableOpacity>
			</Modal>
		</>
	);
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
	const [cityKey, setCityKey] = useState('vns');
	const [timings, setTimings] = useState(null);
	const [nextSalah, setNextSalah] = useState(null);
	const [currentSalah, setCurrentSalah] = useState(null);
	const [countdown, setCountdown] = useState('');
	const [clock, setClock] = useState('');
	const [activeTab, setActiveTab] = useState('live');

	// Load city on mount
	useEffect(() => {
		AsyncStorage.getItem('selected_city').then(c => { if (c) setCityKey(c); });
	}, []);

	// Fetch timings on city change
	useEffect(() => {
		resolveTimings(cityKey, staticDataMap).then(setTimings);
		AsyncStorage.setItem('selected_city', cityKey);
	}, [cityKey]);

	// Clock + countdown tick
	useEffect(() => {
		if (!timings) return;
		const tick = () => {
			const { current, next } = getCurrentAndNext(timings);
			setCurrentSalah(current);
			setNextSalah(next);
			setCountdown(getCountdown(next.time));
			setClock(new Date().toLocaleTimeString('en-US', {
				hour: '2-digit', minute: '2-digit', second: '2-digit',
			}));
		};
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, [timings]);

	// Widget update
	useEffect(() => {
		if (!timings) return;
		const cityLabel = CITIES.find(c => c.key === cityKey)?.label || cityKey;
		const { current, next } = getCurrentAndNext(timings);

		requestWidgetUpdate({
			widgetName: 'Jantari',
			renderWidget: () => (
				<JantariWidget
					city={cityLabel}
					currentSalah={current?.name || null}
					nextSalah={next.label || next.name}
					nextTime={next.timeStr}
					countdown={getCountdown(next.time)}
				/>
			),
			widgetNotFound: () => { },
		}).catch(() => { });
	}, [cityKey, timings]);

	const switchCity = useCallback((key) => {
		setCityKey(key);
	}, []);

	const today = new Date().toLocaleDateString('en-US', {
		weekday: 'long', day: 'numeric', month: 'long',
	});

	return (
		<SafeAreaView style={s.root}>
			<StatusBar barStyle="light-content" backgroundColor="#0f1923" />

			{/* ── Header ── */}
			<View style={s.header}>
				<View>
					<Text style={s.appTitle}>Jantari</Text>
					<Text style={s.dateStr}>{today}</Text>
				</View>
				<CityDropdown cityKey={cityKey} onChange={switchCity} />
			</View>

			{/* ── Tab switcher ── */}
			<View style={s.tabRow}>
				<TouchableOpacity
					style={[s.tab, activeTab === 'live' && s.tabActive]}
					onPress={() => setActiveTab('live')}
				>
					<Text style={[s.tabText, activeTab === 'live' && s.tabTextActive]}>Live Schedule</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[s.tab, activeTab === 'yearly' && s.tabActive]}
					onPress={() => setActiveTab('yearly')}
				>
					<Text style={[s.tabText, activeTab === 'yearly' && s.tabTextActive]}>Yearly Jantari</Text>
				</TouchableOpacity>
			</View>

			{/* ── Tab Content ── */}
			{activeTab === 'live' ? (
				<ScrollView contentContainerStyle={s.scroll}>
					{/* Clock */}
					{/* Compact Next Salah Banner */}
					<View style={s.nextBanner}>
						<View style={s.nextBannerLeft}>
							<Text style={s.nextBannerLabel}>NEXT</Text>
							<Text style={s.nextBannerName}>{nextSalah?.label || nextSalah?.name}</Text>
						</View>
						<View style={s.nextBannerRight}>
							<Text style={s.nextBannerTime}>{nextSalah?.timeStr}</Text>
							<Text style={s.nextBannerCountdown}>{countdown}</Text>
						</View>
					</View>

					{/* Daily schedule */}
					<View style={s.scheduleCard}>
						{PRAYERS.filter(name => timings?.[name]).map(name => {
							const isNext = nextSalah?.name === name;
							const isCurrent = currentSalah?.name === name;
							return (
								<View key={name} style={[s.row, isNext && s.rowNext, isCurrent && !isNext && s.rowCurrent]}>
									<Text style={[s.prayerName, isNext && s.textAccent, isCurrent && !isNext && s.textGreen]}>
										{name}
									</Text>
									<Text style={[s.prayerTime, isNext && s.textAccent, isCurrent && !isNext && s.textGreen]}>
										{timings[name]}
									</Text>
									{isNext && <Text style={s.badge}>NEXT</Text>}
									{isCurrent && !isNext && <Text style={s.badgeCurrent}>NOW</Text>}
								</View>
							);
						})}
					</View>

					<Text style={s.sehriIftar}>
						Sehri: {timings?.Fajr || '---'} · Iftar: {timings?.Maghrib || '---'}
					</Text>
				</ScrollView>
			) : (
				<View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 10 }}>
					<YearlyView cityKey={cityKey} />
				</View>
			)}
		</SafeAreaView>
	);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
	root: { flex: 1, backgroundColor: '#0f1923' },
	header: {
		flexDirection: 'row', justifyContent: 'space-between',
		alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
	},
	appTitle: { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: 1 },
	dateStr: { fontSize: 13, color: '#6b7280', marginTop: 2 },
	tabRow: {
		flexDirection: 'row', marginHorizontal: 20, marginBottom: 12,
		backgroundColor: '#1e293b', borderRadius: 12, padding: 4,
	},
	tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
	tabActive: { backgroundColor: '#6d28d9' },
	tabText: { color: '#6b7280', fontWeight: '600', fontSize: 13 },
	tabTextActive: { color: '#fff' },
	scroll: { paddingHorizontal: 20, paddingBottom: 30 },
	nextBanner: {
		backgroundColor: '#1e293b',
		borderRadius: 16,
		padding: 16,
		marginBottom: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderLeftWidth: 4,
		borderLeftColor: '#6d28d9',
	},
	nextBannerLeft: { gap: 4 },
	nextBannerLabel: {
		fontSize: 10, color: '#6b7280',
		fontWeight: '800', letterSpacing: 2,
	},
	nextBannerName: {
		fontSize: 22, color: '#a78bfa',
		fontWeight: '800', letterSpacing: 1,
	},
	nextBannerRight: { alignItems: 'flex-end', gap: 4 },
	nextBannerTime: {
		fontSize: 14, color: '#d1d5db', fontWeight: '600',
	},
	nextBannerCountdown: {
		fontSize: 20, color: '#34d399',
		fontWeight: '800', letterSpacing: 1,
	},
	scheduleCard: {
		backgroundColor: '#1e293b', borderRadius: 20,
		overflow: 'hidden', marginBottom: 14,
	},
	row: {
		flexDirection: 'row', alignItems: 'center',
		paddingHorizontal: 18, paddingVertical: 13,
		borderBottomWidth: 1, borderBottomColor: '#0f1923',
	},
	rowCurrent: { backgroundColor: '#052e16' },
	rowNext: { backgroundColor: '#1a1040' },
	prayerName: { flex: 1, fontSize: 15, color: '#d1d5db', fontWeight: '500' },
	prayerTime: { fontSize: 15, color: '#9ca3af' },
	textAccent: { color: '#a78bfa' },
	badge: {
		marginLeft: 8, backgroundColor: '#6d28d9', color: '#fff',
		fontSize: 9, fontWeight: '700', paddingHorizontal: 7,
		paddingVertical: 2, borderRadius: 5, letterSpacing: 1,
	},
	badgeCurrent: {
		marginLeft: 8, backgroundColor: '#065f46', color: '#34d399',
		fontSize: 9, fontWeight: '700', paddingHorizontal: 7,
		paddingVertical: 2, borderRadius: 5,
	},
	sehriIftar: { textAlign: 'center', color: '#6b7280', fontSize: 12, marginBottom: 10 },
});

// Dropdown styles
const d = StyleSheet.create({
	pill: {
		flexDirection: 'row', alignItems: 'center',
		backgroundColor: '#1e293b', borderRadius: 20,
		paddingHorizontal: 14, paddingVertical: 8, gap: 6,
	},
	pillText: { color: '#fff', fontWeight: '600', fontSize: 14 },
	pillArrow: { color: '#6b7280', fontSize: 12 },
	overlay: {
		flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'flex-end',
	},
	sheet: {
		backgroundColor: '#1e293b', borderTopLeftRadius: 20,
		borderTopRightRadius: 20, padding: 20, paddingBottom: 36,
	},
	sheetTitle: {
		color: '#6b7280', fontSize: 11, fontWeight: '700',
		letterSpacing: 2, marginBottom: 12,
	},
	option: {
		flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
		paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#0f1923',
	},
	optionActive: {},
	optionText: { fontSize: 16, color: '#d1d5db', fontWeight: '500' },
	optionTextActive: { color: '#a78bfa', fontWeight: '700' },
	check: { color: '#a78bfa', fontSize: 16 },
});

// Yearly styles
const y = StyleSheet.create({
	quarterRow: {
		flexDirection: 'row', gap: 8, marginBottom: 14,
	},
	qBtn: {
		flex: 1, paddingVertical: 7, alignItems: 'center',
		backgroundColor: '#1e293b', borderRadius: 8,
	},
	qBtnActive: { backgroundColor: '#6d28d9' },
	qBtnText: { color: '#6b7280', fontSize: 12, fontWeight: '700' },
	qBtnTextActive: { color: '#fff' },

	// ── Glowing card (like landing page) ──
	glowCard: {
		flex: 1,
		borderRadius: 18,
		padding: 2,
		backgroundColor: 'transparent',
		shadowColor: '#6d28d9',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.4,        // was 0.9
		shadowRadius: 8,           // was 12
		elevation: 6,              // was 12
		borderWidth: 1,            // was 1.5
		borderColor: '#3b1f6e',    // was #6d28d9 — much darker purple
	},
	glowCardInner: {
		backgroundColor: '#111827',
		borderRadius: 16,
		overflow: 'hidden',
		flex: 1
	},

	// ── Table Header ──
	tableHeader: {
		flexDirection: 'row',
		backgroundColor: '#1a1040',          // deep purple tint like landing cards
		paddingVertical: 12,
		paddingHorizontal: 4,
		borderBottomWidth: 1,
		borderBottomColor: '#6d28d9',        // purple separator line
	},
	thCell: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 2,
	},
	thEmoji: { fontSize: 18, marginBottom: 4 },
	thLabel: {
		fontSize: 8, fontWeight: '800',
		color: '#a78bfa', letterSpacing: 1,  // purple labels
	},

	// ── Month Header ──
	monthHeader: {
		backgroundColor: '#0f0a1e',          // very dark purple
		paddingVertical: 7, paddingHorizontal: 8,
		marginTop: 4,
		borderLeftWidth: 3, borderLeftColor: '#7c3aed',
	},
	monthTitle: {
		color: '#a78bfa', fontSize: 11,
		fontWeight: '800', letterSpacing: 2,
	},

	// ── Rows ──
	row: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: 'transparent', // overridden per row
		alignItems: 'center',
	},
	rowToday: { backgroundColor: '#1a1040' },

	// ── Date cell ──
	tdDateCell: {
		alignItems: 'center', justifyContent: 'center',
		paddingVertical: 8,
	},
	todayTag: {
		fontSize: 7, fontWeight: '800',
		backgroundColor: '#6d28d9', color: '#fff',
		paddingHorizontal: 3, paddingVertical: 1,
		borderRadius: 3, marginBottom: 2, letterSpacing: 1,
	},
	tdDate: {
		color: '#6b7280', fontSize: 12,
		fontWeight: '700', textAlign: 'center',
	},

	// ── Time cells ──
	td: {
		fontFamily: 'monospace',
		fontSize: 11, color: '#9ca3af',
		textAlign: 'center',
		paddingVertical: 8,
	},
	tdTodayText: { color: '#a78bfa', fontWeight: '700' },

	// ── Column widths ──
	colDate: { width: 44 },
	colTime: { width: 82 },
});