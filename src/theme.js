// Single source of truth for color across the app and the home-screen widget.
// Palette intent: a purple-black "manuscript" base (Jantari's existing violet
// identity) with an antique-gold second accent for Dhikr — gold/purple is a
// deliberate pairing, not a random pick, and replaces the teal that had been
// standing in for Dhikr's identity color with no relation to anything else.
export const COLORS = {
	// Surfaces — all purple-black, replacing the old blue-slate Tailwind
	// defaults (#0f1923/#1e293b/#111827) that fought the violet accent colors.
	bg: '#140b22',
	surface: '#1e1a30',
	surfaceDeep: '#1a0f2e', // matches the widget's panel color exactly
	surfaceDeepest: '#120a1f',

	border: '#3b1f6e',
	borderSubtle: 'rgba(167,139,250,0.14)',

	// Primary — Jantari / prayer-times identity (unchanged, already coherent)
	primary: '#6d28d9',
	primaryVivid: '#7c3aed',
	primaryLight: '#a78bfa',

	// Gold — Dhikr identity (was an unrelated teal, #0e7490)
	gold: '#c99a3f',
	amber: '#d97706', // kept distinct for the "morning" sunrise metaphor only

	// Success — countdown / completion (kept, already consistent)
	success: '#34d399',
	successSurface: '#0c2a20', // unifies 4 near-duplicate dark greens
	successBadgeBg: '#155e3f', // unifies 2 near-duplicate badge-chip greens

	// Text — shifted from neutral/blue-tinted grays to purple-tinted ones so
	// they read as part of the same family as the background, not Tailwind
	// defaults dropped in on top of it. Same contrast steps as before.
	textPrimary: '#f5f2fb',
	textSecondary: '#cbc2e0',
	textMuted: '#9a8fb5',
	textFaint: '#6b6288',
	textFainter: '#4a4266',

	white: '#ffffff',
};
