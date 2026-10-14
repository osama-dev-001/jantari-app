import type { City, Region } from '../core/prayer/types';
import { varanasi } from './mosque/varanasi';
import { ahmedabad } from './mosque/ahmedabad';

// Cities with a curated local-mosque timetable use it; every other city is
// calculated offline with Adhan.js from its coordinates. The short ids of the
// original five cities (vns, amd, del, mum, pun) are kept so a city saved by
// the previous version of the app carries over.

const IST = 330;
const PKT = 300;
const BST = 360;
const NPT = 345;
const AST = 180; // Arabia Standard Time
const GST = 240; // Gulf Standard Time
const MYT = 480;

type Row = [id: string, name: string, lat: number, lon: number];

function group(country: string, region: Region, tzOffsetMin: number, rows: Row[]): City[] {
  return rows.map(([id, name, lat, lon]) => ({ id, name, country, region, lat, lon, tzOffsetMin }));
}

const MOSQUE_CITIES: City[] = [
  {
    id: 'vns', name: 'Varanasi', country: 'India', region: 'IN',
    lat: 25.3176, lon: 82.9739, tzOffsetMin: IST, timetable: varanasi,
  },
  {
    id: 'amd', name: 'Ahmedabad', country: 'India', region: 'IN',
    lat: 23.0225, lon: 72.5714, tzOffsetMin: IST, timetable: ahmedabad,
  },
];

export const CITIES: City[] = [
  ...MOSQUE_CITIES,
  ...group('India', 'IN', IST, [
    ['del', 'Delhi', 28.6139, 77.209],
    ['mum', 'Mumbai', 19.076, 72.8777],
    ['pun', 'Pune', 18.5204, 73.8567],
    ['lucknow', 'Lucknow', 26.8467, 80.9462],
    ['hyderabad', 'Hyderabad', 17.385, 78.4867],
    ['kolkata', 'Kolkata', 22.5726, 88.3639],
    ['bengaluru', 'Bengaluru', 12.9716, 77.5946],
    ['chennai', 'Chennai', 13.0827, 80.2707],
    ['srinagar', 'Srinagar', 34.0837, 74.7973],
    ['jammu', 'Jammu', 32.7266, 74.857],
    ['bhopal', 'Bhopal', 23.2599, 77.4126],
    ['patna', 'Patna', 25.5941, 85.1376],
    ['kanpur', 'Kanpur', 26.4499, 80.3319],
    ['prayagraj', 'Prayagraj', 25.4358, 81.8463],
    ['gorakhpur', 'Gorakhpur', 26.7606, 83.3732],
    ['azamgarh', 'Azamgarh', 26.0739, 83.1859],
    ['mau', 'Mau', 25.9417, 83.5611],
    ['aligarh', 'Aligarh', 27.8974, 78.088],
    ['agra', 'Agra', 27.1767, 78.0081],
    ['moradabad', 'Moradabad', 28.8386, 78.7733],
    ['rampur', 'Rampur', 28.803, 79.027],
    ['bareilly', 'Bareilly', 28.367, 79.4304],
    ['meerut', 'Meerut', 28.9845, 77.7064],
    ['deoband', 'Deoband', 29.6956, 77.677],
    ['jaipur', 'Jaipur', 26.9124, 75.7873],
    ['indore', 'Indore', 22.7196, 75.8577],
    ['surat', 'Surat', 21.1702, 72.8311],
    ['nagpur', 'Nagpur', 21.1458, 79.0882],
    ['aurangabad', 'Aurangabad', 19.8762, 75.3433],
    ['malegaon', 'Malegaon', 20.5579, 74.5287],
    ['bhiwandi', 'Bhiwandi', 19.2813, 73.0483],
    ['ranchi', 'Ranchi', 23.3441, 85.3096],
    ['guwahati', 'Guwahati', 26.1445, 91.7362],
    ['mysuru', 'Mysuru', 12.2958, 76.6394],
    ['mangaluru', 'Mangaluru', 12.9141, 74.856],
    ['kozhikode', 'Kozhikode', 11.2588, 75.7804],
    ['kochi', 'Kochi', 9.9312, 76.2673],
    ['thiruvananthapuram', 'Thiruvananthapuram', 8.5241, 76.9366],
  ]),
  ...group('Pakistan', 'PK', PKT, [
    ['karachi', 'Karachi', 24.8607, 67.0011],
    ['lahore', 'Lahore', 31.5204, 74.3587],
    ['islamabad', 'Islamabad', 33.6844, 73.0479],
    ['rawalpindi', 'Rawalpindi', 33.5651, 73.0169],
    ['peshawar', 'Peshawar', 34.0151, 71.5249],
    ['faisalabad', 'Faisalabad', 31.4504, 73.135],
    ['multan', 'Multan', 30.1575, 71.5249],
    ['hyderabad-pk', 'Hyderabad (Sindh)', 25.396, 68.3578],
    ['quetta', 'Quetta', 30.1798, 66.975],
  ]),
  ...group('Bangladesh', 'BD', BST, [
    ['dhaka', 'Dhaka', 23.8103, 90.4125],
    ['chattogram', 'Chattogram', 22.3569, 91.7832],
    ['sylhet', 'Sylhet', 24.8949, 91.8687],
  ]),
  ...group('Nepal', 'NP', NPT, [['kathmandu', 'Kathmandu', 27.7172, 85.324]]),
  ...group('Sri Lanka', 'LK', IST, [['colombo', 'Colombo', 6.9271, 79.8612]]),
  ...group('Saudi Arabia', 'SA', AST, [
    ['makkah', 'Makkah', 21.3891, 39.8579],
    ['madinah', 'Madinah', 24.5247, 39.5692],
    ['riyadh', 'Riyadh', 24.7136, 46.6753],
    ['jeddah', 'Jeddah', 21.4858, 39.1925],
    ['dammam', 'Dammam', 26.4207, 50.0888],
  ]),
  ...group('United Arab Emirates', 'AE', GST, [
    ['dubai', 'Dubai', 25.2048, 55.2708],
    ['abudhabi', 'Abu Dhabi', 24.4539, 54.3773],
    ['sharjah', 'Sharjah', 25.3463, 55.4209],
  ]),
  ...group('Qatar', 'QA', AST, [['doha', 'Doha', 25.2854, 51.531]]),
  ...group('Kuwait', 'KW', AST, [['kuwait', 'Kuwait City', 29.3759, 47.9774]]),
  ...group('Oman', 'OM', GST, [['muscat', 'Muscat', 23.588, 58.3829]]),
  ...group('Bahrain', 'BH', AST, [['manama', 'Manama', 26.2285, 50.586]]),
  ...group('Malaysia', 'MY', MYT, [['kualalumpur', 'Kuala Lumpur', 3.139, 101.6869]]),
  ...group('Singapore', 'SG', MYT, [['singapore', 'Singapore', 1.3521, 103.8198]]),
];

export const DEFAULT_CITY_ID = 'vns';

const BY_ID = new Map(CITIES.map(c => [c.id, c]));

export function getCity(id: string | null | undefined): City {
  return (id && BY_ID.get(id)) || BY_ID.get(DEFAULT_CITY_ID)!;
}

export function isKnownCity(id: string | null | undefined): boolean {
  return !!id && BY_ID.has(id);
}
