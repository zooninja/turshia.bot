# 🎨 Branding Assets TODO

## ⚠️ ACTION REQUIRED

The application is fully built and integrated with branding, but you need to add the image assets.

---

## ✅ What's Already Done

- [x] Header logo display component created
- [x] Wooden button styling applied
- [x] Favicon integration in HTML
- [x] OpenGraph meta tags added
- [x] All code references point to branding files
- [x] Responsive sizing configured
- [x] Documentation complete
- [x] Build passing (145KB JS + 4KB CSS)

---

## ⚠️ What You Must Do

### 1. Save the Branding Image

**From:** The image you provided in your message (wooden sign with Бай Тошо)

**To:** `public/branding.png`

**Steps:**
1. Right-click the branding image you sent
2. Save as `branding.png`
3. Place in: `C:\Users\toche\OneDrive\Documents\toshobota\public\`

**Specifications:**
- Format: PNG (transparent or white background)
- Size: 1200x1600px recommended (or similar aspect ratio)
- Contains: Logo + Бай Тошо + jars + buttons

---

### 2. Create the Logo Favicon

**From:** The same branding image (crop the logo area)

**To:** `public/logo.png`

**Steps:**
1. Open the branding image in an image editor (Photoshop, GIMP, Paint.NET, etc.)
2. Crop just the wooden sign with "TURSHIA.BOT" text
3. Resize to square: 512x512px
4. Save as `logo.png`
5. Place in: `C:\Users\toche\OneDrive\Documents\toshobota\public\`

**Specifications:**
- Format: PNG with transparency
- Size: 512x512px square
- Contains: Just the wooden sign logo area

---

### 3. Verify Placement

After adding both files, your `/public` folder should look like:

```
public/
├── branding.png          ✅ YOU ADDED THIS
├── logo.png              ✅ YOU ADDED THIS
├── vite.svg              (default, can keep or delete)
└── PLACE_BRANDING_HERE.txt  (delete after adding files)
```

---

### 4. Test the Integration

```bash
# Start dev servers
npm run dev          # Terminal 1
npm run pages:dev    # Terminal 2

# Open browser
http://localhost:5173
```

**What you should see:**
- ✅ Full TURSHIA.BOT branding in header
- ✅ Бай Тошо character visible
- ✅ Wooden-style control buttons
- ✅ Custom favicon in browser tab

---

### 5. Clean Up

After verifying everything works:

```bash
# Delete the instruction file
rm public/PLACE_BRANDING_HERE.txt

# Optional: Delete default Vite icon
rm public/vite.svg
```

---

## 🎯 Quick Checklist

- [ ] Save full image as `public/branding.png`
- [ ] Crop and save logo as `public/logo.png`
- [ ] Run `npm run dev` to test
- [ ] Verify logo displays in header
- [ ] Verify favicon shows in browser tab
- [ ] Verify buttons have wooden style
- [ ] Delete `PLACE_BRANDING_HERE.txt`
- [ ] Ready to commit and deploy!

---

## 📝 File Paths (for reference)

**Branding Image:**
```
C:\Users\toche\OneDrive\Documents\toshobota\public\branding.png
```

**Logo Favicon:**
```
C:\Users\toche\OneDrive\Documents\toshobota\public\logo.png
```

---

## 🔍 Need Help?

### Creating the Logo
If you don't have an image editor:
1. Use online tools like Photopea (free Photoshop alternative)
2. Upload the branding image
3. Use crop tool to select just the logo
4. Resize to 512x512px
5. Export as PNG

### Alternative: Simple Approach
If creating a square logo is difficult:
1. Use the full branding image for both files (temporarily)
2. `branding.png` = full image
3. `logo.png` = same full image (will be cropped by browser)
4. Optimize later with proper square crop

---

## 🎨 What the Branding Provides

The image you provided includes:
- **Logo**: "TURSHIA" in green + "BOT" in red on wooden sign
- **Character**: Бай Тошо with cap and cigarette
- **Products**: Pickle jar and chutney jar
- **Ingredients**: Cabbage, peppers, garlic
- **Buttons**: Wooden sign examples of the two modes

This branding is already referenced in:
- Header logo display (App.tsx)
- Browser favicon (index.html)
- Social media preview (OpenGraph tags)

---

## ✨ Once Complete

You'll have a fully branded TURSHIA.BOT application with:
- Professional appearance
- Cohesive design
- Custom branding throughout
- Ready for production deployment

---

**Current Status**: Code complete, awaiting image assets
**Next Step**: Add `branding.png` and `logo.png` to `/public/`
**Time Needed**: ~5 minutes
