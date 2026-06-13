import type {
  Team,
  GroupRow,
  Stage,
  KeyFixture,
  GlossaryItem,
} from "./types";

// Snapshot date for the seeded standings/results below.
export const SNAPSHOT_DATE = "2026-06-13";

export const TOURNAMENT = {
  name: "FIFA World Cup 2026",
  hosts: "United States, Canada & Mexico",
  dates: "June 11 – July 19, 2026",
  teams: 48,
  groups: 12,
  matches: 104,
  finalVenue: "MetLife Stadium, New York / New Jersey",
  openingVenue: "Estadio Azteca, Mexico City",
};

// ---------------------------------------------------------------------------
// All 48 teams. fifaRank is an approximate June-2026 world ranking, used for
// the Rankings tab. tier = the draw "pot" (1 = strongest seeds incl. hosts).
// ---------------------------------------------------------------------------
export const TEAMS: Team[] = [
  // ---- Group A ----
  { name: "Mexico", flag: "🇲🇽", confederation: "N. America (CONCACAF)", fifaRank: 14, tier: 1, group: "A", qualifiedVia: "host",
    oneLiner: "Co-host. Always at the World Cup, opened the tournament at the famous Azteca stadium.",
    star: { name: "Santiago Giménez", position: "Striker", why: "Mexico's main goal threat up front." } },
  { name: "South Korea", flag: "🇰🇷", confederation: "Asia (AFC)", fifaRank: 22, tier: 2, group: "A", qualifiedVia: "direct",
    oneLiner: "Asia's perennial qualifier, fast and hard-working.",
    star: { name: "Son Heung-min", position: "Forward", why: "Korea's captain and biggest star, a deadly finisher." } },
  { name: "Czechia", flag: "🇨🇿", confederation: "Europe (UEFA)", fifaRank: 44, tier: 4, group: "A", qualifiedVia: "playoff",
    oneLiner: "Snuck in through the European playoffs in March.",
    star: { name: "Patrik Schick", position: "Striker", why: "Tall, clinical striker who scores spectacular goals." } },
  { name: "South Africa", flag: "🇿🇦", confederation: "Africa (CAF)", fifaRank: 62, tier: 3, group: "A", qualifiedVia: "direct",
    oneLiner: "Back at the World Cup for the first time in years.",
    star: { name: "Percy Tau", position: "Forward", why: "Creative attacker who makes things happen." } },

  // ---- Group B ----
  { name: "Canada", flag: "🇨🇦", confederation: "N. America (CONCACAF)", fifaRank: 30, tier: 1, group: "B", qualifiedVia: "host",
    oneLiner: "Co-host. A young, athletic team on the rise.",
    star: { name: "Alphonso Davies", position: "Wing-back", why: "Lightning-fast Bayern Munich star, Canada's talisman." } },
  { name: "Switzerland", flag: "🇨🇭", confederation: "Europe (UEFA)", fifaRank: 16, tier: 2, group: "B", qualifiedVia: "direct",
    oneLiner: "Reliable, well-organized European side that always competes.",
    star: { name: "Granit Xhaka", position: "Midfielder", why: "Experienced leader who runs the midfield." } },
  { name: "Qatar", flag: "🇶🇦", confederation: "Asia (AFC)", fifaRank: 51, tier: 3, group: "B", qualifiedVia: "direct",
    oneLiner: "Hosted the last World Cup in 2022, now back as a qualifier.",
    star: { name: "Akram Afif", position: "Forward", why: "Asia's reigning best player, a tricky attacker." } },
  { name: "Bosnia & Herzegovina", flag: "🇧🇦", confederation: "Europe (UEFA)", fifaRank: 75, tier: 4, group: "B", qualifiedVia: "playoff",
    oneLiner: "Beat Italy in the playoffs to grab a spot.",
    star: { name: "Edin Džeko", position: "Striker", why: "Veteran goal-scorer and national hero." } },

  // ---- Group C ----
  { name: "Brazil", flag: "🇧🇷", confederation: "S. America (CONMEBOL)", fifaRank: 6, tier: 1, group: "C", qualifiedVia: "direct",
    oneLiner: "Five-time champions — the most successful team in World Cup history.",
    star: { name: "Vinícius Júnior", position: "Forward", why: "Real Madrid superstar, electric with the ball." } },
  { name: "Morocco", flag: "🇲🇦", confederation: "Africa (CAF)", fifaRank: 12, tier: 2, group: "C", qualifiedVia: "direct",
    oneLiner: "Shocked the world by reaching the semi-finals in 2022.",
    star: { name: "Achraf Hakimi", position: "Defender", why: "Attacking full-back who bombs forward to score." } },
  { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", confederation: "Europe (UEFA)", fifaRank: 36, tier: 3, group: "C", qualifiedVia: "direct",
    oneLiner: "Back at a World Cup after a very long wait, with passionate fans.",
    star: { name: "Scott McTominay", position: "Midfielder", why: "Box-to-box engine who chips in with goals." } },
  { name: "Haiti", flag: "🇭🇹", confederation: "N. America (CONCACAF)", fifaRank: 90, tier: 4, group: "C", qualifiedVia: "direct",
    oneLiner: "A feel-good underdog story just reaching the tournament.",
    star: { name: "Frantzdy Pierrot", position: "Striker", why: "Powerful forward leading the line." } },

  // ---- Group D ----
  { name: "United States", flag: "🇺🇸", confederation: "N. America (CONCACAF)", fifaRank: 17, tier: 1, group: "D", qualifiedVia: "host",
    oneLiner: "Co-host and one of the main stories — a young team with momentum.",
    star: { name: "Christian Pulisic", position: "Forward", why: "America's biggest star, a difference-maker on the wing." } },
  { name: "Australia", flag: "🇦🇺", confederation: "Asia (AFC)", fifaRank: 26, tier: 2, group: "D", qualifiedVia: "direct",
    oneLiner: "The 'Socceroos' — gritty, never-say-die underdogs.",
    star: { name: "Mat Ryan", position: "Goalkeeper", why: "Captain and shot-stopper who keeps them in games." } },
  { name: "Paraguay", flag: "🇵🇾", confederation: "S. America (CONMEBOL)", fifaRank: 39, tier: 3, group: "D", qualifiedVia: "direct",
    oneLiner: "Tough, defensive South American side.",
    star: { name: "Miguel Almirón", position: "Winger", why: "Speedy attacker who carries the ball." } },
  { name: "Türkiye", flag: "🇹🇷", confederation: "Europe (UEFA)", fifaRank: 27, tier: 4, group: "D", qualifiedVia: "playoff",
    oneLiner: "Exciting young team that came through the playoffs.",
    star: { name: "Arda Güler", position: "Midfielder", why: "Real Madrid wonderkid with a magic left foot." } },

  // ---- Group E ----
  { name: "Germany", flag: "🇩🇪", confederation: "Europe (UEFA)", fifaRank: 9, tier: 1, group: "E", qualifiedVia: "direct",
    oneLiner: "Four-time champions and a traditional powerhouse.",
    star: { name: "Jamal Musiala", position: "Midfielder", why: "Silky dribbler who is the future of German football." } },
  { name: "Ecuador", flag: "🇪🇨", confederation: "S. America (CONMEBOL)", fifaRank: 23, tier: 2, group: "E", qualifiedVia: "direct",
    oneLiner: "Young, energetic South American team.",
    star: { name: "Moisés Caicedo", position: "Midfielder", why: "Chelsea's powerful midfield enforcer." } },
  { name: "Côte d'Ivoire", flag: "🇨🇮", confederation: "Africa (CAF)", fifaRank: 41, tier: 3, group: "E", qualifiedVia: "direct",
    oneLiner: "Reigning African champions (the 'Elephants').",
    star: { name: "Sébastien Haller", position: "Striker", why: "Big target man and African Cup-winning hero." } },
  { name: "Curaçao", flag: "🇨🇼", confederation: "N. America (CONCACAF)", fifaRank: 85, tier: 4, group: "E", qualifiedVia: "direct",
    oneLiner: "A tiny Caribbean island making a historic first appearance.",
    star: { name: "Leandro Bacuna", position: "Midfielder", why: "Experienced leader of this surprise package." } },

  // ---- Group F ----
  { name: "Netherlands", flag: "🇳🇱", confederation: "Europe (UEFA)", fifaRank: 7, tier: 1, group: "F", qualifiedVia: "direct",
    oneLiner: "Three-time runners-up — perennial contenders in orange.",
    star: { name: "Virgil van Dijk", position: "Defender", why: "One of the best defenders in the world and the captain." } },
  { name: "Japan", flag: "🇯🇵", confederation: "Asia (AFC)", fifaRank: 18, tier: 2, group: "F", qualifiedVia: "direct",
    oneLiner: "Asia's most technical team, dangerous on their day.",
    star: { name: "Takefusa Kubo", position: "Winger", why: "Skillful playmaker who creates chances." } },
  { name: "Tunisia", flag: "🇹🇳", confederation: "Africa (CAF)", fifaRank: 40, tier: 3, group: "F", qualifiedVia: "direct",
    oneLiner: "Well-drilled North African side, hard to break down.",
    star: { name: "Hannibal Mejbri", position: "Midfielder", why: "Energetic, combative midfielder." } },
  { name: "Sweden", flag: "🇸🇪", confederation: "Europe (UEFA)", fifaRank: 33, tier: 4, group: "F", qualifiedVia: "playoff",
    oneLiner: "Came through the playoffs with serious firepower up front.",
    star: { name: "Alexander Isak", position: "Striker", why: "Elegant, prolific goal-scorer." } },

  // ---- Group G ----
  { name: "Belgium", flag: "🇧🇪", confederation: "Europe (UEFA)", fifaRank: 8, tier: 1, group: "G", qualifiedVia: "direct",
    oneLiner: "A 'golden generation' chasing a first major trophy.",
    star: { name: "Kevin De Bruyne", position: "Midfielder", why: "World-class passer who can unlock any defense." } },
  { name: "Iran", flag: "🇮🇷", confederation: "Asia (AFC)", fifaRank: 20, tier: 2, group: "G", qualifiedVia: "direct",
    oneLiner: "One of Asia's strongest and most experienced teams.",
    star: { name: "Mehdi Taremi", position: "Striker", why: "Clever, clinical forward." } },
  { name: "Egypt", flag: "🇪🇬", confederation: "Africa (CAF)", fifaRank: 33, tier: 3, group: "G", qualifiedVia: "direct",
    oneLiner: "Africa's record champions, built around one superstar.",
    star: { name: "Mohamed Salah", position: "Forward", why: "Liverpool legend and one of the planet's best attackers." } },
  { name: "New Zealand", flag: "🇳🇿", confederation: "Oceania (OFC)", fifaRank: 86, tier: 4, group: "G", qualifiedVia: "direct",
    oneLiner: "Oceania's representative and clear underdogs.",
    star: { name: "Chris Wood", position: "Striker", why: "Reliable Premier League goal-scorer." } },

  // ---- Group H ----
  { name: "Spain", flag: "🇪🇸", confederation: "Europe (UEFA)", fifaRank: 2, tier: 1, group: "H", qualifiedVia: "direct",
    oneLiner: "Reigning European champions and a top favorite to win it all.",
    star: { name: "Lamine Yamal", position: "Winger", why: "Teenage sensation, the most exciting young player in the world." } },
  { name: "Uruguay", flag: "🇺🇾", confederation: "S. America (CONMEBOL)", fifaRank: 15, tier: 2, group: "H", qualifiedVia: "direct",
    oneLiner: "Small country, huge football history — fierce competitors.",
    star: { name: "Federico Valverde", position: "Midfielder", why: "Tireless Real Madrid engine who does everything." } },
  { name: "Saudi Arabia", flag: "🇸🇦", confederation: "Asia (AFC)", fifaRank: 58, tier: 3, group: "H", qualifiedVia: "direct",
    oneLiner: "Famously beat Argentina in 2022 — capable of upsets.",
    star: { name: "Salem Al-Dawsari", position: "Winger", why: "Match-winner who scored that famous goal vs Argentina." } },
  { name: "Cabo Verde", flag: "🇨🇻", confederation: "Africa (CAF)", fifaRank: 70, tier: 4, group: "H", qualifiedVia: "direct",
    oneLiner: "Tiny island nation making a fairy-tale debut.",
    star: { name: "Ryan Mendes", position: "Forward", why: "Experienced captain of the underdogs." } },

  // ---- Group I ----
  { name: "France", flag: "🇫🇷", confederation: "Europe (UEFA)", fifaRank: 3, tier: 1, group: "I", qualifiedVia: "direct",
    oneLiner: "2018 champions and 2022 finalists — loaded with talent.",
    star: { name: "Kylian Mbappé", position: "Forward", why: "Arguably the best player in the world, frighteningly fast." } },
  { name: "Senegal", flag: "🇸🇳", confederation: "Africa (CAF)", fifaRank: 19, tier: 2, group: "I", qualifiedVia: "direct",
    oneLiner: "One of Africa's strongest, athletic and powerful.",
    star: { name: "Sadio Mané", position: "Forward", why: "Explosive attacker and former African Player of the Year." } },
  { name: "Norway", flag: "🇳🇴", confederation: "Europe (UEFA)", fifaRank: 28, tier: 3, group: "I", qualifiedVia: "direct",
    oneLiner: "At their first World Cup in decades — and very dangerous.",
    star: { name: "Erling Haaland", position: "Striker", why: "A goal-scoring machine; this is his first World Cup." } },
  { name: "Iraq", flag: "🇮🇶", confederation: "Asia (AFC)", fifaRank: 58, tier: 4, group: "I", qualifiedVia: "playoff",
    oneLiner: "Won the intercontinental playoff to reach the finals.",
    star: { name: "Aymen Hussein", position: "Striker", why: "Iraq's reliable scorer." } },

  // ---- Group J ----
  { name: "Argentina", flag: "🇦🇷", confederation: "S. America (CONMEBOL)", fifaRank: 1, tier: 1, group: "J", qualifiedVia: "direct",
    oneLiner: "Defending champions and the world's #1 ranked team.",
    star: { name: "Lionel Messi", position: "Forward", why: "The legend — likely his final World Cup." } },
  { name: "Austria", flag: "🇦🇹", confederation: "Europe (UEFA)", fifaRank: 24, tier: 2, group: "J", qualifiedVia: "direct",
    oneLiner: "Aggressive, high-energy European side.",
    star: { name: "David Alaba", position: "Defender", why: "Versatile Real Madrid veteran and captain." } },
  { name: "Algeria", flag: "🇩🇿", confederation: "Africa (CAF)", fifaRank: 35, tier: 3, group: "J", qualifiedVia: "direct",
    oneLiner: "Talented North African team with flair.",
    star: { name: "Riyad Mahrez", position: "Winger", why: "Tricky, left-footed match-winner." } },
  { name: "Jordan", flag: "🇯🇴", confederation: "Asia (AFC)", fifaRank: 64, tier: 4, group: "J", qualifiedVia: "direct",
    oneLiner: "Making a historic first-ever World Cup appearance.",
    star: { name: "Mousa Al-Tamari", position: "Winger", why: "Pacey attacker and their main threat." } },

  // ---- Group K ----
  { name: "Portugal", flag: "🇵🇹", confederation: "Europe (UEFA)", fifaRank: 5, tier: 1, group: "K", qualifiedVia: "direct",
    oneLiner: "Stacked with talent and led by a living legend.",
    star: { name: "Cristiano Ronaldo", position: "Forward", why: "One of the greatest ever — almost certainly his last World Cup." } },
  { name: "Colombia", flag: "🇨🇴", confederation: "S. America (CONMEBOL)", fifaRank: 13, tier: 2, group: "K", qualifiedVia: "direct",
    oneLiner: "Flair-filled South American side that loves to attack.",
    star: { name: "James Rodríguez", position: "Midfielder", why: "Creative playmaker, a former World Cup Golden Boot winner." } },
  { name: "Uzbekistan", flag: "🇺🇿", confederation: "Asia (AFC)", fifaRank: 57, tier: 3, group: "K", qualifiedVia: "direct",
    oneLiner: "Reaching their first-ever World Cup.",
    star: { name: "Eldor Shomurodov", position: "Striker", why: "Their main man up front." } },
  { name: "DR Congo", flag: "🇨🇩", confederation: "Africa (CAF)", fifaRank: 55, tier: 4, group: "K", qualifiedVia: "playoff",
    oneLiner: "Won the intercontinental playoff to qualify.",
    star: { name: "Yoane Wissa", position: "Forward", why: "Sharp Premier League finisher." } },

  // ---- Group L ----
  { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", confederation: "Europe (UEFA)", fifaRank: 4, tier: 1, group: "L", qualifiedVia: "direct",
    oneLiner: "Perennial favorites chasing a first title since 1966.",
    star: { name: "Jude Bellingham", position: "Midfielder", why: "Real Madrid superstar and England's driving force." } },
  { name: "Croatia", flag: "🇭🇷", confederation: "Europe (UEFA)", fifaRank: 10, tier: 2, group: "L", qualifiedVia: "direct",
    oneLiner: "Punch above their weight — 2018 finalists, 2022 third place.",
    star: { name: "Luka Modrić", position: "Midfielder", why: "Veteran maestro who controls the game's tempo." } },
  { name: "Panama", flag: "🇵🇦", confederation: "N. America (CONCACAF)", fifaRank: 31, tier: 3, group: "L", qualifiedVia: "direct",
    oneLiner: "Scrappy Central American side that loves an upset.",
    star: { name: "Adalberto Carrasquilla", position: "Midfielder", why: "The heartbeat of the team." } },
  { name: "Ghana", flag: "🇬🇭", confederation: "Africa (CAF)", fifaRank: 73, tier: 4, group: "L", qualifiedVia: "direct",
    oneLiner: "The 'Black Stars' — a proud African footballing nation.",
    star: { name: "Mohammed Kudus", position: "Midfielder", why: "Dynamic, skillful attacker and their best player." } },
];

// ---------------------------------------------------------------------------
// Group standings snapshot (as of SNAPSHOT_DATE).
// Only confirmed early results are filled in; everything else is 0 (not yet
// played). Real-time numbers would come from a live feed.
// ---------------------------------------------------------------------------
function row(
  team: string,
  played = 0, won = 0, drawn = 0, lost = 0, goalsFor = 0, goalsAgainst = 0,
): GroupRow {
  return { team, played, won, drawn, lost, goalsFor, goalsAgainst, points: won * 3 + drawn };
}

export const GROUP_STANDINGS: Record<string, GroupRow[]> = {
  A: [
    row("Mexico", 1, 1, 0, 0, 2, 0),
    row("South Korea", 1, 1, 0, 0, 2, 1),
    row("Czechia", 1, 0, 0, 1, 1, 2),
    row("South Africa", 1, 0, 0, 1, 0, 2),
  ],
  B: [
    row("Canada", 1, 0, 1, 0, 1, 1),
    row("Bosnia & Herzegovina", 1, 0, 1, 0, 1, 1),
    row("Switzerland"),
    row("Qatar"),
  ],
  C: [row("Brazil"), row("Morocco"), row("Scotland"), row("Haiti")],
  D: [
    row("United States", 1, 1, 0, 0, 4, 1),
    row("Paraguay", 1, 0, 0, 1, 1, 4),
    row("Australia"),
    row("Türkiye"),
  ],
  E: [row("Germany"), row("Ecuador"), row("Côte d'Ivoire"), row("Curaçao")],
  F: [row("Netherlands"), row("Japan"), row("Tunisia"), row("Sweden")],
  G: [row("Belgium"), row("Iran"), row("Egypt"), row("New Zealand")],
  H: [row("Spain"), row("Uruguay"), row("Saudi Arabia"), row("Cabo Verde")],
  I: [row("France"), row("Senegal"), row("Norway"), row("Iraq")],
  J: [row("Argentina"), row("Austria"), row("Algeria"), row("Jordan")],
  K: [row("Portugal"), row("Colombia"), row("Uzbekistan"), row("DR Congo")],
  L: [row("England"), row("Croatia"), row("Panama"), row("Ghana")],
};

export const GROUP_DATE_RANGES: Record<string, string> = {
  A: "June 11 – 24", B: "June 12 – 24", C: "June 13 – 25", D: "June 12 – 25",
  E: "June 13 – 26", F: "June 14 – 26", G: "June 15 – 26", H: "June 14 – 25",
  I: "June 15 – 27", J: "June 16 – 27", K: "June 17 – 27", L: "June 16 – 26",
};

// ---------------------------------------------------------------------------
// Tournament structure
// ---------------------------------------------------------------------------
export const STAGES: Stage[] = [
  {
    name: "Group Stage",
    dates: "June 11 – 27",
    plain: "All 48 teams are split into 12 small groups of 4. Every team plays the other 3 in its group once. Win = 3 points, draw (tie) = 1 point, loss = 0. The teams that pile up the most points move on.",
  },
  {
    name: "Round of 32",
    dates: "June 28 – July 3",
    plain: "The knockout rounds begin. 32 teams advance: the top 2 from each group (24 teams) plus the 8 best 3rd-place teams. From here it's win-or-go-home — lose and you're out.",
  },
  {
    name: "Round of 16",
    dates: "July 4 – 7",
    plain: "Down to 16 teams. Single-elimination continues.",
  },
  {
    name: "Quarter-finals",
    dates: "July 9 – 11",
    plain: "The final 8. This is roughly the equivalent of the 'Elite Eight' in March Madness terms.",
  },
  {
    name: "Semi-finals",
    dates: "July 14 – 15",
    plain: "The final 4 — the 'Final Four' you mentioned! Win here and you play for the trophy.",
  },
  {
    name: "Third-place Playoff",
    dates: "July 18",
    plain: "The two losing semi-finalists play one extra game to decide who finishes 3rd.",
  },
  {
    name: "Final",
    dates: "July 19",
    plain: "The big one. Two teams, one match, and the winner is crowned World Champion for the next 4 years.",
  },
];

export const TIERS_EXPLAINER = {
  intro:
    "Before the tournament, all 48 teams were sorted into 4 tiers (officially called 'Pots') based mostly on their FIFA ranking. Think of it like seeding in a bracket. The draw then placed one team from each tier into every group — so every group of 4 has a mix of a strong seed, a good seed, a middle team, and an underdog.",
  tiers: [
    { tier: 1 as const, label: "Tier 1 — Top seeds", desc: "The strongest teams and the 3 host nations. The favorites." },
    { tier: 2 as const, label: "Tier 2 — Strong", desc: "Very good teams that can beat anyone on their day." },
    { tier: 3 as const, label: "Tier 3 — Middle", desc: "Solid teams, often the underdogs in their group." },
    { tier: 4 as const, label: "Tier 4 — Longshots", desc: "Lower-ranked teams and playoff winners — the Cinderella stories." },
  ],
};

export const KEY_FIXTURES: KeyFixture[] = [
  { date: "June 11", label: "Mexico vs South Africa", detail: "Opening match at the legendary Estadio Azteca.", result: "Mexico won 2–0" },
  { date: "June 11", label: "South Korea vs Czechia", detail: "Group A opener.", result: "South Korea won 2–1" },
  { date: "June 12", label: "Canada vs Bosnia & Herzegovina", detail: "Co-host Canada kicks off.", result: "1–1 draw" },
  { date: "June 13", label: "United States vs Paraguay", detail: "Co-host USA's big opener.", result: "USA won 4–1" },
  { date: "June 13", label: "Brazil vs Morocco", detail: "Heavyweight Brazil meets 2022 semi-finalists Morocco." },
  { date: "June 14", label: "Spain vs Cabo Verde", detail: "Favorites Spain begin their campaign." },
  { date: "June 16", label: "Argentina vs Jordan", detail: "Defending champions Argentina (and Messi) start." },
  { date: "June 15", label: "France vs Iraq", detail: "Mbappé and France get going." },
  { date: "June 17", label: "Portugal vs DR Congo", detail: "Ronaldo's Portugal open up." },
  { date: "July 19", label: "THE FINAL", detail: "World Cup Final at MetLife Stadium, New York/New Jersey." },
];

export const HOST_CITIES = [
  "Mexico City 🇲🇽", "Guadalajara 🇲🇽", "Monterrey 🇲🇽",
  "Toronto 🇨🇦", "Vancouver 🇨🇦",
  "Atlanta 🇺🇸", "Boston 🇺🇸", "Dallas 🇺🇸", "Houston 🇺🇸", "Kansas City 🇺🇸",
  "Los Angeles 🇺🇸", "Miami 🇺🇸", "New York/New Jersey 🇺🇸", "Philadelphia 🇺🇸",
  "San Francisco Bay Area 🇺🇸", "Seattle 🇺🇸",
];

export const GLOSSARY: GlossaryItem[] = [
  { term: "Group stage", meaning: "The opening round where teams play in small groups of 4 and earn points." },
  { term: "Knockout stage", meaning: "Win-or-go-home games. Lose once and you're eliminated." },
  { term: "Draw", meaning: "A tie game — both teams finish level. Each team gets 1 point." },
  { term: "Clean sheet", meaning: "When a team doesn't concede any goals in a game." },
  { term: "Goal difference (GD)", meaning: "Goals scored minus goals allowed. Used to break ties in the standings." },
  { term: "Group of Death", meaning: "A group that's unusually stacked with strong teams." },
  { term: "Pot / Tier / Seed", meaning: "How teams are ranked and grouped before the draw — higher pot = stronger team." },
  { term: "Fixture", meaning: "Just another word for a scheduled match." },
  { term: "Extra time", meaning: "If a knockout game is tied, two extra 15-minute periods are played." },
  { term: "Penalty shootout", meaning: "If still tied after extra time, players take turns shooting from the penalty spot to decide the winner." },
  { term: "Golden Boot", meaning: "The award for the tournament's top goal-scorer." },
  { term: "Cap", meaning: "One appearance for your national team. '100 caps' = played 100 times." },
];

export const FAVORITES = ["Spain", "Argentina", "France", "England", "Brazil", "Portugal"];
