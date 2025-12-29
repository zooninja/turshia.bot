# TURSHIA.BOT Branding Guide

## Brand Assets

### Logo & Main Branding Image

The main branding features:
- **Wooden sign logo** with "TURSHIA.BOT" text
  - "TURSHIA" in green cabbage-textured lettering
  - "BOT" in red chili-textured lettering with dripping effect
- **Бай Тошо character** - Grumpy village man with cap and cigarette
- **Product imagery** - Pickle jars, chutney jars, vegetables (cabbage, peppers, garlic)
- **Mode buttons** - Wooden sign style buttons:
  - "Малко по-мек" (softer mode) - with checkmark
  - "Малко по-троснат" (snappier mode) - with red pepper

### Required Assets

Place these files in the `/public` folder:

1. **branding.png** - Full branding image (main logo + character + products)
   - Used in: Header logo display, OpenGraph social sharing
   - Recommended size: 1200x1600px or similar ratio

2. **logo.png** - Favicon/icon version
   - Used in: Browser tab favicon
   - Recommended size: 512x512px square crop of logo area

## Color Palette

### Primary Colors
- **Wood Brown**: `#8b6f47` (light), `#6b4e2e` (dark)
- **Border Brown**: `#5c3a1e`
- **Text on Wood**: `#f5e6d3` (cream)

### Accent Colors
- **Cabbage Green**: `#7ba832` (from TURSHIA text)
- **Chili Red**: `#d32f2f` (from BOT text with drip effect)
- **Background**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` (purple gradient)

### UI Element Colors
- **Mode Toggle Button**: Wood gradient with cream text
- **Clear Button**: Light wood with dark text
- **Reset Button**: Reddish wood with light text

## Typography

### Font Characteristics
The branding uses rustic, textured fonts:
- **Logo**: Bold, weathered, organic textures (cabbage, chili)
- **Buttons**: Heavy, blocky sans-serif matching wooden signs
- **UI Text**: Clean sans-serif for readability (Segoe UI)

### Text Styling
- **Button text**: Bold (600-700), text-shadow for depth
- **Headers**: Strong contrast, clear hierarchy
- **Body text**: High readability, appropriate line-height

## Design Elements

### Wood Texture Effect
Buttons are styled to match the wooden sign aesthetic:
```css
background: linear-gradient(to bottom, #8b6f47, #6b4e2e);
border: 3px solid #5c3a1e;
box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
```

### Interactive States
- **Hover**: Slight lift effect (`translateY(-2px)`)
- **Hover**: Enhanced shadow for depth
- **Hover**: Slightly lighter gradient

## Persona Visual Identity

### Бай Тошо Character
- **Appearance**: Elderly village man, flat cap, white tank top
- **Expression**: Grumpy, stern, pointing finger
- **Setting**: Rural background with wooden house
- **Prop**: Cigarette (matches rough persona)

### Product Elements
- **Pickle jar**: Green vegetables, fabric lid
- **Chutney jar**: Red spread, checkered fabric lid
- **Fresh ingredients**: Cabbage, peppers, garlic, scattered around

## Usage Guidelines

### Logo Display
- **Header**: Display full branding image at max-height 120px
- **Favicon**: Use cropped square logo version
- **Social Media**: Use full branding for OpenGraph tags

### Button Styling
All control buttons should match the wooden sign aesthetic:
- Use wood gradient backgrounds
- Apply border and shadow for 3D effect
- Include text-shadow for depth
- Maintain hover effects for interactivity

### Responsive Behavior
- **Desktop**: Full logo display, horizontal button layout
- **Mobile**: Logo scales down, buttons stack if needed
- **Minimum Size**: Logo min-height 60px for mobile

## Brand Voice Match

The visual branding matches the bot personality:
- **Rustic**: Wooden textures, rural setting
- **Bold**: Strong colors, thick borders
- **Slightly Rough**: Dripping effect on "BOT", weathered look
- **Traditional**: Pickle jars, village aesthetic
- **Humorous**: Grumpy character, playful design

## File Placement

```
public/
├── branding.png          # Full branding image (1200x1600px recommended)
└── logo.png              # Square favicon (512x512px recommended)
```

## Implementation Checklist

- [x] Branding image referenced in App.tsx header
- [x] Logo used as favicon in index.html
- [x] OpenGraph meta tags include branding image
- [x] Button styles match wooden sign aesthetic
- [x] Wood brown color palette applied
- [x] Hover effects for depth and interactivity
- [x] Responsive logo sizing
- [x] Text shadows for depth

## Exporting Brand Assets

To prepare the branding image you provided:

1. **Save the full image** as `branding.png` (transparent or white background)
2. **Crop the logo area** (just the wooden sign with text) as `logo.png`
3. **Place both files** in `/public` folder
4. **Verify paths** match references in code:
   - `/branding.png` for header logo
   - `/logo.png` for favicon

## Future Branding Considerations

- **Loading state**: Could use spinning pickle jar icon
- **Error states**: Could use Бай Тошо shaking finger
- **Success states**: Could use checkmark from "мек" button
- **Animations**: Subtle wood grain texture animation
- **Sound**: Optional "thunk" sound for buttons (wooden hit)

---

**Brand Identity**: Rustic Bulgarian village pickle consultant
**Visual Style**: Wooden signs, rural imagery, traditional preserves
**Color Scheme**: Wood browns, cabbage green, chili red
**Tone**: Grumpy but humorous, traditional but playful
