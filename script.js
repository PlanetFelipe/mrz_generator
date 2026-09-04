// ICAO 9303 TD3 (passport) MRZ generator with check digits.

// ISO 3166-1 alpha-3 codes, used as ICAO 9303 nationality/issuing-state codes.
const COUNTRIES = [
  ["AFG","Afghanistan"],["ALB","Albania"],["DZA","Algeria"],["AND","Andorra"],["AGO","Angola"],
  ["ATG","Antigua and Barbuda"],["ARG","Argentina"],["ARM","Armenia"],["AUS","Australia"],["AUT","Austria"],
  ["AZE","Azerbaijan"],["BHS","Bahamas"],["BHR","Bahrain"],["BGD","Bangladesh"],["BRB","Barbados"],
  ["BLR","Belarus"],["BEL","Belgium"],["BLZ","Belize"],["BEN","Benin"],["BTN","Bhutan"],
  ["BOL","Bolivia"],["BIH","Bosnia and Herzegovina"],["BWA","Botswana"],["BRA","Brazil"],["BRN","Brunei"],
  ["BGR","Bulgaria"],["BFA","Burkina Faso"],["BDI","Burundi"],["CPV","Cabo Verde"],["KHM","Cambodia"],
  ["CMR","Cameroon"],["CAN","Canada"],["CAF","Central African Republic"],["TCD","Chad"],["CHL","Chile"],
  ["CHN","China"],["COL","Colombia"],["COM","Comoros"],["COG","Congo"],["COD","Congo (DRC)"],
  ["CRI","Costa Rica"],["CIV","Cote d'Ivoire"],["HRV","Croatia"],["CUB","Cuba"],["CYP","Cyprus"],
  ["CZE","Czechia"],["DNK","Denmark"],["DJI","Djibouti"],["DMA","Dominica"],["DOM","Dominican Republic"],
  ["ECU","Ecuador"],["EGY","Egypt"],["SLV","El Salvador"],["GNQ","Equatorial Guinea"],["ERI","Eritrea"],
  ["EST","Estonia"],["SWZ","Eswatini"],["ETH","Ethiopia"],["FJI","Fiji"],["FIN","Finland"],
  ["FRA","France"],["GAB","Gabon"],["GMB","Gambia"],["GEO","Georgia"],["DEU","Germany"],
  ["GHA","Ghana"],["GRC","Greece"],["GRD","Grenada"],["GTM","Guatemala"],["GIN","Guinea"],
  ["GNB","Guinea-Bissau"],["GUY","Guyana"],["HTI","Haiti"],["HND","Honduras"],["HUN","Hungary"],
  ["ISL","Iceland"],["IND","India"],["IDN","Indonesia"],["IRN","Iran"],["IRQ","Iraq"],
  ["IRL","Ireland"],["ISR","Israel"],["ITA","Italy"],["JAM","Jamaica"],["JPN","Japan"],
  ["JOR","Jordan"],["KAZ","Kazakhstan"],["KEN","Kenya"],["KIR","Kiribati"],["PRK","Korea (North)"],
  ["KOR","Korea (South)"],["KWT","Kuwait"],["KGZ","Kyrgyzstan"],["LAO","Laos"],["LVA","Latvia"],
  ["LBN","Lebanon"],["LSO","Lesotho"],["LBR","Liberia"],["LBY","Libya"],["LIE","Liechtenstein"],
  ["LTU","Lithuania"],["LUX","Luxembourg"],["MDG","Madagascar"],["MWI","Malawi"],["MYS","Malaysia"],
  ["MDV","Maldives"],["MLI","Mali"],["MLT","Malta"],["MHL","Marshall Islands"],["MRT","Mauritania"],
  ["MUS","Mauritius"],["MEX","Mexico"],["FSM","Micronesia"],["MDA","Moldova"],["MCO","Monaco"],
  ["MNG","Mongolia"],["MNE","Montenegro"],["MAR","Morocco"],["MOZ","Mozambique"],["MMR","Myanmar"],
  ["NAM","Namibia"],["NRU","Nauru"],["NPL","Nepal"],["NLD","Netherlands"],["NZL","New Zealand"],
  ["NIC","Nicaragua"],["NER","Niger"],["NGA","Nigeria"],["MKD","North Macedonia"],["NOR","Norway"],
  ["OMN","Oman"],["PAK","Pakistan"],["PLW","Palau"],["PAN","Panama"],["PNG","Papua New Guinea"],
  ["PRY","Paraguay"],["PER","Peru"],["PHL","Philippines"],["POL","Poland"],["PRT","Portugal"],
  ["QAT","Qatar"],["ROU","Romania"],["RUS","Russia"],["RWA","Rwanda"],["KNA","Saint Kitts and Nevis"],
  ["LCA","Saint Lucia"],["VCT","Saint Vincent and the Grenadines"],["WSM","Samoa"],["SMR","San Marino"],
  ["STP","Sao Tome and Principe"],["SAU","Saudi Arabia"],["SEN","Senegal"],["SRB","Serbia"],
  ["SYC","Seychelles"],["SLE","Sierra Leone"],["SGP","Singapore"],["SVK","Slovakia"],["SVN","Slovenia"],
  ["SLB","Solomon Islands"],["SOM","Somalia"],["ZAF","South Africa"],["SSD","South Sudan"],
  ["ESP","Spain"],["LKA","Sri Lanka"],["SDN","Sudan"],["SUR","Suriname"],["SWE","Sweden"],
  ["CHE","Switzerland"],["SYR","Syria"],["TWN","Taiwan"],["TJK","Tajikistan"],["TZA","Tanzania"],
  ["THA","Thailand"],["TLS","Timor-Leste"],["TGO","Togo"],["TON","Tonga"],["TTO","Trinidad and Tobago"],
  ["TUN","Tunisia"],["TUR","Turkiye"],["TKM","Turkmenistan"],["TUV","Tuvalu"],["UGA","Uganda"],
  ["UKR","Ukraine"],["ARE","United Arab Emirates"],["GBR","United Kingdom"],["USA","United States"],
  ["URY","Uruguay"],["UZB","Uzbekistan"],["VUT","Vanuatu"],["VAT","Vatican City"],["VEN","Venezuela"],
  ["VNM","Vietnam"],["YEM","Yemen"],["ZMB","Zambia"],["ZWE","Zimbabwe"]
];

const FIRST_NAMES = ["JOHN","JANE","MARIA","CARLOS","AHMED","LI","OLIVIA","LUCAS","EMMA","NOAH"];
const LAST_NAMES  = ["SMITH","SILVA","GARCIA","MULLER","KHAN","WANG","BROWN","ROSSI","DUBOIS","TANAKA"];

// Country field is a searchable text input (datalist) backed by a hidden input holding the ISO code.
const countryList = document.getElementById("countryList");
const countryInput = document.getElementById("countryInput");
const countryHidden = document.getElementById("country");

function countryOptionLabel(code, name) {
  return `${name} (${code})`;
}

COUNTRIES.forEach(([code, name]) => {
  const opt = document.createElement("option");
  opt.value = countryOptionLabel(code, name);
  countryList.appendChild(opt);
});

function setCountry(code) {
  const entry = COUNTRIES.find(([c]) => c === code);
  if (!entry) return;
  countryHidden.value = entry[0];
  countryInput.value = countryOptionLabel(entry[0], entry[1]);
}

// Only accept exact matches from the list; otherwise clear the resolved code so validation catches typos.
countryInput.addEventListener("input", () => {
  const match = COUNTRIES.find(([code, name]) => countryOptionLabel(code, name) === countryInput.value);
  countryHidden.value = match ? match[0] : "";
});

setCountry("GBR");

function charValue(ch) {
  if (ch === "<") return 0;
  if (ch >= "0" && ch <= "9") return ch.charCodeAt(0) - 48;
  if (ch >= "A" && ch <= "Z") return ch.charCodeAt(0) - 55; // A=10 ... Z=35
  throw new Error(`Invalid MRZ character: ${ch}`);
}

function checkDigit(str) {
  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += charValue(str[i]) * weights[i % 3];
  }
  return String(sum % 10);
}

// Keep only A-Z, 0-9; replace everything else (spaces, accents, punctuation) with "<".
function sanitize(text) {
  return text
    .toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^A-Z0-9]/g, "<");
}

function padField(str, length) {
  return (str + "<".repeat(length)).slice(0, length);
}

// Legacy app pads the doc-type field by repeating the entered value (e.g. "P" -> "PP") instead of using "<".
function padDocType(str, length) {
  const base = str || "P";
  return base.repeat(Math.ceil(length / base.length)).slice(0, length);
}

function dateToYYMMDD(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return y.slice(2) + m + d;
}

function buildNameField(lastName, firstName) {
  // <<  separates surname from given names, single < separates multiple given names/surnames.
  const raw = `${sanitize(lastName)}<<${sanitize(firstName)}`;
  return padField(raw, 39);
}

function generateMRZ() {
  const errorEl = document.getElementById("errorMsg");
  errorEl.textContent = "";

  const docType = document.getElementById("docType").value.trim().toUpperCase() || "P";
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const dob = document.getElementById("dob").value;
  const passportNumber = document.getElementById("passportNumber").value.trim().toUpperCase();
  const expiryDate = document.getElementById("expiryDate").value;
  const country = document.getElementById("country").value;
  const gender = document.getElementById("gender").value;
  const personalNumber = document.getElementById("personalNumber").value.trim().toUpperCase();

  if (!firstName || !lastName || !dob || !passportNumber || !expiryDate || !country) {
    errorEl.textContent = "Please fill in all required fields (*).";
    return;
  }
  if (passportNumber.length < 8 || passportNumber.length > 9) {
    errorEl.textContent = "Passport Number must be 8 - 9 characters (letters and numbers).";
    return;
  }

  try {
    // Line 1: docType(2) + country(3) + name(39)
    const docTypeField = padDocType(sanitize(docType), 2);
    const countryField = padField(country, 3);
    const nameField = buildNameField(lastName, firstName);
    const line1 = docTypeField + countryField + nameField;

    // Line 2: passportNo(9)+check(1) + nationality(3) + dob(6)+check(1) + sex(1) + expiry(6)+check(1) + personalNo(14)+check(1) + compositeCheck(1)
    const passportField = padField(sanitize(passportNumber), 9);
    const passportCheck = checkDigit(passportField);
    const dobField = dateToYYMMDD(dob);
    const dobCheck = checkDigit(dobField);
    const sexField = (gender === "M" ? "M" : gender === "F" ? "F" : "<");
    const expiryField = dateToYYMMDD(expiryDate);
    const expiryCheck = checkDigit(expiryField);
    const personalField = padField(sanitize(personalNumber), 14);
    const personalCheck = checkDigit(personalField);

    const compositeInput =
      passportField + passportCheck +
      dobField + dobCheck +
      expiryField + expiryCheck +
      personalField + personalCheck;
    const compositeCheck = checkDigit(compositeInput);

    const line2 =
      passportField + passportCheck +
      countryField +
      dobField + dobCheck +
      sexField +
      expiryField + expiryCheck +
      personalField + personalCheck +
      compositeCheck;

    if (line1.length !== 44 || line2.length !== 44) {
      throw new Error("Internal error: generated line length is not 44 characters.");
    }

    const countryName = (COUNTRIES.find(([code]) => code === country) || [country, country])[1];
    const summary = [
      `First Name: ${firstName.toUpperCase()}`,
      `Last Name: ${lastName.toUpperCase()}`,
      `Passport Number: ${passportNumber}`,
      `Date of Birth: ${dobField}`,
      `Date of Expiry: ${expiryField}`,
      `Gender: ${sexField}`,
      `Country: ${countryName}`,
      `Personal Number: ${personalNumber}`
    ].join("\n");

    document.getElementById("mrzOutput").value = `${summary}\n\n${line1}\n${line2}`;
  } catch (e) {
    errorEl.textContent = e.message;
  }
}

function pad2(n) { return String(n).padStart(2, "0"); }

function randomDate(startYear, endYear) {
  const year = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function randomPassportNumber() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  const len = 8 + Math.floor(Math.random() * 2); // 8 or 9
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function randomPersonalNumber() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 9; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function randomize() {
  document.getElementById("docType").value = "P";
  document.getElementById("firstName").value = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  document.getElementById("lastName").value = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  document.getElementById("dob").value = randomDate(1950, 2005);
  document.getElementById("passportNumber").value = randomPassportNumber();
  document.getElementById("expiryDate").value = randomDate(2026, 2034);
  setCountry(COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)][0]);
  document.getElementById("gender").value = Math.random() < 0.5 ? "M" : "F";
  document.getElementById("personalNumber").value = randomPersonalNumber();
  document.getElementById("errorMsg").textContent = "";
  generateMRZ();
}

function clearForm() {
  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
  document.getElementById("dob").value = "";
  document.getElementById("passportNumber").value = "";
  document.getElementById("expiryDate").value = "";
  document.getElementById("personalNumber").value = "";
  document.getElementById("mrzOutput").value = "";
  document.getElementById("errorMsg").textContent = "";
}

document.getElementById("generateBtn").addEventListener("click", generateMRZ);
document.getElementById("randomBtn").addEventListener("click", randomize);
document.getElementById("clearBtn").addEventListener("click", clearForm);
document.getElementById("copyBtn").addEventListener("click", () => {
  const out = document.getElementById("mrzOutput");
  if (!out.value) return;
  out.select();
  navigator.clipboard.writeText(out.value).catch(() => document.execCommand("copy"));
});
document.getElementById("printBtn").addEventListener("click", () => {
  const value = document.getElementById("mrzOutput").value;
  if (!value) return;
  document.getElementById("printArea").textContent = value;
  window.print();
});

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.getElementById("themeToggle").textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
  localStorage.setItem("mrzTheme", theme);
}

document.getElementById("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  applyTheme(current === "dark" ? "light" : "dark");
});

const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(localStorage.getItem("mrzTheme") || (prefersDark ? "dark" : "light"));
