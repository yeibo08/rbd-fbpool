export interface CountryData {
  code: string;
  name: string;
  short: string;
  flagEmoji: string;
  groupLetter: string;
  flagUrl: string;
}

export interface VenueData {
  name: string;
  city: string;
  country: string;
}

export interface MatchData {
  id: string;
  matchNumber: number;
  stage: string;
  groupLetter: string | null;
  homeTeamCode: string | null;
  awayTeamCode: string | null;
  homeTeamLabel: string;
  awayTeamLabel: string;
  kickoffAt: string; // ISO 8601 UTC
  venueName: string; // used by seed script to look up venue id
}

// ── Countries ──────────────────────────────────────────────────────────────
export const countries: CountryData[] = [
  // Grupo A
  { code: "MX",     name: "México",              short: "MEX", flagEmoji: "🇲🇽", groupLetter: "A", flagUrl: "https://flagcdn.com/mx.svg" },
  { code: "ZA",     name: "Sudáfrica",            short: "RSA", flagEmoji: "🇿🇦", groupLetter: "A", flagUrl: "https://flagcdn.com/za.svg" },
  { code: "KR",     name: "Corea del Sur",        short: "KOR", flagEmoji: "🇰🇷", groupLetter: "A", flagUrl: "https://flagcdn.com/kr.svg" },
  { code: "CZ",     name: "Chequia",              short: "CZE", flagEmoji: "🇨🇿", groupLetter: "A", flagUrl: "https://flagcdn.com/cz.svg" },
  // Grupo B
  { code: "CA",     name: "Canadá",               short: "CAN", flagEmoji: "🇨🇦", groupLetter: "B", flagUrl: "https://flagcdn.com/ca.svg" },
  { code: "BA",     name: "Bosnia y Herzegovina", short: "BIH", flagEmoji: "🇧🇦", groupLetter: "B", flagUrl: "https://flagcdn.com/ba.svg" },
  { code: "QA",     name: "Qatar",                short: "QAT", flagEmoji: "🇶🇦", groupLetter: "B", flagUrl: "https://flagcdn.com/qa.svg" },
  { code: "CH",     name: "Suiza",                short: "SUI", flagEmoji: "🇨🇭", groupLetter: "B", flagUrl: "https://flagcdn.com/ch.svg" },
  // Grupo C
  { code: "BR",     name: "Brasil",               short: "BRA", flagEmoji: "🇧🇷", groupLetter: "C", flagUrl: "https://flagcdn.com/br.svg" },
  { code: "MA",     name: "Marruecos",            short: "MAR", flagEmoji: "🇲🇦", groupLetter: "C", flagUrl: "https://flagcdn.com/ma.svg" },
  { code: "HT",     name: "Haití",                short: "HAI", flagEmoji: "🇭🇹", groupLetter: "C", flagUrl: "https://flagcdn.com/ht.svg" },
  { code: "GB-SCT", name: "Escocia",              short: "SCO", flagEmoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", groupLetter: "C", flagUrl: "https://flagcdn.com/gb-sct.svg" },
  // Grupo D
  { code: "US",     name: "Estados Unidos",       short: "USA", flagEmoji: "🇺🇸", groupLetter: "D", flagUrl: "https://flagcdn.com/us.svg" },
  { code: "PY",     name: "Paraguay",             short: "PAR", flagEmoji: "🇵🇾", groupLetter: "D", flagUrl: "https://flagcdn.com/py.svg" },
  { code: "AU",     name: "Australia",            short: "AUS", flagEmoji: "🇦🇺", groupLetter: "D", flagUrl: "https://flagcdn.com/au.svg" },
  { code: "TR",     name: "Türkiye",              short: "TUR", flagEmoji: "🇹🇷", groupLetter: "D", flagUrl: "https://flagcdn.com/tr.svg" },
  // Grupo E
  { code: "DE",     name: "Alemania",             short: "GER", flagEmoji: "🇩🇪", groupLetter: "E", flagUrl: "https://flagcdn.com/de.svg" },
  { code: "CW",     name: "Curazao",              short: "CUW", flagEmoji: "🇨🇼", groupLetter: "E", flagUrl: "https://flagcdn.com/cw.svg" },
  { code: "CI",     name: "Costa de Marfil",      short: "CIV", flagEmoji: "🇨🇮", groupLetter: "E", flagUrl: "https://flagcdn.com/ci.svg" },
  { code: "EC",     name: "Ecuador",              short: "ECU", flagEmoji: "🇪🇨", groupLetter: "E", flagUrl: "https://flagcdn.com/ec.svg" },
  // Grupo F
  { code: "NL",     name: "Países Bajos",         short: "NED", flagEmoji: "🇳🇱", groupLetter: "F", flagUrl: "https://flagcdn.com/nl.svg" },
  { code: "JP",     name: "Japón",                short: "JPN", flagEmoji: "🇯🇵", groupLetter: "F", flagUrl: "https://flagcdn.com/jp.svg" },
  { code: "SE",     name: "Suecia",               short: "SWE", flagEmoji: "🇸🇪", groupLetter: "F", flagUrl: "https://flagcdn.com/se.svg" },
  { code: "TN",     name: "Túnez",                short: "TUN", flagEmoji: "🇹🇳", groupLetter: "F", flagUrl: "https://flagcdn.com/tn.svg" },
  // Grupo G
  { code: "BE",     name: "Bélgica",              short: "BEL", flagEmoji: "🇧🇪", groupLetter: "G", flagUrl: "https://flagcdn.com/be.svg" },
  { code: "EG",     name: "Egipto",               short: "EGY", flagEmoji: "🇪🇬", groupLetter: "G", flagUrl: "https://flagcdn.com/eg.svg" },
  { code: "IR",     name: "Irán",                 short: "IRN", flagEmoji: "🇮🇷", groupLetter: "G", flagUrl: "https://flagcdn.com/ir.svg" },
  { code: "NZ",     name: "Nueva Zelanda",        short: "NZL", flagEmoji: "🇳🇿", groupLetter: "G", flagUrl: "https://flagcdn.com/nz.svg" },
  // Grupo H
  { code: "ES",     name: "España",               short: "ESP", flagEmoji: "🇪🇸", groupLetter: "H", flagUrl: "https://flagcdn.com/es.svg" },
  { code: "CV",     name: "Cabo Verde",           short: "CPV", flagEmoji: "🇨🇻", groupLetter: "H", flagUrl: "https://flagcdn.com/cv.svg" },
  { code: "SA",     name: "Arabia Saudita",       short: "KSA", flagEmoji: "🇸🇦", groupLetter: "H", flagUrl: "https://flagcdn.com/sa.svg" },
  { code: "UY",     name: "Uruguay",              short: "URU", flagEmoji: "🇺🇾", groupLetter: "H", flagUrl: "https://flagcdn.com/uy.svg" },
  // Grupo I
  { code: "FR",     name: "Francia",              short: "FRA", flagEmoji: "🇫🇷", groupLetter: "I", flagUrl: "https://flagcdn.com/fr.svg" },
  { code: "SN",     name: "Senegal",              short: "SEN", flagEmoji: "🇸🇳", groupLetter: "I", flagUrl: "https://flagcdn.com/sn.svg" },
  { code: "IQ",     name: "Irak",                 short: "IRQ", flagEmoji: "🇮🇶", groupLetter: "I", flagUrl: "https://flagcdn.com/iq.svg" },
  { code: "NO",     name: "Noruega",              short: "NOR", flagEmoji: "🇳🇴", groupLetter: "I", flagUrl: "https://flagcdn.com/no.svg" },
  // Grupo J
  { code: "AR",     name: "Argentina",            short: "ARG", flagEmoji: "🇦🇷", groupLetter: "J", flagUrl: "https://flagcdn.com/ar.svg" },
  { code: "DZ",     name: "Argelia",              short: "ALG", flagEmoji: "🇩🇿", groupLetter: "J", flagUrl: "https://flagcdn.com/dz.svg" },
  { code: "AT",     name: "Austria",              short: "AUT", flagEmoji: "🇦🇹", groupLetter: "J", flagUrl: "https://flagcdn.com/at.svg" },
  { code: "JO",     name: "Jordania",             short: "JOR", flagEmoji: "🇯🇴", groupLetter: "J", flagUrl: "https://flagcdn.com/jo.svg" },
  // Grupo K
  { code: "PT",     name: "Portugal",             short: "POR", flagEmoji: "🇵🇹", groupLetter: "K", flagUrl: "https://flagcdn.com/pt.svg" },
  { code: "CD",     name: "RD Congo",             short: "COD", flagEmoji: "🇨🇩", groupLetter: "K", flagUrl: "https://flagcdn.com/cd.svg" },
  { code: "UZ",     name: "Uzbekistán",           short: "UZB", flagEmoji: "🇺🇿", groupLetter: "K", flagUrl: "https://flagcdn.com/uz.svg" },
  { code: "CO",     name: "Colombia",             short: "COL", flagEmoji: "🇨🇴", groupLetter: "K", flagUrl: "https://flagcdn.com/co.svg" },
  // Grupo L
  { code: "GB-ENG", name: "Inglaterra",           short: "ENG", flagEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", groupLetter: "L", flagUrl: "https://flagcdn.com/gb-eng.svg" },
  { code: "HR",     name: "Croacia",              short: "CRO", flagEmoji: "🇭🇷", groupLetter: "L", flagUrl: "https://flagcdn.com/hr.svg" },
  { code: "GH",     name: "Ghana",                short: "GHA", flagEmoji: "🇬🇭", groupLetter: "L", flagUrl: "https://flagcdn.com/gh.svg" },
  { code: "PA",     name: "Panamá",               short: "PAN", flagEmoji: "🇵🇦", groupLetter: "L", flagUrl: "https://flagcdn.com/pa.svg" },
];

// ── Venues ─────────────────────────────────────────────────────────────────
export const venues: VenueData[] = [
  { name: "Mexico City Stadium",         city: "Ciudad de México",    country: "México" },
  { name: "Estadio Guadalajara",         city: "Zapopan",             country: "México" },
  { name: "Estadio Monterrey",           city: "Guadalupe",           country: "México" },
  { name: "Toronto Stadium",             city: "Toronto",             country: "Canadá" },
  { name: "BC Place",                    city: "Vancouver",           country: "Canadá" },
  { name: "Atlanta Stadium",            city: "Atlanta",             country: "EE.UU." },
  { name: "Boston Stadium",             city: "Foxborough",          country: "EE.UU." },
  { name: "Dallas Stadium",             city: "Arlington",           country: "EE.UU." },
  { name: "Houston Stadium",            city: "Houston",             country: "EE.UU." },
  { name: "Kansas City Stadium",        city: "Kansas City",         country: "EE.UU." },
  { name: "Los Angeles Stadium",        city: "Inglewood",           country: "EE.UU." },
  { name: "Miami Stadium",              city: "Miami Gardens",       country: "EE.UU." },
  { name: "New York New Jersey Stadium",city: "East Rutherford",     country: "EE.UU." },
  { name: "Philadelphia Stadium",       city: "Filadelfia",          country: "EE.UU." },
  { name: "San Francisco Bay Area Stadium", city: "Santa Clara",     country: "EE.UU." },
  { name: "Seattle Stadium",            city: "Seattle",             country: "EE.UU." },
];

// ── Matches ────────────────────────────────────────────────────────────────
// Kickoff times in UTC (converted from GMT column in fixture.md).
// All times are the authoritative GMT values explicitly stated in the fixture.

const TBD = "Por definir";

export const matches: MatchData[] = [
  // ── GRUPO A ──────────────────────────────────────────────────────────────
  { id: "m001", matchNumber:  1, stage: "group", groupLetter: "A", homeTeamCode: "MX",  awayTeamCode: "ZA",  homeTeamLabel: "México",        awayTeamLabel: "Sudáfrica",   kickoffAt: "2026-06-11T21:00:00Z", venueName: "Mexico City Stadium" },
  { id: "m002", matchNumber:  2, stage: "group", groupLetter: "A", homeTeamCode: "KR",  awayTeamCode: "CZ",  homeTeamLabel: "Corea del Sur", awayTeamLabel: "Chequia",      kickoffAt: "2026-06-12T04:00:00Z", venueName: "Estadio Guadalajara" },
  { id: "m003", matchNumber:  3, stage: "group", groupLetter: "A", homeTeamCode: "CZ",  awayTeamCode: "ZA",  homeTeamLabel: "Chequia",       awayTeamLabel: "Sudáfrica",   kickoffAt: "2026-06-18T17:00:00Z", venueName: "Atlanta Stadium" },
  { id: "m004", matchNumber:  4, stage: "group", groupLetter: "A", homeTeamCode: "MX",  awayTeamCode: "KR",  homeTeamLabel: "México",        awayTeamLabel: "Corea del Sur", kickoffAt: "2026-06-19T03:00:00Z", venueName: "Estadio Guadalajara" },
  { id: "m005", matchNumber:  5, stage: "group", groupLetter: "A", homeTeamCode: "CZ",  awayTeamCode: "MX",  homeTeamLabel: "Chequia",       awayTeamLabel: "México",        kickoffAt: "2026-06-25T03:00:00Z", venueName: "Mexico City Stadium" },
  { id: "m006", matchNumber:  6, stage: "group", groupLetter: "A", homeTeamCode: "ZA",  awayTeamCode: "KR",  homeTeamLabel: "Sudáfrica",     awayTeamLabel: "Corea del Sur", kickoffAt: "2026-06-25T03:00:00Z", venueName: "Estadio Monterrey" },
  // ── GRUPO B ──────────────────────────────────────────────────────────────
  { id: "m007", matchNumber:  7, stage: "group", groupLetter: "B", homeTeamCode: "CA",  awayTeamCode: "BA",  homeTeamLabel: "Canadá",        awayTeamLabel: "Bosnia y Herzegovina", kickoffAt: "2026-06-12T20:00:00Z", venueName: "Toronto Stadium" },
  { id: "m008", matchNumber:  8, stage: "group", groupLetter: "B", homeTeamCode: "QA",  awayTeamCode: "CH",  homeTeamLabel: "Qatar",         awayTeamLabel: "Suiza",         kickoffAt: "2026-06-13T23:00:00Z", venueName: "San Francisco Bay Area Stadium" },
  { id: "m009", matchNumber:  9, stage: "group", groupLetter: "B", homeTeamCode: "CH",  awayTeamCode: "BA",  homeTeamLabel: "Suiza",         awayTeamLabel: "Bosnia y Herzegovina", kickoffAt: "2026-06-18T23:00:00Z", venueName: "Los Angeles Stadium" },
  { id: "m010", matchNumber: 10, stage: "group", groupLetter: "B", homeTeamCode: "CA",  awayTeamCode: "QA",  homeTeamLabel: "Canadá",        awayTeamLabel: "Qatar",         kickoffAt: "2026-06-19T02:00:00Z", venueName: "BC Place" },
  { id: "m011", matchNumber: 11, stage: "group", groupLetter: "B", homeTeamCode: "CH",  awayTeamCode: "CA",  homeTeamLabel: "Suiza",         awayTeamLabel: "Canadá",        kickoffAt: "2026-06-24T23:00:00Z", venueName: "BC Place" },
  { id: "m012", matchNumber: 12, stage: "group", groupLetter: "B", homeTeamCode: "BA",  awayTeamCode: "QA",  homeTeamLabel: "Bosnia y Herzegovina", awayTeamLabel: "Qatar",  kickoffAt: "2026-06-24T23:00:00Z", venueName: "Seattle Stadium" },
  // ── GRUPO C ──────────────────────────────────────────────────────────────
  { id: "m013", matchNumber: 13, stage: "group", groupLetter: "C", homeTeamCode: "BR",     awayTeamCode: "MA",     homeTeamLabel: "Brasil",    awayTeamLabel: "Marruecos",  kickoffAt: "2026-06-13T23:00:00Z", venueName: "New York New Jersey Stadium" },
  { id: "m014", matchNumber: 14, stage: "group", groupLetter: "C", homeTeamCode: "HT",     awayTeamCode: "GB-SCT", homeTeamLabel: "Haití",     awayTeamLabel: "Escocia",    kickoffAt: "2026-06-14T02:00:00Z", venueName: "Boston Stadium" },
  { id: "m015", matchNumber: 15, stage: "group", groupLetter: "C", homeTeamCode: "GB-SCT", awayTeamCode: "MA",     homeTeamLabel: "Escocia",   awayTeamLabel: "Marruecos",  kickoffAt: "2026-06-19T23:00:00Z", venueName: "Boston Stadium" },
  { id: "m016", matchNumber: 16, stage: "group", groupLetter: "C", homeTeamCode: "BR",     awayTeamCode: "HT",     homeTeamLabel: "Brasil",    awayTeamLabel: "Haití",      kickoffAt: "2026-06-20T02:00:00Z", venueName: "Philadelphia Stadium" },
  { id: "m017", matchNumber: 17, stage: "group", groupLetter: "C", homeTeamCode: "GB-SCT", awayTeamCode: "BR",     homeTeamLabel: "Escocia",   awayTeamLabel: "Brasil",     kickoffAt: "2026-06-24T23:00:00Z", venueName: "Miami Stadium" },
  { id: "m018", matchNumber: 18, stage: "group", groupLetter: "C", homeTeamCode: "MA",     awayTeamCode: "HT",     homeTeamLabel: "Marruecos", awayTeamLabel: "Haití",      kickoffAt: "2026-06-24T23:00:00Z", venueName: "Atlanta Stadium" },
  // ── GRUPO D ──────────────────────────────────────────────────────────────
  { id: "m019", matchNumber: 19, stage: "group", groupLetter: "D", homeTeamCode: "US", awayTeamCode: "PY", homeTeamLabel: "Estados Unidos", awayTeamLabel: "Paraguay",   kickoffAt: "2026-06-13T05:00:00Z", venueName: "Los Angeles Stadium" },
  { id: "m020", matchNumber: 20, stage: "group", groupLetter: "D", homeTeamCode: "AU", awayTeamCode: "TR", homeTeamLabel: "Australia",      awayTeamLabel: "Türkiye",    kickoffAt: "2026-06-14T08:00:00Z", venueName: "BC Place" },
  { id: "m021", matchNumber: 21, stage: "group", groupLetter: "D", homeTeamCode: "US", awayTeamCode: "AU", homeTeamLabel: "Estados Unidos", awayTeamLabel: "Australia",  kickoffAt: "2026-06-19T23:00:00Z", venueName: "Seattle Stadium" },
  { id: "m022", matchNumber: 22, stage: "group", groupLetter: "D", homeTeamCode: "TR", awayTeamCode: "PY", homeTeamLabel: "Türkiye",        awayTeamLabel: "Paraguay",   kickoffAt: "2026-06-20T08:00:00Z", venueName: "San Francisco Bay Area Stadium" },
  { id: "m023", matchNumber: 23, stage: "group", groupLetter: "D", homeTeamCode: "TR", awayTeamCode: "US", homeTeamLabel: "Türkiye",        awayTeamLabel: "Estados Unidos", kickoffAt: "2026-06-26T06:00:00Z", venueName: "Los Angeles Stadium" },
  { id: "m024", matchNumber: 24, stage: "group", groupLetter: "D", homeTeamCode: "PY", awayTeamCode: "AU", homeTeamLabel: "Paraguay",       awayTeamLabel: "Australia",  kickoffAt: "2026-06-26T06:00:00Z", venueName: "San Francisco Bay Area Stadium" },
  // ── GRUPO E ──────────────────────────────────────────────────────────────
  { id: "m025", matchNumber: 25, stage: "group", groupLetter: "E", homeTeamCode: "DE", awayTeamCode: "CW", homeTeamLabel: "Alemania",       awayTeamLabel: "Curazao",       kickoffAt: "2026-06-14T19:00:00Z", venueName: "Houston Stadium" },
  { id: "m026", matchNumber: 26, stage: "group", groupLetter: "E", homeTeamCode: "CI", awayTeamCode: "EC", homeTeamLabel: "Costa de Marfil", awayTeamLabel: "Ecuador",      kickoffAt: "2026-06-15T00:00:00Z", venueName: "Philadelphia Stadium" },
  { id: "m027", matchNumber: 27, stage: "group", groupLetter: "E", homeTeamCode: "DE", awayTeamCode: "CI", homeTeamLabel: "Alemania",       awayTeamLabel: "Costa de Marfil", kickoffAt: "2026-06-20T21:00:00Z", venueName: "Toronto Stadium" },
  { id: "m028", matchNumber: 28, stage: "group", groupLetter: "E", homeTeamCode: "EC", awayTeamCode: "CW", homeTeamLabel: "Ecuador",        awayTeamLabel: "Curazao",       kickoffAt: "2026-06-21T04:00:00Z", venueName: "Kansas City Stadium" },
  { id: "m029", matchNumber: 29, stage: "group", groupLetter: "E", homeTeamCode: "EC", awayTeamCode: "DE", homeTeamLabel: "Ecuador",        awayTeamLabel: "Alemania",      kickoffAt: "2026-06-25T21:00:00Z", venueName: "New York New Jersey Stadium" },
  { id: "m030", matchNumber: 30, stage: "group", groupLetter: "E", homeTeamCode: "CW", awayTeamCode: "CI", homeTeamLabel: "Curazao",        awayTeamLabel: "Costa de Marfil", kickoffAt: "2026-06-25T21:00:00Z", venueName: "Philadelphia Stadium" },
  // ── GRUPO F ──────────────────────────────────────────────────────────────
  { id: "m031", matchNumber: 31, stage: "group", groupLetter: "F", homeTeamCode: "NL", awayTeamCode: "JP", homeTeamLabel: "Países Bajos",  awayTeamLabel: "Japón",         kickoffAt: "2026-06-14T22:00:00Z", venueName: "Dallas Stadium" },
  { id: "m032", matchNumber: 32, stage: "group", groupLetter: "F", homeTeamCode: "SE", awayTeamCode: "TN", homeTeamLabel: "Suecia",         awayTeamLabel: "Túnez",         kickoffAt: "2026-06-15T04:00:00Z", venueName: "Estadio Monterrey" },
  { id: "m033", matchNumber: 33, stage: "group", groupLetter: "F", homeTeamCode: "NL", awayTeamCode: "SE", homeTeamLabel: "Países Bajos",  awayTeamLabel: "Suecia",        kickoffAt: "2026-06-20T19:00:00Z", venueName: "Houston Stadium" },
  { id: "m034", matchNumber: 34, stage: "group", groupLetter: "F", homeTeamCode: "TN", awayTeamCode: "JP", homeTeamLabel: "Túnez",          awayTeamLabel: "Japón",         kickoffAt: "2026-06-21T06:00:00Z", venueName: "Estadio Monterrey" },
  { id: "m035", matchNumber: 35, stage: "group", groupLetter: "F", homeTeamCode: "JP", awayTeamCode: "SE", homeTeamLabel: "Japón",          awayTeamLabel: "Suecia",        kickoffAt: "2026-06-26T01:00:00Z", venueName: "Dallas Stadium" },
  { id: "m036", matchNumber: 36, stage: "group", groupLetter: "F", homeTeamCode: "TN", awayTeamCode: "NL", homeTeamLabel: "Túnez",          awayTeamLabel: "Países Bajos",  kickoffAt: "2026-06-26T01:00:00Z", venueName: "Kansas City Stadium" },
  // ── GRUPO G ──────────────────────────────────────────────────────────────
  { id: "m037", matchNumber: 37, stage: "group", groupLetter: "G", homeTeamCode: "BE", awayTeamCode: "EG", homeTeamLabel: "Bélgica",        awayTeamLabel: "Egipto",        kickoffAt: "2026-06-15T23:00:00Z", venueName: "BC Place" },
  { id: "m038", matchNumber: 38, stage: "group", groupLetter: "G", homeTeamCode: "IR", awayTeamCode: "NZ", homeTeamLabel: "Irán",           awayTeamLabel: "Nueva Zelanda", kickoffAt: "2026-06-16T05:00:00Z", venueName: "Los Angeles Stadium" },
  { id: "m039", matchNumber: 39, stage: "group", groupLetter: "G", homeTeamCode: "BE", awayTeamCode: "IR", homeTeamLabel: "Bélgica",        awayTeamLabel: "Irán",          kickoffAt: "2026-06-21T23:00:00Z", venueName: "Los Angeles Stadium" },
  { id: "m040", matchNumber: 40, stage: "group", groupLetter: "G", homeTeamCode: "NZ", awayTeamCode: "EG", homeTeamLabel: "Nueva Zelanda",  awayTeamLabel: "Egipto",        kickoffAt: "2026-06-22T05:00:00Z", venueName: "BC Place" },
  { id: "m041", matchNumber: 41, stage: "group", groupLetter: "G", homeTeamCode: "EG", awayTeamCode: "IR", homeTeamLabel: "Egipto",         awayTeamLabel: "Irán",          kickoffAt: "2026-06-27T07:00:00Z", venueName: "Seattle Stadium" },
  { id: "m042", matchNumber: 42, stage: "group", groupLetter: "G", homeTeamCode: "NZ", awayTeamCode: "BE", homeTeamLabel: "Nueva Zelanda",  awayTeamLabel: "Bélgica",       kickoffAt: "2026-06-27T07:00:00Z", venueName: "BC Place" },
  // ── GRUPO H ──────────────────────────────────────────────────────────────
  { id: "m043", matchNumber: 43, stage: "group", groupLetter: "H", homeTeamCode: "ES", awayTeamCode: "CV", homeTeamLabel: "España",         awayTeamLabel: "Cabo Verde",    kickoffAt: "2026-06-15T17:00:00Z", venueName: "Atlanta Stadium" },
  { id: "m044", matchNumber: 44, stage: "group", groupLetter: "H", homeTeamCode: "SA", awayTeamCode: "UY", homeTeamLabel: "Arabia Saudita", awayTeamLabel: "Uruguay",       kickoffAt: "2026-06-15T23:00:00Z", venueName: "Miami Stadium" },
  { id: "m045", matchNumber: 45, stage: "group", groupLetter: "H", homeTeamCode: "ES", awayTeamCode: "SA", homeTeamLabel: "España",         awayTeamLabel: "Arabia Saudita", kickoffAt: "2026-06-21T17:00:00Z", venueName: "Atlanta Stadium" },
  { id: "m046", matchNumber: 46, stage: "group", groupLetter: "H", homeTeamCode: "UY", awayTeamCode: "CV", homeTeamLabel: "Uruguay",        awayTeamLabel: "Cabo Verde",    kickoffAt: "2026-06-21T23:00:00Z", venueName: "Miami Stadium" },
  { id: "m047", matchNumber: 47, stage: "group", groupLetter: "H", homeTeamCode: "CV", awayTeamCode: "SA", homeTeamLabel: "Cabo Verde",     awayTeamLabel: "Arabia Saudita", kickoffAt: "2026-06-27T02:00:00Z", venueName: "Houston Stadium" },
  { id: "m048", matchNumber: 48, stage: "group", groupLetter: "H", homeTeamCode: "UY", awayTeamCode: "ES", homeTeamLabel: "Uruguay",        awayTeamLabel: "España",        kickoffAt: "2026-06-27T02:00:00Z", venueName: "Estadio Guadalajara" },
  // ── GRUPO I ──────────────────────────────────────────────────────────────
  { id: "m049", matchNumber: 49, stage: "group", groupLetter: "I", homeTeamCode: "FR", awayTeamCode: "SN", homeTeamLabel: "Francia",        awayTeamLabel: "Senegal",       kickoffAt: "2026-06-16T20:00:00Z", venueName: "New York New Jersey Stadium" },
  { id: "m050", matchNumber: 50, stage: "group", groupLetter: "I", homeTeamCode: "IQ", awayTeamCode: "NO", homeTeamLabel: "Irak",           awayTeamLabel: "Noruega",       kickoffAt: "2026-06-16T23:00:00Z", venueName: "Boston Stadium" },
  { id: "m051", matchNumber: 51, stage: "group", groupLetter: "I", homeTeamCode: "FR", awayTeamCode: "IQ", homeTeamLabel: "Francia",        awayTeamLabel: "Irak",          kickoffAt: "2026-06-22T22:00:00Z", venueName: "Philadelphia Stadium" },
  { id: "m052", matchNumber: 52, stage: "group", groupLetter: "I", homeTeamCode: "NO", awayTeamCode: "SN", homeTeamLabel: "Noruega",        awayTeamLabel: "Senegal",       kickoffAt: "2026-06-23T01:00:00Z", venueName: "New York New Jersey Stadium" },
  { id: "m053", matchNumber: 53, stage: "group", groupLetter: "I", homeTeamCode: "NO", awayTeamCode: "FR", homeTeamLabel: "Noruega",        awayTeamLabel: "Francia",       kickoffAt: "2026-06-26T20:00:00Z", venueName: "Boston Stadium" },
  { id: "m054", matchNumber: 54, stage: "group", groupLetter: "I", homeTeamCode: "SN", awayTeamCode: "IQ", homeTeamLabel: "Senegal",        awayTeamLabel: "Irak",          kickoffAt: "2026-06-26T20:00:00Z", venueName: "Toronto Stadium" },
  // ── GRUPO J ──────────────────────────────────────────────────────────────
  { id: "m055", matchNumber: 55, stage: "group", groupLetter: "J", homeTeamCode: "AR", awayTeamCode: "DZ", homeTeamLabel: "Argentina",      awayTeamLabel: "Argelia",       kickoffAt: "2026-06-17T03:00:00Z", venueName: "Kansas City Stadium" },
  { id: "m056", matchNumber: 56, stage: "group", groupLetter: "J", homeTeamCode: "AT", awayTeamCode: "JO", homeTeamLabel: "Austria",        awayTeamLabel: "Jordania",      kickoffAt: "2026-06-17T08:00:00Z", venueName: "San Francisco Bay Area Stadium" },
  { id: "m057", matchNumber: 57, stage: "group", groupLetter: "J", homeTeamCode: "AR", awayTeamCode: "AT", homeTeamLabel: "Argentina",      awayTeamLabel: "Austria",       kickoffAt: "2026-06-22T19:00:00Z", venueName: "Dallas Stadium" },
  { id: "m058", matchNumber: 58, stage: "group", groupLetter: "J", homeTeamCode: "JO", awayTeamCode: "DZ", homeTeamLabel: "Jordania",       awayTeamLabel: "Argelia",       kickoffAt: "2026-06-23T07:00:00Z", venueName: "San Francisco Bay Area Stadium" },
  { id: "m059", matchNumber: 59, stage: "group", groupLetter: "J", homeTeamCode: "DZ", awayTeamCode: "AT", homeTeamLabel: "Argelia",        awayTeamLabel: "Austria",       kickoffAt: "2026-06-28T04:00:00Z", venueName: "Kansas City Stadium" },
  { id: "m060", matchNumber: 60, stage: "group", groupLetter: "J", homeTeamCode: "JO", awayTeamCode: "AR", homeTeamLabel: "Jordania",       awayTeamLabel: "Argentina",     kickoffAt: "2026-06-28T04:00:00Z", venueName: "Dallas Stadium" },
  // ── GRUPO K ──────────────────────────────────────────────────────────────
  { id: "m061", matchNumber: 61, stage: "group", groupLetter: "K", homeTeamCode: "PT", awayTeamCode: "CD", homeTeamLabel: "Portugal",       awayTeamLabel: "RD Congo",      kickoffAt: "2026-06-17T19:00:00Z", venueName: "Houston Stadium" },
  { id: "m062", matchNumber: 62, stage: "group", groupLetter: "K", homeTeamCode: "UZ", awayTeamCode: "CO", homeTeamLabel: "Uzbekistán",     awayTeamLabel: "Colombia",      kickoffAt: "2026-06-18T04:00:00Z", venueName: "Mexico City Stadium" },
  { id: "m063", matchNumber: 63, stage: "group", groupLetter: "K", homeTeamCode: "PT", awayTeamCode: "UZ", homeTeamLabel: "Portugal",       awayTeamLabel: "Uzbekistán",    kickoffAt: "2026-06-23T19:00:00Z", venueName: "Houston Stadium" },
  { id: "m064", matchNumber: 64, stage: "group", groupLetter: "K", homeTeamCode: "CO", awayTeamCode: "CD", homeTeamLabel: "Colombia",       awayTeamLabel: "RD Congo",      kickoffAt: "2026-06-24T04:00:00Z", venueName: "Estadio Guadalajara" },
  { id: "m065", matchNumber: 65, stage: "group", groupLetter: "K", homeTeamCode: "CO", awayTeamCode: "PT", homeTeamLabel: "Colombia",       awayTeamLabel: "Portugal",      kickoffAt: "2026-06-28T02:30:00Z", venueName: "Miami Stadium" },
  { id: "m066", matchNumber: 66, stage: "group", groupLetter: "K", homeTeamCode: "CD", awayTeamCode: "UZ", homeTeamLabel: "RD Congo",       awayTeamLabel: "Uzbekistán",    kickoffAt: "2026-06-28T02:30:00Z", venueName: "Atlanta Stadium" },
  // ── GRUPO L ──────────────────────────────────────────────────────────────
  { id: "m067", matchNumber: 67, stage: "group", groupLetter: "L", homeTeamCode: "GB-ENG", awayTeamCode: "HR", homeTeamLabel: "Inglaterra",  awayTeamLabel: "Croacia",       kickoffAt: "2026-06-17T22:00:00Z", venueName: "Dallas Stadium" },
  { id: "m068", matchNumber: 68, stage: "group", groupLetter: "L", homeTeamCode: "GH",     awayTeamCode: "PA", homeTeamLabel: "Ghana",       awayTeamLabel: "Panamá",        kickoffAt: "2026-06-18T00:00:00Z", venueName: "Toronto Stadium" },
  { id: "m069", matchNumber: 69, stage: "group", groupLetter: "L", homeTeamCode: "GB-ENG", awayTeamCode: "GH", homeTeamLabel: "Inglaterra",  awayTeamLabel: "Ghana",         kickoffAt: "2026-06-23T21:00:00Z", venueName: "Boston Stadium" },
  { id: "m070", matchNumber: 70, stage: "group", groupLetter: "L", homeTeamCode: "PA",     awayTeamCode: "HR", homeTeamLabel: "Panamá",      awayTeamLabel: "Croacia",       kickoffAt: "2026-06-24T00:00:00Z", venueName: "Toronto Stadium" },
  { id: "m071", matchNumber: 71, stage: "group", groupLetter: "L", homeTeamCode: "PA",     awayTeamCode: "GB-ENG", homeTeamLabel: "Panamá", awayTeamLabel: "Inglaterra",    kickoffAt: "2026-06-27T22:00:00Z", venueName: "New York New Jersey Stadium" },
  { id: "m072", matchNumber: 72, stage: "group", groupLetter: "L", homeTeamCode: "HR",     awayTeamCode: "GH", homeTeamLabel: "Croacia",     awayTeamLabel: "Ghana",         kickoffAt: "2026-06-27T22:00:00Z", venueName: "Philadelphia Stadium" },

  // ── RONDA DE 32 ──────────────────────────────────────────────────────────
  { id: "m073", matchNumber:  73, stage: "round_of_32", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-06-28T23:00:00Z", venueName: "Los Angeles Stadium" },
  { id: "m074", matchNumber:  74, stage: "round_of_32", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-06-29T19:00:00Z", venueName: "Houston Stadium" },
  { id: "m075", matchNumber:  75, stage: "round_of_32", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-06-29T22:30:00Z", venueName: "Boston Stadium" },
  { id: "m076", matchNumber:  76, stage: "round_of_32", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-06-30T03:00:00Z", venueName: "Estadio Monterrey" },
  { id: "m077", matchNumber:  77, stage: "round_of_32", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-06-30T19:00:00Z", venueName: "Dallas Stadium" },
  { id: "m078", matchNumber:  78, stage: "round_of_32", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-06-30T22:00:00Z", venueName: "New York New Jersey Stadium" },
  { id: "m079", matchNumber:  79, stage: "round_of_32", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-01T03:00:00Z", venueName: "Mexico City Stadium" },
  { id: "m080", matchNumber:  80, stage: "round_of_32", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-01T17:00:00Z", venueName: "Atlanta Stadium" },
  { id: "m081", matchNumber:  81, stage: "round_of_32", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-02T00:00:00Z", venueName: "Seattle Stadium" },
  { id: "m082", matchNumber:  82, stage: "round_of_32", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-02T04:00:00Z", venueName: "San Francisco Bay Area Stadium" },
  { id: "m083", matchNumber:  83, stage: "round_of_32", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-02T23:00:00Z", venueName: "Los Angeles Stadium" },
  { id: "m084", matchNumber:  84, stage: "round_of_32", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-03T00:00:00Z", venueName: "Toronto Stadium" },
  { id: "m085", matchNumber:  85, stage: "round_of_32", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-03T07:00:00Z", venueName: "BC Place" },
  { id: "m086", matchNumber:  86, stage: "round_of_32", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-03T21:00:00Z", venueName: "Dallas Stadium" },
  { id: "m087", matchNumber:  87, stage: "round_of_32", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-03T23:00:00Z", venueName: "Miami Stadium" },
  { id: "m088", matchNumber:  88, stage: "round_of_32", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-04T03:30:00Z", venueName: "Kansas City Stadium" },

  // ── OCTAVOS DE FINAL / RONDA DE 16 ───────────────────────────────────────
  { id: "m089", matchNumber:  89, stage: "round_of_16", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-04T19:00:00Z", venueName: "Houston Stadium" },
  { id: "m090", matchNumber:  90, stage: "round_of_16", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-04T22:00:00Z", venueName: "Philadelphia Stadium" },
  { id: "m091", matchNumber:  91, stage: "round_of_16", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-05T21:00:00Z", venueName: "New York New Jersey Stadium" },
  { id: "m092", matchNumber:  92, stage: "round_of_16", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-06T02:00:00Z", venueName: "Mexico City Stadium" },
  { id: "m093", matchNumber:  93, stage: "round_of_16", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-06T21:00:00Z", venueName: "Dallas Stadium" },
  { id: "m094", matchNumber:  94, stage: "round_of_16", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-07T04:00:00Z", venueName: "Seattle Stadium" },
  { id: "m095", matchNumber:  95, stage: "round_of_16", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-07T17:00:00Z", venueName: "Atlanta Stadium" },
  { id: "m096", matchNumber:  96, stage: "round_of_16", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-08T00:00:00Z", venueName: "BC Place" },

  // ── CUARTOS DE FINAL ─────────────────────────────────────────────────────
  { id: "m097", matchNumber:  97, stage: "quarterfinal", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-09T21:00:00Z", venueName: "Boston Stadium" },
  { id: "m098", matchNumber:  98, stage: "quarterfinal", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-10T23:00:00Z", venueName: "Los Angeles Stadium" },
  { id: "m099", matchNumber:  99, stage: "quarterfinal", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-11T22:00:00Z", venueName: "Miami Stadium" },
  { id: "m100", matchNumber: 100, stage: "quarterfinal", groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-12T03:00:00Z", venueName: "Kansas City Stadium" },

  // ── SEMIFINALES ──────────────────────────────────────────────────────────
  { id: "m101", matchNumber: 101, stage: "semifinal",    groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-14T21:00:00Z", venueName: "Dallas Stadium" },
  { id: "m102", matchNumber: 102, stage: "semifinal",    groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-15T20:00:00Z", venueName: "Atlanta Stadium" },

  // ── TERCER LUGAR ─────────────────────────────────────────────────────────
  { id: "m103", matchNumber: 103, stage: "third_place",  groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-18T22:00:00Z", venueName: "Miami Stadium" },

  // ── FINAL ────────────────────────────────────────────────────────────────
  { id: "m104", matchNumber: 104, stage: "final",        groupLetter: null, homeTeamCode: null, awayTeamCode: null, homeTeamLabel: TBD, awayTeamLabel: TBD, kickoffAt: "2026-07-19T20:00:00Z", venueName: "New York New Jersey Stadium" },
];
