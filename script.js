// ICAO 9303 TD3 (passport) MRZ generator with check digits.

// ISO 3166-1 alpha-3 codes (incl. Kosovo XKX and other common non-sovereign territories),
// used as ICAO 9303 nationality/issuing-state codes.
const COUNTRIES = [
  ["AFG","Afghanistan"],["ALA","\u00c5land Islands"],["ALB","Albania"],["DZA","Algeria"],["AND","Andorra"],["AGO","Angola"],
  ["ATG","Antigua and Barbuda"],["ARG","Argentina"],["ARM","Armenia"],["ABW","Aruba"],["AUS","Australia"],["AUT","Austria"],
  ["AZE","Azerbaijan"],["BHS","Bahamas"],["BHR","Bahrain"],["BGD","Bangladesh"],["BRB","Barbados"],
  ["BLR","Belarus"],["BEL","Belgium"],["BLZ","Belize"],["BEN","Benin"],["BMU","Bermuda"],["BTN","Bhutan"],
  ["BOL","Bolivia"],["BIH","Bosnia and Herzegovina"],["BWA","Botswana"],["BRA","Brazil"],["BRN","Brunei"],
  ["BGR","Bulgaria"],["BFA","Burkina Faso"],["BDI","Burundi"],["CPV","Cabo Verde"],["KHM","Cambodia"],
  ["CMR","Cameroon"],["CAN","Canada"],["CYM","Cayman Islands"],["CAF","Central African Republic"],["TCD","Chad"],["CHL","Chile"],
  ["CHN","China"],["COL","Colombia"],["COM","Comoros"],["COG","Congo"],["COD","Congo (DRC)"],
  ["COK","Cook Islands"],["CRI","Costa Rica"],["CIV","Cote d'Ivoire"],["HRV","Croatia"],["CUB","Cuba"],["CUW","Cura\u00e7ao"],["CYP","Cyprus"],
  ["CZE","Czechia"],["DNK","Denmark"],["DJI","Djibouti"],["DMA","Dominica"],["DOM","Dominican Republic"],
  ["ECU","Ecuador"],["EGY","Egypt"],["SLV","El Salvador"],["GNQ","Equatorial Guinea"],["ERI","Eritrea"],
  ["EST","Estonia"],["SWZ","Eswatini"],["ETH","Ethiopia"],["FRO","Faroe Islands"],["FJI","Fiji"],["FIN","Finland"],
  ["FRA","France"],["GUF","French Guiana"],["GAB","Gabon"],["GMB","Gambia"],["GEO","Georgia"],["DEU","Germany"],
  ["GHA","Ghana"],["GIB","Gibraltar"],["GRC","Greece"],["GRL","Greenland"],["GRD","Grenada"],["GLP","Guadeloupe"],["GTM","Guatemala"],["GGY","Guernsey"],["GIN","Guinea"],
  ["GNB","Guinea-Bissau"],["GUY","Guyana"],["HTI","Haiti"],["HND","Honduras"],["HKG","Hong Kong"],["HUN","Hungary"],
  ["ISL","Iceland"],["IND","India"],["IDN","Indonesia"],["IRN","Iran"],["IRQ","Iraq"],
  ["IRL","Ireland"],["IMN","Isle of Man"],["ISR","Israel"],["ITA","Italy"],["JAM","Jamaica"],["JPN","Japan"],["JEY","Jersey"],
  ["JOR","Jordan"],["KAZ","Kazakhstan"],["KEN","Kenya"],["KIR","Kiribati"],["PRK","Korea (North)"],
  ["KOR","Korea (South)"],["XKX","Kosovo"],["KWT","Kuwait"],["KGZ","Kyrgyzstan"],["LAO","Laos"],["LVA","Latvia"],
  ["LBN","Lebanon"],["LSO","Lesotho"],["LBR","Liberia"],["LBY","Libya"],["LIE","Liechtenstein"],
  ["LTU","Lithuania"],["LUX","Luxembourg"],["MAC","Macao"],["MDG","Madagascar"],["MWI","Malawi"],["MYS","Malaysia"],
  ["MDV","Maldives"],["MLI","Mali"],["MLT","Malta"],["MHL","Marshall Islands"],["MTQ","Martinique"],["MRT","Mauritania"],
  ["MUS","Mauritius"],["MEX","Mexico"],["FSM","Micronesia"],["MDA","Moldova"],["MCO","Monaco"],
  ["MNG","Mongolia"],["MNE","Montenegro"],["MAR","Morocco"],["MOZ","Mozambique"],["MMR","Myanmar"],
  ["NAM","Namibia"],["NRU","Nauru"],["NPL","Nepal"],["NLD","Netherlands"],["NZL","New Zealand"],
  ["NIC","Nicaragua"],["NER","Niger"],["NGA","Nigeria"],["MKD","North Macedonia"],["NOR","Norway"],
  ["OMN","Oman"],["PAK","Pakistan"],["PLW","Palau"],["PAN","Panama"],["PNG","Papua New Guinea"],
  ["PRY","Paraguay"],["PER","Peru"],["PHL","Philippines"],["POL","Poland"],["PRT","Portugal"],["PRI","Puerto Rico"],
  ["QAT","Qatar"],["REU","R\u00e9union"],["ROU","Romania"],["RUS","Russia"],["RWA","Rwanda"],["KNA","Saint Kitts and Nevis"],
  ["LCA","Saint Lucia"],["VCT","Saint Vincent and the Grenadines"],["WSM","Samoa"],["SMR","San Marino"],
  ["STP","Sao Tome and Principe"],["SAU","Saudi Arabia"],["SEN","Senegal"],["SRB","Serbia"],
  ["SYC","Seychelles"],["SLE","Sierra Leone"],["SGP","Singapore"],["SXM","Sint Maarten"],["SVK","Slovakia"],["SVN","Slovenia"],
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

// Letters (incl. accented), spaces and hyphens only - no digits or other symbols.
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/;

function validateNameField(inputEl, errorEl, label) {
  const value = inputEl.value.trim();
  let message = "";
  if (!value) {
    message = `${label} is required.`;
  } else if (!NAME_REGEX.test(value)) {
    message = `${label} must contain letters only (accents, spaces and hyphens are allowed).`;
  }
  inputEl.classList.toggle("invalid", !!message);
  errorEl.textContent = message;
  return !message;
}

const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const firstNameError = document.getElementById("firstNameError");
const lastNameError = document.getElementById("lastNameError");

firstNameInput.addEventListener("input", () => validateNameField(firstNameInput, firstNameError, "First Name"));
lastNameInput.addEventListener("input", () => validateNameField(lastNameInput, lastNameError, "Last Name"));

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

  const firstNameValid = validateNameField(firstNameInput, firstNameError, "First Name");
  const lastNameValid = validateNameField(lastNameInput, lastNameError, "Last Name");
  if (!firstNameValid || !lastNameValid) {
    errorEl.textContent = "Please correct the highlighted fields.";
    return;
  }
  if (!dob || !passportNumber || !expiryDate || !country) {
    errorEl.textContent = "Please fill in all required fields (*).";
    return;
  }
  if (gender !== "M" && gender !== "F") {
    errorEl.textContent = "Gender must be Male or Female.";
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
  firstNameInput.classList.remove("invalid");
  lastNameInput.classList.remove("invalid");
  firstNameError.textContent = "";
  lastNameError.textContent = "";
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
// Splits a TD3 name field (surname<<given<given...) into display-friendly parts.
function parseNameField(field) {
  const trimmed = field.replace(/<+$/, "");
  const [surnamePart = "", givenPart = ""] = trimmed.split("<<");
  return {
    surname: surnamePart.replace(/</g, " ").trim(),
    given: givenPart.replace(/</g, " ").trim()
  };
}

// Expands an MRZ YYMMDD date into "DD MMM YYYY" for the printed data page.
function formatMRZDate(yymmdd, isExpiry) {
  const yy = Number(yymmdd.slice(0, 2));
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const currentYY = new Date().getFullYear() % 100;
  // Expiry dates are always in the future; birth dates use the standard MRZ rollover rule.
  const century = isExpiry ? (yy < currentYY ? 2100 : 2000) : (yy > currentYY ? 1900 : 2000);
  const monthName = months[Number(mm) - 1] || mm;
  return `${dd} ${monthName} ${century + yy}`;
}

document.getElementById("printBtn").addEventListener("click", () => {
  const value = document.getElementById("mrzOutput").value;
  if (!value) return;

  // Re-derive the printed data-page fields from the MRZ lines themselves (not the summary
  // text), so manual edits made directly to the MRZ stay in sync with the visual fields
  // and the exact MRZ characters the user typed are preserved verbatim.
  const lines = value.split("\n").filter(l => l.trim().length > 0);
  const [rawLine1, rawLine2] = lines.slice(-2);
  const line1 = (rawLine1 || "").padEnd(44, "<").slice(0, 44);
  const line2 = (rawLine2 || "").padEnd(44, "<").slice(0, 44);

  const docType = line1.slice(0, 1);
  const countryCode = line1.slice(2, 5).replace(/</g, "");
  const { surname, given } = parseNameField(line1.slice(5, 44));

  const passportNo = line2.slice(0, 9).replace(/</g, "");
  const nationalityCode = line2.slice(10, 13).replace(/</g, "");
  const dob = formatMRZDate(line2.slice(13, 19), false);
  const sex = line2.slice(20, 21);
  const expiry = formatMRZDate(line2.slice(21, 27), true);
  const personalNo = line2.slice(28, 42).replace(/</g, "") || "-";
  const countryName = (COUNTRIES.find(([code]) => code === nationalityCode) || [countryCode, countryCode])[1];

  document.getElementById("pType").textContent = docType;
  document.getElementById("pCode").textContent = countryCode;
  document.getElementById("pDocNo").textContent = passportNo;
  document.getElementById("pSurname").textContent = surname;
  document.getElementById("pGiven").textContent = given;
  document.getElementById("pNationality").textContent = countryName;
  document.getElementById("pDob").textContent = dob;
  document.getElementById("pSex").textContent = sex === "M" ? "M" : sex === "F" ? "F" : "X";
  document.getElementById("pExpiry").textContent = expiry;
  document.getElementById("pPersonal").textContent = personalNo;
  document.getElementById("printMrz").textContent = `${rawLine1 || ""}\n${rawLine2 || ""}`;

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
