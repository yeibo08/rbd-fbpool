# 🏆 FIFA World Cup 2026 — Calendario Completo de Partidos

> **Sede:** Canadá, México y Estados Unidos | **Fechas:** 11 de junio – 19 de julio de 2026
> Todos los horarios en **ET (Eastern Time)** / GMT indicado entre paréntesis.

---

## 🗺️ Mapa de Países — Especificación JavaScript

```js
/**
 * PAÍSES PARTICIPANTES — COPA DEL MUNDO FIFA 2026
 * Estructura: Map de JS con clave = código ISO 3166-1 alpha-2
 * Propiedades:
 *   name      — Nombre completo oficial
 *   short     — Nombre corto / abreviatura usada en marcadores
 *   flag      — Emoji de bandera (unicode)
 *   group     — Grupo en la fase de grupos ("A"–"L")
 *   flagUrl   — URL base para banderas SVG (puedes reemplazar por tu CDN)
 */

const countries = new Map([
  // ── GRUPO A ────────────────────────────────────────
  ["MX", { name: "México",              short: "MEX", flag: "🇲🇽", group: "A", flagUrl: "https://flagcdn.com/mx.svg" }],
  ["ZA", { name: "Sudáfrica",           short: "RSA", flag: "🇿🇦", group: "A", flagUrl: "https://flagcdn.com/za.svg" }],
  ["KR", { name: "Corea del Sur",       short: "KOR", flag: "🇰🇷", group: "A", flagUrl: "https://flagcdn.com/kr.svg" }],
  ["CZ", { name: "Chequia",             short: "CZE", flag: "🇨🇿", group: "A", flagUrl: "https://flagcdn.com/cz.svg" }],

  // ── GRUPO B ────────────────────────────────────────
  ["CA", { name: "Canadá",              short: "CAN", flag: "🇨🇦", group: "B", flagUrl: "https://flagcdn.com/ca.svg" }],
  ["BA", { name: "Bosnia y Herzegovina",short: "BIH", flag: "🇧🇦", group: "B", flagUrl: "https://flagcdn.com/ba.svg" }],
  ["QA", { name: "Qatar",               short: "QAT", flag: "🇶🇦", group: "B", flagUrl: "https://flagcdn.com/qa.svg" }],
  ["CH", { name: "Suiza",               short: "SUI", flag: "🇨🇭", group: "B", flagUrl: "https://flagcdn.com/ch.svg" }],

  // ── GRUPO C ────────────────────────────────────────
  ["BR", { name: "Brasil",              short: "BRA", flag: "🇧🇷", group: "C", flagUrl: "https://flagcdn.com/br.svg" }],
  ["MA", { name: "Marruecos",           short: "MAR", flag: "🇲🇦", group: "C", flagUrl: "https://flagcdn.com/ma.svg" }],
  ["HT", { name: "Haití",               short: "HAI", flag: "🇭🇹", group: "C", flagUrl: "https://flagcdn.com/ht.svg" }],
  ["GB-SCT", { name: "Escocia",         short: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", flagUrl: "https://flagcdn.com/gb-sct.svg" }],

  // ── GRUPO D ────────────────────────────────────────
  ["US", { name: "Estados Unidos",      short: "USA", flag: "🇺🇸", group: "D", flagUrl: "https://flagcdn.com/us.svg" }],
  ["PY", { name: "Paraguay",            short: "PAR", flag: "🇵🇾", group: "D", flagUrl: "https://flagcdn.com/py.svg" }],
  ["AU", { name: "Australia",           short: "AUS", flag: "🇦🇺", group: "D", flagUrl: "https://flagcdn.com/au.svg" }],
  ["TR", { name: "Türkiye",             short: "TUR", flag: "🇹🇷", group: "D", flagUrl: "https://flagcdn.com/tr.svg" }],

  // ── GRUPO E ────────────────────────────────────────
  ["DE", { name: "Alemania",            short: "GER", flag: "🇩🇪", group: "E", flagUrl: "https://flagcdn.com/de.svg" }],
  ["CW", { name: "Curazao",             short: "CUW", flag: "🇨🇼", group: "E", flagUrl: "https://flagcdn.com/cw.svg" }],
  ["CI", { name: "Costa de Marfil",     short: "CIV", flag: "🇨🇮", group: "E", flagUrl: "https://flagcdn.com/ci.svg" }],
  ["EC", { name: "Ecuador",             short: "ECU", flag: "🇪🇨", group: "E", flagUrl: "https://flagcdn.com/ec.svg" }],

  // ── GRUPO F ────────────────────────────────────────
  ["NL", { name: "Países Bajos",        short: "NED", flag: "🇳🇱", group: "F", flagUrl: "https://flagcdn.com/nl.svg" }],
  ["JP", { name: "Japón",               short: "JPN", flag: "🇯🇵", group: "F", flagUrl: "https://flagcdn.com/jp.svg" }],
  ["SE", { name: "Suecia",              short: "SWE", flag: "🇸🇪", group: "F", flagUrl: "https://flagcdn.com/se.svg" }],
  ["TN", { name: "Túnez",               short: "TUN", flag: "🇹🇳", group: "F", flagUrl: "https://flagcdn.com/tn.svg" }],

  // ── GRUPO G ────────────────────────────────────────
  ["BE", { name: "Bélgica",             short: "BEL", flag: "🇧🇪", group: "G", flagUrl: "https://flagcdn.com/be.svg" }],
  ["EG", { name: "Egipto",              short: "EGY", flag: "🇪🇬", group: "G", flagUrl: "https://flagcdn.com/eg.svg" }],
  ["IR", { name: "Irán",                short: "IRN", flag: "🇮🇷", group: "G", flagUrl: "https://flagcdn.com/ir.svg" }],
  ["NZ", { name: "Nueva Zelanda",       short: "NZL", flag: "🇳🇿", group: "G", flagUrl: "https://flagcdn.com/nz.svg" }],

  // ── GRUPO H ────────────────────────────────────────
  ["ES", { name: "España",              short: "ESP", flag: "🇪🇸", group: "H", flagUrl: "https://flagcdn.com/es.svg" }],
  ["CV", { name: "Cabo Verde",          short: "CPV", flag: "🇨🇻", group: "H", flagUrl: "https://flagcdn.com/cv.svg" }],
  ["SA", { name: "Arabia Saudita",      short: "KSA", flag: "🇸🇦", group: "H", flagUrl: "https://flagcdn.com/sa.svg" }],
  ["UY", { name: "Uruguay",             short: "URU", flag: "🇺🇾", group: "H", flagUrl: "https://flagcdn.com/uy.svg" }],

  // ── GRUPO I ────────────────────────────────────────
  ["FR", { name: "Francia",             short: "FRA", flag: "🇫🇷", group: "I", flagUrl: "https://flagcdn.com/fr.svg" }],
  ["SN", { name: "Senegal",             short: "SEN", flag: "🇸🇳", group: "I", flagUrl: "https://flagcdn.com/sn.svg" }],
  ["IQ", { name: "Irak",               short: "IRQ", flag: "🇮🇶", group: "I", flagUrl: "https://flagcdn.com/iq.svg" }],
  ["NO", { name: "Noruega",             short: "NOR", flag: "🇳🇴", group: "I", flagUrl: "https://flagcdn.com/no.svg" }],

  // ── GRUPO J ────────────────────────────────────────
  ["AR", { name: "Argentina",           short: "ARG", flag: "🇦🇷", group: "J", flagUrl: "https://flagcdn.com/ar.svg" }],
  ["DZ", { name: "Argelia",             short: "ALG", flag: "🇩🇿", group: "J", flagUrl: "https://flagcdn.com/dz.svg" }],
  ["AT", { name: "Austria",             short: "AUT", flag: "🇦🇹", group: "J", flagUrl: "https://flagcdn.com/at.svg" }],
  ["JO", { name: "Jordania",            short: "JOR", flag: "🇯🇴", group: "J", flagUrl: "https://flagcdn.com/jo.svg" }],

  // ── GRUPO K ────────────────────────────────────────
  ["PT", { name: "Portugal",            short: "POR", flag: "🇵🇹", group: "K", flagUrl: "https://flagcdn.com/pt.svg" }],
  ["CD", { name: "RD Congo",            short: "COD", flag: "🇨🇩", group: "K", flagUrl: "https://flagcdn.com/cd.svg" }],
  ["UZ", { name: "Uzbekistán",          short: "UZB", flag: "🇺🇿", group: "K", flagUrl: "https://flagcdn.com/uz.svg" }],
  ["CO", { name: "Colombia",            short: "COL", flag: "🇨🇴", group: "K", flagUrl: "https://flagcdn.com/co.svg" }],

  // ── GRUPO L ────────────────────────────────────────
  ["GB-ENG", { name: "Inglaterra",      short: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", flagUrl: "https://flagcdn.com/gb-eng.svg" }],
  ["HR", { name: "Croacia",             short: "CRO", flag: "🇭🇷", group: "L", flagUrl: "https://flagcdn.com/hr.svg" }],
  ["GH", { name: "Ghana",               short: "GHA", flag: "🇬🇭", group: "L", flagUrl: "https://flagcdn.com/gh.svg" }],
  ["PA", { name: "Panamá",              short: "PAN", flag: "🇵🇦", group: "L", flagUrl: "https://flagcdn.com/pa.svg" }],
]);

// Ejemplo de uso:
// const mexico = countries.get("MX");
// console.log(`${mexico.flag} ${mexico.name} (${mexico.short}) — Grupo ${mexico.group}`);
// → 🇲🇽 México (MEX) — Grupo A
```

---

## 🏟️ Sedes del Torneo

| Ciudad | País | Estadio (nombre durante el torneo) |
|--------|------|------------------------------------|
| Ciudad de México | México | Mexico City Stadium (Estadio Azteca) |
| Zapopan / Guadalajara | México | Estadio Guadalajara (Estadio Akron) |
| Guadalupe / Monterrey | México | Estadio Monterrey |
| Toronto | Canadá | Toronto Stadium (BMO Field) |
| Vancouver | Canadá | BC Place |
| Atlanta | EE.UU. | Atlanta Stadium (Mercedes-Benz Stadium) |
| Boston / Foxborough | EE.UU. | Boston Stadium (Gillette Stadium) |
| Dallas / Arlington | EE.UU. | Dallas Stadium (AT&T Stadium) |
| Houston | EE.UU. | Houston Stadium (NRG Stadium) |
| Kansas City | EE.UU. | Kansas City Stadium (Arrowhead Stadium) |
| Los Ángeles / Inglewood | EE.UU. | Los Angeles Stadium (SoFi Stadium) |
| Miami / Miami Gardens | EE.UU. | Miami Stadium (Hard Rock Stadium) |
| Nueva York / Nueva Jersey | EE.UU. | New York New Jersey Stadium (MetLife Stadium) |
| Filadelfia | EE.UU. | Philadelphia Stadium (Lincoln Financial Field) |
| San Francisco / Santa Clara | EE.UU. | San Francisco Bay Area Stadium (Levi's Stadium) |
| Seattle | EE.UU. | Seattle Stadium (Lumen Field) |

---

## 📅 Fase de Grupos

### 🔵 Grupo A — México · Sudáfrica · Corea del Sur · Chequia

| Fecha | Partido | Hora ET (GMT) | Sede |
|-------|---------|--------------|------|
| Jue 11 Jun | 🇲🇽 México vs. Sudáfrica 🇿🇦 | 3:00 PM (21:00) | Mexico City Stadium, Ciudad de México 🇲🇽 |
| Jue 11 Jun | 🇰🇷 Corea del Sur vs. Chequia 🇨🇿 | 10:00 PM (04:00 Vie) | Estadio Guadalajara, Zapopan 🇲🇽 |
| Jue 18 Jun | 🇨🇿 Chequia vs. Sudáfrica 🇿🇦 | 12:00 PM (17:00) | Atlanta Stadium, Atlanta 🇺🇸 |
| Jue 18 Jun | 🇲🇽 México vs. Corea del Sur 🇰🇷 | 9:00 PM (03:00 Vie) | Estadio Guadalajara, Zapopan 🇲🇽 |
| Mié 24 Jun | 🇨🇿 Chequia vs. México 🇲🇽 | 9:00 PM (03:00 Jue) | Mexico City Stadium, Ciudad de México 🇲🇽 |
| Mié 24 Jun | 🇿🇦 Sudáfrica vs. Corea del Sur 🇰🇷 | 9:00 PM (03:00 Jue) | Estadio Monterrey, Guadalupe 🇲🇽 |

---

### 🔴 Grupo B — Canadá · Bosnia y Herzegovina · Qatar · Suiza

| Fecha | Partido | Hora ET (GMT) | Sede |
|-------|---------|--------------|------|
| Vie 12 Jun | 🇨🇦 Canadá vs. Bosnia y Herz. 🇧🇦 | 3:00 PM (20:00) | Toronto Stadium, Toronto 🇨🇦 |
| Sáb 13 Jun | 🇶🇦 Qatar vs. Suiza 🇨🇭 | 3:00 PM (23:00) | San Francisco Bay Area Stadium 🇺🇸 |
| Jue 18 Jun | 🇨🇭 Suiza vs. Bosnia y Herz. 🇧🇦 | 3:00 PM (23:00) | Los Angeles Stadium 🇺🇸 |
| Jue 18 Jun | 🇨🇦 Canadá vs. Qatar 🇶🇦 | 6:00 PM (02:00 Vie) | BC Place, Vancouver 🇨🇦 |
| Mié 24 Jun | 🇨🇭 Suiza vs. Canadá 🇨🇦 | 3:00 PM (23:00) | BC Place, Vancouver 🇨🇦 |
| Mié 24 Jun | 🇧🇦 Bosnia y Herz. vs. Qatar 🇶🇦 | 3:00 PM (23:00) | Seattle Stadium, Seattle 🇺🇸 |

---

### 🟢 Grupo C — Brasil · Marruecos · Haití · Escocia

| Fecha | Partido | Hora ET (GMT) | Sede |
|-------|---------|--------------|------|
| Sáb 13 Jun | 🇧🇷 Brasil vs. Marruecos 🇲🇦 | 6:00 PM (23:00) | New York New Jersey Stadium 🇺🇸 |
| Sáb 13 Jun | 🇭🇹 Haití vs. Escocia 🏴󠁧󠁢󠁳󠁣󠁴󠁿 | 9:00 PM (02:00 Dom) | Boston Stadium, Boston 🇺🇸 |
| Vie 19 Jun | 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia vs. Marruecos 🇲🇦 | 6:00 PM (23:00) | Boston Stadium, Boston 🇺🇸 |
| Vie 19 Jun | 🇧🇷 Brasil vs. Haití 🇭🇹 | 9:00 PM (02:00 Sáb) | Philadelphia Stadium 🇺🇸 |
| Mié 24 Jun | 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia vs. Brasil 🇧🇷 | 6:00 PM (23:00) | Miami Stadium, Miami 🇺🇸 |
| Mié 24 Jun | 🇲🇦 Marruecos vs. Haití 🇭🇹 | 6:00 PM (23:00) | Atlanta Stadium, Atlanta 🇺🇸 |

---

### 🟡 Grupo D — EE.UU. · Paraguay · Australia · Türkiye

| Fecha | Partido | Hora ET (GMT) | Sede |
|-------|---------|--------------|------|
| Vie 12 Jun | 🇺🇸 EE.UU. vs. Paraguay 🇵🇾 | 9:00 PM (05:00 Sáb) | Los Angeles Stadium 🇺🇸 |
| Sáb 13 Jun | 🇦🇺 Australia vs. Türkiye 🇹🇷 | 12:00 AM (08:00 Dom) | BC Place, Vancouver 🇨🇦 |
| Vie 19 Jun | 🇺🇸 EE.UU. vs. Australia 🇦🇺 | 3:00 PM (23:00) | Seattle Stadium, Seattle 🇺🇸 |
| Vie 19 Jun | 🇹🇷 Türkiye vs. Paraguay 🇵🇾 | 12:00 AM (08:00 Sáb) | San Francisco Bay Area Stadium 🇺🇸 |
| Jue 25 Jun | 🇹🇷 Türkiye vs. EE.UU. 🇺🇸 | 10:00 PM (06:00 Vie) | Los Angeles Stadium 🇺🇸 |
| Jue 25 Jun | 🇵🇾 Paraguay vs. Australia 🇦🇺 | 10:00 PM (06:00 Vie) | San Francisco Bay Area Stadium 🇺🇸 |

---

### 🟠 Grupo E — Alemania · Curazao · Costa de Marfil · Ecuador

| Fecha | Partido | Hora ET (GMT) | Sede |
|-------|---------|--------------|------|
| Dom 14 Jun | 🇩🇪 Alemania vs. Curazao 🇨🇼 | 1:00 PM (19:00) | Houston Stadium, Houston 🇺🇸 |
| Dom 14 Jun | 🇨🇮 Costa de Marfil vs. Ecuador 🇪🇨 | 7:00 PM (00:00 Lun) | Philadelphia Stadium 🇺🇸 |
| Sáb 20 Jun | 🇳🇱 Países Bajos vs. Suecia 🇸🇪 *(Grupo F — ver abajo)* | — | — |
| Sáb 20 Jun | 🇩🇪 Alemania vs. Costa de Marfil 🇨🇮 | 4:00 PM (21:00) | Toronto Stadium, Toronto 🇨🇦 |
| Sáb 20 Jun | 🇪🇨 Ecuador vs. Curazao 🇨🇼 | 8:00 PM (04:00 Dom) | Kansas City Stadium 🇺🇸 |
| Jue 25 Jun | 🇪🇨 Ecuador vs. Alemania 🇩🇪 | 4:00 PM (21:00) | New York New Jersey Stadium 🇺🇸 |
| Jue 25 Jun | 🇨🇼 Curazao vs. Costa de Marfil 🇨🇮 | 4:00 PM (21:00) | Philadelphia Stadium 🇺🇸 |

---

### 🟣 Grupo F — Países Bajos · Japón · Suecia · Túnez

| Fecha | Partido | Hora ET (GMT) | Sede |
|-------|---------|--------------|------|
| Dom 14 Jun | 🇳🇱 Países Bajos vs. Japón 🇯🇵 | 4:00 PM (22:00) | Dallas Stadium, Dallas 🇺🇸 |
| Dom 14 Jun | 🇸🇪 Suecia vs. Túnez 🇹🇳 | 10:00 PM (04:00 Lun) | Estadio Monterrey, Guadalupe 🇲🇽 |
| Sáb 20 Jun | 🇳🇱 Países Bajos vs. Suecia 🇸🇪 | 1:00 PM (19:00) | Houston Stadium, Houston 🇺🇸 |
| Sáb 20 Jun | 🇹🇳 Túnez vs. Japón 🇯🇵 | 12:00 AM (06:00 Dom) | Estadio Monterrey, Guadalupe 🇲🇽 |
| Jue 25 Jun | 🇯🇵 Japón vs. Suecia 🇸🇪 | 7:00 PM (01:00 Vie) | Dallas Stadium, Dallas 🇺🇸 |
| Jue 25 Jun | 🇹🇳 Túnez vs. Países Bajos 🇳🇱 | 7:00 PM (01:00 Vie) | Kansas City Stadium 🇺🇸 |

---

### ⚪ Grupo G — Bélgica · Egipto · Irán · Nueva Zelanda

| Fecha | Partido | Hora ET (GMT) | Sede |
|-------|---------|--------------|------|
| Lun 15 Jun | 🇧🇪 Bélgica vs. Egipto 🇪🇬 | 3:00 PM (23:00) | BC Place, Vancouver 🇨🇦 |
| Lun 15 Jun | 🇮🇷 Irán vs. Nueva Zelanda 🇳🇿 | 9:00 PM (05:00 Mar) | Los Angeles Stadium 🇺🇸 |
| Dom 21 Jun | 🇧🇪 Bélgica vs. Irán 🇮🇷 | 3:00 PM (23:00) | Los Angeles Stadium 🇺🇸 |
| Dom 21 Jun | 🇳🇿 Nueva Zelanda vs. Egipto 🇪🇬 | 9:00 PM (05:00 Lun) | BC Place, Vancouver 🇨🇦 |
| Vie 26 Jun | 🇪🇬 Egipto vs. Irán 🇮🇷 | 11:00 PM (07:00 Sáb) | Seattle Stadium, Seattle 🇺🇸 |
| Vie 26 Jun | 🇳🇿 Nueva Zelanda vs. Bélgica 🇧🇪 | 11:00 PM (07:00 Sáb) | BC Place, Vancouver 🇨🇦 |

---

### 🔶 Grupo H — España · Cabo Verde · Arabia Saudita · Uruguay

| Fecha | Partido | Hora ET (GMT) | Sede |
|-------|---------|--------------|------|
| Lun 15 Jun | 🇪🇸 España vs. Cabo Verde 🇨🇻 | 12:00 PM (17:00) | Atlanta Stadium, Atlanta 🇺🇸 |
| Lun 15 Jun | 🇸🇦 Arabia Saudita vs. Uruguay 🇺🇾 | 6:00 PM (23:00) | Miami Stadium, Miami 🇺🇸 |
| Dom 21 Jun | 🇪🇸 España vs. Arabia Saudita 🇸🇦 | 12:00 PM (17:00) | Atlanta Stadium, Atlanta 🇺🇸 |
| Dom 21 Jun | 🇺🇾 Uruguay vs. Cabo Verde 🇨🇻 | 6:00 PM (23:00) | Miami Stadium, Miami 🇺🇸 |
| Vie 26 Jun | 🇨🇻 Cabo Verde vs. Arabia Saudita 🇸🇦 | 8:00 PM (02:00 Sáb) | Houston Stadium, Houston 🇺🇸 |
| Vie 26 Jun | 🇺🇾 Uruguay vs. España 🇪🇸 | 8:00 PM (02:00 Sáb) | Estadio Guadalajara, Zapopan 🇲🇽 |

---

### 🩵 Grupo I — Francia · Senegal · Irak · Noruega

| Fecha | Partido | Hora ET (GMT) | Sede |
|-------|---------|--------------|------|
| Mar 16 Jun | 🇫🇷 Francia vs. Senegal 🇸🇳 | 3:00 PM (20:00) | New York New Jersey Stadium 🇺🇸 |
| Mar 16 Jun | 🇮🇶 Irak vs. Noruega 🇳🇴 | 6:00 PM (23:00) | Boston Stadium, Boston 🇺🇸 |
| Lun 22 Jun | 🇫🇷 Francia vs. Irak 🇮🇶 | 5:00 PM (22:00) | Philadelphia Stadium 🇺🇸 |
| Lun 22 Jun | 🇳🇴 Noruega vs. Senegal 🇸🇳 | 8:00 PM (01:00 Mar) | New York New Jersey Stadium 🇺🇸 |
| Vie 26 Jun | 🇳🇴 Noruega vs. Francia 🇫🇷 | 3:00 PM (20:00) | Boston Stadium, Boston 🇺🇸 |
| Vie 26 Jun | 🇸🇳 Senegal vs. Irak 🇮🇶 | 3:00 PM (20:00) | Toronto Stadium, Toronto 🇨🇦 |

---

### 🟤 Grupo J — Argentina · Argelia · Austria · Jordania

| Fecha | Partido | Hora ET (GMT) | Sede |
|-------|---------|--------------|------|
| Mar 16 Jun | 🇦🇷 Argentina vs. Argelia 🇩🇿 | 9:00 PM (03:00 Mié) | Kansas City Stadium 🇺🇸 |
| Mar 16 Jun | 🇦🇹 Austria vs. Jordania 🇯🇴 | 12:00 AM (08:00 Mié) | San Francisco Bay Area Stadium 🇺🇸 |
| Lun 22 Jun | 🇦🇷 Argentina vs. Austria 🇦🇹 | 1:00 PM (19:00) | Dallas Stadium, Dallas 🇺🇸 |
| Lun 22 Jun | 🇯🇴 Jordania vs. Argelia 🇩🇿 | 11:00 PM (07:00 Mar) | San Francisco Bay Area Stadium 🇺🇸 |
| Sáb 27 Jun | 🇩🇿 Argelia vs. Austria 🇦🇹 | 10:00 PM (04:00 Dom) | Kansas City Stadium 🇺🇸 |
| Sáb 27 Jun | 🇯🇴 Jordania vs. Argentina 🇦🇷 | 10:00 PM (04:00 Dom) | Dallas Stadium, Dallas 🇺🇸 |

---

### 🏅 Grupo K — Portugal · RD Congo · Uzbekistán · Colombia

| Fecha | Partido | Hora ET (GMT) | Sede |
|-------|---------|--------------|------|
| Mié 17 Jun | 🇵🇹 Portugal vs. RD Congo 🇨🇩 | 1:00 PM (19:00) | Houston Stadium, Houston 🇺🇸 |
| Mié 17 Jun | 🇺🇿 Uzbekistán vs. Colombia 🇨🇴 | 10:00 PM (04:00 Jue) | Mexico City Stadium, Ciudad de México 🇲🇽 |
| Mar 23 Jun | 🇵🇹 Portugal vs. Uzbekistán 🇺🇿 | 1:00 PM (19:00) | Houston Stadium, Houston 🇺🇸 |
| Mar 23 Jun | 🇨🇴 Colombia vs. RD Congo 🇨🇩 | 10:00 PM (04:00 Mié) | Estadio Guadalajara, Zapopan 🇲🇽 |
| Sáb 27 Jun | 🇨🇴 Colombia vs. Portugal 🇵🇹 | 7:30 PM (02:30 Dom) | Miami Stadium, Miami 🇺🇸 |
| Sáb 27 Jun | 🇨🇩 RD Congo vs. Uzbekistán 🇺🇿 | 7:30 PM (02:30 Dom) | Atlanta Stadium, Atlanta 🇺🇸 |

---

### 🟥 Grupo L — Inglaterra · Croacia · Ghana · Panamá

| Fecha | Partido | Hora ET (GMT) | Sede |
|-------|---------|--------------|------|
| Mié 17 Jun | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra vs. Croacia 🇭🇷 | 4:00 PM (22:00) | Dallas Stadium, Dallas 🇺🇸 |
| Mié 17 Jun | 🇬🇭 Ghana vs. Panamá 🇵🇦 | 7:00 PM (00:00 Jue) | Toronto Stadium, Toronto 🇨🇦 |
| Mar 23 Jun | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra vs. Ghana 🇬🇭 | 4:00 PM (21:00) | Boston Stadium, Boston 🇺🇸 |
| Mar 23 Jun | 🇵🇦 Panamá vs. Croacia 🇭🇷 | 7:00 PM (00:00 Mié) | Toronto Stadium, Toronto 🇨🇦 |
| Sáb 27 Jun | 🇵🇦 Panamá vs. Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿 | 5:00 PM (22:00) | New York New Jersey Stadium 🇺🇸 |
| Sáb 27 Jun | 🇭🇷 Croacia vs. Ghana 🇬🇭 | 5:00 PM (22:00) | Philadelphia Stadium 🇺🇸 |

---

## ⚔️ Fase Eliminatoria

### Ronda de 32 (28 Jun – 3 Jul)

| Fecha | Partido | Hora ET (GMT) | Sede |
|-------|---------|--------------|------|
| Dom 28 Jun | Por definir | 3:00 PM (23:00) | Los Angeles Stadium 🇺🇸 |
| Lun 29 Jun | Por definir | 1:00 PM (19:00) | Houston Stadium, Houston 🇺🇸 |
| Lun 29 Jun | Por definir | 4:30 PM (22:30) | Boston Stadium, Boston 🇺🇸 |
| Lun 29 Jun | Por definir | 9:00 PM (03:00 Mar) | Estadio Monterrey, Guadalupe 🇲🇽 |
| Mar 30 Jun | Por definir | 1:00 PM (19:00) | Dallas Stadium, Dallas 🇺🇸 |
| Mar 30 Jun | Por definir | 5:00 PM (22:00) | New York New Jersey Stadium 🇺🇸 |
| Mar 30 Jun | Por definir | 9:00 PM (03:00 Mié) | Mexico City Stadium, Ciudad de México 🇲🇽 |
| Mié 1 Jul | Por definir | 12:00 PM (17:00) | Atlanta Stadium, Atlanta 🇺🇸 |
| Mié 1 Jul | Por definir | 4:00 PM (00:00 Jue) | Seattle Stadium, Seattle 🇺🇸 |
| Mié 1 Jul | Por definir | 8:00 PM (04:00 Jue) | San Francisco Bay Area Stadium 🇺🇸 |
| Jue 2 Jul | Por definir | 3:00 PM (23:00) | Los Angeles Stadium 🇺🇸 |
| Jue 2 Jul | Por definir | 7:00 PM (00:00 Vie) | Toronto Stadium, Toronto 🇨🇦 |
| Jue 2 Jul | Por definir | 11:00 PM (07:00 Vie) | BC Place, Vancouver 🇨🇦 |
| Vie 3 Jul | Por definir | 2:00 PM (21:00) | Dallas Stadium, Dallas 🇺🇸 |
| Vie 3 Jul | Por definir | 6:00 PM (23:00) | Miami Stadium, Miami 🇺🇸 |
| Vie 3 Jul | Por definir | 9:30 PM (03:30 Sáb) | Kansas City Stadium 🇺🇸 |

### Octavos de Final / Ronda de 16 (4 – 7 Jul)

| Fecha | Hora ET (GMT) | Sede |
|-------|--------------|------|
| Sáb 4 Jul | 1:00 PM (19:00) | Houston Stadium, Houston 🇺🇸 |
| Sáb 4 Jul | 5:00 PM (22:00) | Philadelphia Stadium 🇺🇸 |
| Dom 5 Jul | 4:00 PM (21:00) | New York New Jersey Stadium 🇺🇸 |
| Dom 5 Jul | 8:00 PM (02:00 Lun) | Mexico City Stadium, Ciudad de México 🇲🇽 |
| Lun 6 Jul | 3:00 PM (21:00) | Dallas Stadium, Dallas 🇺🇸 |
| Lun 6 Jul | 8:00 PM (04:00 Mar) | Seattle Stadium, Seattle 🇺🇸 |
| Mar 7 Jul | 12:00 PM (17:00) | Atlanta Stadium, Atlanta 🇺🇸 |
| Mar 7 Jul | 4:00 PM (00:00 Mié) | BC Place, Vancouver 🇨🇦 |

### Cuartos de Final (9 – 11 Jul)

| Fecha | Hora ET (GMT) | Sede |
|-------|--------------|------|
| Jue 9 Jul | 4:00 PM (21:00) | Boston Stadium, Boston 🇺🇸 |
| Vie 10 Jul | 3:00 PM (23:00) | Los Angeles Stadium 🇺🇸 |
| Sáb 11 Jul | 5:00 PM (22:00) | Miami Stadium, Miami 🇺🇸 |
| Sáb 11 Jul | 9:00 PM (03:00 Dom) | Kansas City Stadium 🇺🇸 |

### Semifinales (14 – 15 Jul)

| Fecha | Hora ET (GMT) | Sede |
|-------|--------------|------|
| Mar 14 Jul | 3:00 PM (21:00) | Dallas Stadium, Dallas 🇺🇸 |
| Mié 15 Jul | 3:00 PM (20:00) | Atlanta Stadium, Atlanta 🇺🇸 |

### 🥉 Tercer Lugar — Sáb 18 Jul

| Hora ET | GMT | Sede |
|---------|-----|------|
| 5:00 PM | 22:00 | Miami Stadium, Miami 🇺🇸 |

### 🏆 FINAL — Dom 19 Jul

| Hora ET | GMT | Sede |
|---------|-----|------|
| 3:00 PM | 20:00 | **New York New Jersey Stadium, Nueva Jersey 🇺🇸** |

---

*Fuente: FIFA / Al Jazeera (7 de mayo de 2026). Todos los horarios en ET. Nombres de estadios según la nomenclatura oficial FIFA durante el torneo.*
