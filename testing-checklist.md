# SnapStats Testing Checklist

## Installation Testing
- [ ] Install extension in developer mode
- [ ] Verify icon appears in Chrome toolbar
- [ ] Verify correct name appears on hover

## Functionality Testing
- [ ] Open popup on a website
- [ ] Run an audit
- [ ] Verify all metrics are collected
- [ ] Check all tabs for proper data display
- [ ] Test saving/exporting performance data
- [ ] Verify historical data is stored
- [ ] Test in incognito mode (if applicable)

## UI/UX Testing
- [ ] Verify all text is correct and consistent (SnapStats everywhere)
- [ ] Check that all buttons work
- [ ] Verify charts render properly
- [ ] Test responsive layout on different window sizes
- [ ] Ensure no console errors appear during usage

## Before Final Submission
- [ ] Test on at least 3 different websites
- [ ] Clear local storage and verify extension initializes properly
- [ ] Check all permissions work correctly
- [ ] Verify all features described in store listing are functional

## How to Test
1. Load the extension in developer mode:
   - Go to chrome://extensions/
   - Enable "Developer mode"
   - Click "Load unpacked" and select the extension directory

2. After making any changes:
   - Click the refresh button on the extension card in chrome://extensions/
   - Test functionality again to ensure changes work 