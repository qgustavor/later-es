export const TOKENTYPES = {
  eof: /^$/,
  rank: /^((\d+)(º|ª)?)\b/,
  time: /^(((0?[1-9]|1[0-2]):[0-5]\d(\s)?(am|pm))|((0?\d|1\d|2[0-3]):[0-5]\d))\b/,
  dayName: /^((dom|seg|ter[cç]?|qua(r(ta)?)?|qui(n(ta)?)?|sex(ta)?|s[aá]b(ado)?))?\b/,
  monthName: /^(jan(eiro)?|fev(ereiro)?|mar[çc]o|abr(il)?|mai(o)?|jun(ho)?|jul(ho)?|ago(sto)?|set(embro)?|out(ubro)?|nov(embro)?|dez(embro)?)\b/,
  yearIndex: /^(\d{4})\b/,
  every: /^(cada|todos( os)?)\b/,
  after: /^(depois( d[eao])?|após)\b/,
  before: /^antes( d[eao])?\b/,
  second: /^(s|seg(undo)?(s)?)\b/,
  minute: /^(m|min(uto)?(s)?)\b/,
  hour: /^(h|hora(s)?)\b/,
  day: /^(dia(s)?( do mês)?)\b/,
  dayInstance: /^instância do dia\b/,
  dayOfWeek: /^dia(s)? da semana\b/,
  dayOfYear: /^dia(s)? do ano\b/,
  weekOfYear: /^semana(s)?( do ano)?\b/,
  weekOfMonth: /^semana(s)? do mês\b/,
  weekday: /^dia útil\b/,
  weekend: /^fim de semana\b/,
  month: /^m[êe]s(es)?\b/,
  year: /^ano(s)?\b/,
  between: /^entre( os?)?\b/,
  start: /^(come[çc](ando)?( em| n[oa])?\b)/,
  at: /^([àa]s|@)\b/,
  and: /^(,|e\b)/,
  except: /^(exceto\b)/,
  also: /(tamb[ée]m)\b/,
  first: /^(primeiro|primeira)\b/,
  last: /^[úu]ltimo\b/,
  in: /^em\b/,
  of: /^de\b/,
  onthe: /^no dia\b/,
  on: /^em\b/,
  through: /(-|^(at[ée]|através)\b)/
}

export const NAMES = {
  jan: 1,
  fev: 2,
  mar: 3,
  abr: 4,
  mai: 5,
  jun: 6,
  jul: 7,
  ago: 8,
  set: 9,
  out: 10,
  nov: 11,
  dez: 12,
  dom: 1,
  seg: 2,
  ter: 3,
  qua: 4,
  qui: 5,
  sex: 6,
  sab: 7,
  '1º': 1,
  pri: 1,
  '2º': 2,
  '3º': 3,
  '4º': 4
}
