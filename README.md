# MRZ Test Data Generator

A small, self-contained web tool for generating **valid test MRZ (Machine Readable Zone)** data for passports, used for QA/testing purposes. No installation, build step, or server required — just open `index.html` in a browser.

Built as a lightweight replacement for an old native "Create Passports" desktop app, so testers can quickly generate MRZ test data on any machine/OS.

## Features

- Form fields matching a standard passport data entry screen: Document Type, First Name, Last Name, Date of Birth, Passport Number, Passport Expiry Date, Country, Gender, Personal Number.
- Generates **ICAO 9303 TD3** format MRZ (2 lines x 44 characters) with correctly computed check digits (passport number, date of birth, expiry date, personal number, and composite check).
- **Randomize Data** button — instantly fills the form with random but valid test data (name, dates, passport number, country, gender, personal number).
- **Result panel** showing a human-readable summary (name, dates in `YYMMDD`, gender, country, personal number) plus the generated MRZ lines, rendered in the OCR-B font (`OCRB Regular.ttf`) for a realistic passport-like look.
- Result is editable, so you can tweak values by hand before copying/printing.
- **Copy to Clipboard** and **Print** buttons.
- **Light / Dark mode** toggle (auto-detects your OS preference, remembered via `localStorage`).

## How it works

1. Fill in the passport fields (or click **Randomize Data** for quick test data).
2. Click **Generate MRZ**. The tool:
   - Sanitizes text fields (uppercases, strips accents, replaces anything that isn't `A-Z`/`0-9` with `<`).
   - Builds MRZ Line 1: document type (2) + issuing country (3) + name field (39, `SURNAME<<GIVEN<NAMES`, padded with `<`).
   - Builds MRZ Line 2: passport number (9) + check digit + nationality (3) + date of birth (6, `YYMMDD`) + check digit + sex (1) + expiry date (6, `YYMMDD`) + check digit + personal number (14) + check digit + composite check digit.
   - Check digits use the standard ICAO 9303 weighting (`7, 3, 1` repeating), where `0-9` = their value, `A-Z` = `10-35`, and `<` = `0`.
3. Review/edit the result, then **Copy to Clipboard** or **Print** as needed.

## Usage

No build tools or dependencies needed:

```bash
git clone https://github.com/PlanetFelipe/mrz_generator.git
cd mrz_generator
# then just open index.html in your browser
```

Make sure `OCRB Regular.ttf` stays in the same folder as `index.html` (it's loaded locally via `@font-face`, no external font/CDN calls).

## Disclaimer

This tool is for generating **fictional test data only** (QA/automation purposes). It does not validate against real-world passport issuance rules and must not be used to create documents resembling genuine identity credentials.
