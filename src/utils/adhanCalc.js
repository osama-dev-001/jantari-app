import { Coordinates, PrayerTimes, CalculationMethod, Madhab, SunnahTimes } from 'adhan';

const MONTH_NAMES = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December',
];

function to12h(date) {
	let h = date.getHours();
	const m = date.getMinutes();
	const period = h >= 12 ? 'PM' : 'AM';
	h = h % 12 || 12;
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

function calcDayTimings(coords, params, date) {
	const pt = new PrayerTimes(coords, date, params);
	const st = new SunnahTimes(pt);
	return {
		Date: String(date.getDate()).padStart(2, '0'),
		Fajr: to12h(pt.fajr),
		Sunrise: to12h(pt.sunrise),
		Dhuhr: to12h(pt.dhuhr),
		Asr: to12h(pt.asr),
		Maghrib: to12h(pt.maghrib),
		Isha: to12h(pt.isha),
		Midnight: to12h(st.middleOfTheNight),
	};
}

export function calcYearTimings(city, madhabPref = 'shafi') {
	const coords = new Coordinates(city.lat, city.lon);
	const params = CalculationMethod.Karachi();
	params.madhab = madhabPref === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;

	const year = new Date().getFullYear();
	const data = {};

	for (let m = 0; m < 12; m++) {
		const daysInMonth = new Date(year, m + 1, 0).getDate();
		data[MONTH_NAMES[m]] = [];
		for (let d = 1; d <= daysInMonth; d++) {
			data[MONTH_NAMES[m]].push(calcDayTimings(coords, params, new Date(year, m, d)));
		}
	}

	return data;
}
