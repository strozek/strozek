// format: 	stem (no -en ending) of 1st singular
//		stem of 2nd/3rd singular ( * if no 's' in 2nd)
//		past
//		past participle ( * if goes with sein)
//		English equivalent
//		object type: Thing, Person, Location, Object case (Akk, Dat)
//
var verbs=new Array(                          //TPLO
"kauf", "k&auml;uf",  "kaufte", "gekauft",  "buy",  "+--A",
"seh",  "sieh",  "sah",    "gesehen",  "see",  "++-A",
"h&ouml;r",  "h&ouml;r",   "h&ouml;rte",  "geh&ouml;rt",   "hear", "-+-A",
"trau", "trau",  "traute", "getraut",  "trust","-+-D",
"geh",  "geh",   "ging",   "*gegangen","go",   "--+A",
"fahr", "f&auml;hr",  "fuhr",   "*gefahren","drive","--+A",
"sitz", "*sitz", "*sa&szlig;",   "gesessen", "sit",  "--+D",
"");

// format: 	noun
//		plural
//		gender: m, f, n, p
//		Engish equivalent
//		Thing, Person, Location
//
var nouns=new Array(
"Buch",    "B&uuml;cher",  "n", "book",          "T",
"Wagen",   "Wagen",   "m", "car",           "T",
"Uhr",     "Uhren",   "f", "clock",         "T",
"Brief",   "Briefe",  "m", "letter",        "T",
"Soldat",  "Soldaten","m", "soldier",       "P",
"Lehrer",  "Lehrer",  "m", "teacher",       "P",
"Lehrerin","Lehrerin","f", "female teacher","P",
"Vater",   "V&auml;ter",   "m", "father",        "P",
"Schule",  "Schulen", "f", "school",        "L",
"Stadt",   "St&auml;dte",  "f", "city",          "L",
"Wald",    "W&auml;lder",  "m", "forest",        "L",
"Haus",    "H&auml;user",  "n", "house",         "L",
"");

// format: 	adjective
//		English equivalent
//		Thing, Person, Location
//
var adjectives=new Array(//TPL
"gro&szlig;",    "big",         "+++",
"klein",   "small",       "+++",
"rot",     "red",         "+--",
"launisch","moody",       "-+-",
"ge&auml;rgert","annoyed",     "-+-",
"ruhig",   "quiet",       "--+",
"");

var propernames=new Array(
"Ursula", "Erika", "Jurgen", "Rutger", "Heidi", "Katherine", "Ewa", "Herbert", "Erik",
"");