# Chrome Web Store Submission Guide for SnapStats

## Pre-Submission Checklist

### ✅ Required Items (All Complete)
- [x] Extension name: "SnapStats"
- [x] Version: 1.0.0
- [x] Description: Completed in `store-description.txt`
- [x] Icons: All sizes present (16x16, 32x32, 48x48, 128x128)
- [x] Developer information: Peyton Nowlin (peytonn98@gmail.com)
- [x] Privacy policy: `PRIVACY.md`
- [x] Extension ZIP package: `snapstats.zip`

### 🔄 Generate Store Assets
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate promotional images:**
   ```bash
   npm run generate-promotional
   ```

3. **Generate screenshots (optional):**
   - Take manual screenshots of your extension in action
   - Recommended sizes: 1280x800 or 640x400 pixels
   - Show the extension popup with performance metrics
   - Save in the `screenshots/` folder

## Chrome Web Store Submission Steps

### Step 1: Developer Account Setup
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Sign in with your Google account (peytonn98@gmail.com)
3. Pay the one-time $5 developer registration fee (if not already paid)

### Step 2: Upload Extension
1. Click "Add new item"
2. Upload the `snapstats.zip` file
3. Fill in the following information:

### Step 3: Store Listing Information
- **Extension name:** SnapStats
- **Short description:** Instantly analyze website performance metrics with beautiful visualizations
- **Detailed description:** Copy content from `store-description.txt`
- **Category:** Developer Tools
- **Language:** English
- **Store visibility:** Public
- **Price:** Free
- **Distribution countries:** All countries

### Step 4: Images and Media
- **Icon:** Use `icons/icon128.png`
- **Screenshots:** Upload screenshots from `screenshots/` folder (at least 1, max 5)
- **Promotional images:** Upload from `promotional-images/` folder:
  - Small tile (440x280): `promotional-images/small-tile.png`
  - Large tile (920x680): `promotional-images/large-tile.png` (optional)
  - Marquee tile (1400x560): `promotional-images/marquee-tile.png` (optional)

### Step 5: Privacy and Security
- **Privacy policy:** Upload `PRIVACY.md` or provide URL
- **Permissions justification:** 
  - `activeTab`: To analyze the current tab's performance
  - `scripting`: To run performance measurement code
  - `storage`: To save performance history locally

### Step 6: Submit for Review
1. Review all information
2. Click "Submit for review"
3. Note the submission ID for tracking

## Post-Submission

### Expected Timeline
- **Review time:** 1-3 business days
- **Email notifications:** Check peytonn98@gmail.com regularly

### Possible Review Outcomes
- **Approved:** Extension will be live on Chrome Web Store
- **Rejected with feedback:** Address issues and resubmit
- **More information needed:** Respond to reviewer questions

### Common Rejection Reasons to Avoid
- Missing privacy policy
- Unclear permission usage
- Poor description or screenshots
- Technical issues or crashes

## Contact Information
- **Developer:** Peyton Nowlin
- **Email:** peytonn98@gmail.com
- **GitHub:** https://github.com/PeytonNowlin/snapstats

## Files to Upload
- `snapstats.zip` (main extension package)
- `PRIVACY.md` (privacy policy)
- Screenshots from `screenshots/` folder
- Promotional images from `promotional-images/` folder 