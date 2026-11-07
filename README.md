# Vahane.lk - Used Car Marketplace with Inspection Reports

Existing Sri Lankan vehicle sites (riyasewana.com, ikman.lk) list vehicles but give buyers no standard inspection report.
Vahane.lk makes the inspection report the core of every ad.

## Features
- Browse ads without logging in (search, category filter, sorting)
- Login / register required to post ads (stored locally)
- Posting an ad requires a completed inspection checklist (14 items: Pass / Warning / Fail + notes)
- Buyers see a clear report on each ad: score, verdict, issues found, every checked item, notes
- Price guide and common faults per model, plus a market price comparison on each ad
- My Ads (view and delete), inspection draft auto-save
- 100% offline: all data in a local dataset and AsyncStorage, no APIs

## Screens (8)
Home (browse) • Ad Detail with report • Login/Register • Post Ad • Inspection Form • My Ads • Price Guide • Model Overview

## Demo accounts
demo / demo123, nimal / nimal123, kamala / kamala123

## Run
npm install
npx expo start --web
