---
name: Heritage Voyage
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#5e3f3a'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#936e69'
  outline-variant: '#e8bdb6'
  surface-tint: '#c00000'
  primary: '#a00000'
  on-primary: '#ffffff'
  primary-container: '#ce0000'
  on-primary-container: '#ffdcd7'
  inverse-primary: '#ffb4a8'
  secondary: '#825500'
  on-secondary: '#ffffff'
  secondary-container: '#feb23d'
  on-secondary-container: '#6e4700'
  tertiary: '#005a34'
  on-tertiary: '#ffffff'
  tertiary-container: '#007545'
  on-tertiary-container: '#7cfdb2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#930000'
  secondary-fixed: '#ffddb4'
  secondary-fixed-dim: '#ffb953'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#633f00'
  tertiary-fixed: '#7afbb1'
  tertiary-fixed-dim: '#5cde97'
  on-tertiary-fixed: '#002110'
  on-tertiary-fixed-variant: '#00522f'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  headline-md-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  card-padding: 16px
  section-gap: 20px
  container-margin: 16px
---

## Brand & Style

This design system is built for the modern travel sector, blending professional reliability with the excitement of discovery. It prioritizes clarity and efficiency, ensuring that complex itineraries and booking histories are digestible at a glance.

The visual style is **Corporate / Modern** with a touch of **Soft Minimalism**. It utilizes high-contrast primary accents to drive action, balanced by generous white space and soft container geometry. The aesthetic is designed to feel established and trustworthy, evoking the feeling of a premium concierge service that is accessible to all.

## Colors

The palette is anchored by a vibrant **Primary Red**, used strategically for brand presence, primary actions, and critical status indicators. 

- **Primary:** A bold red used for headers, active navigation states, and primary call-to-action buttons.
- **Secondary/Tertiary:** Warm gold and vibrant green are reserved for status labels (e.g., "Pending" or "Confirmed") and promotional highlights.
- **Neutrals:** A range of cool grays provides hierarchy for metadata and secondary information, while a bright white background maintains a clean, airy feel.
- **Backgrounds:** Use a very light gray (#F8F9FA) for the main app canvas to allow white cards to pop with subtle depth.

## Typography

The design system utilizes **Plus Jakarta Sans** across all levels. This typeface offers a contemporary, friendly geometric structure that maintains excellent legibility at small sizes—essential for dense travel data.

- **Headlines:** Bold weights with tighter letter-spacing for a confident, editorial look.
- **Body Text:** Standard weights with generous line-height to ensure readability during long browsing sessions.
- **Status Labels:** Heavy weights in small sizes, often paired with all-caps, to create clear visual distinction for tags and badges.

## Layout & Spacing

This design system employs a **Fluid Grid** model optimized for mobile-first consumption.

- **Safe Areas:** A standard 16px horizontal margin is applied to all main containers.
- **Vertical Rhythm:** A base-4 increment system drives consistency. Elements within cards use 8px spacing, while cards themselves are separated by a 20px gap to provide clear visual breathing room.
- **Grouping:** Use logical grouping with subtle dividers (1px, low-contrast) inside cards to separate header information from transaction details.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Soft Ambient Shadows**.

- **Surface Levels:** The main canvas is the lowest level. White cards sit above the canvas with a very soft, diffused shadow (0px 4px 12px, 5% opacity black).
- **Interactive Elements:** Buttons and active chips use color saturation rather than heavy shadows to indicate interactability.
- **Overlays:** Modals and bottom sheets utilize a standard backdrop blur (12px) and a higher elevation shadow to pull focus away from the background content.

## Shapes

The shape language is defined by **pronounced, friendly rounding**.

- **Cards:** Use a 20px (`rounded-xl`) corner radius to create a soft, modern container for content.
- **Buttons & Chips:** Follow a "Pill" philosophy (fully rounded sides) for interactive elements to distinguish them from content containers.
- **Input Fields:** Utilize a 12px radius to strike a balance between the soft cards and the pill-shaped buttons.

## Components

### Buttons
- **Primary:** Solid Red background, white text, pill-shaped.
- **Secondary:** White background, Red border (1.5px), Red text.
- **Ghost:** Transparent background, gray or red text, used for less prominent actions like "View Details".

### Chips & Filters
- **Filter Chips:** Light gray background (#F0F0F0) with gray text for inactive states. Active state switches to Primary Red background with white text.
- **Status Badges:** Soft tinted backgrounds (e.g., light orange) with high-contrast text in the same hue.

### Cards
- **Structure:** 20px border radius, white background, subtle border (1px #EEEEEE). 
- **Header Image:** When present, images should have a top-only radius of 20px or be used as a subtle background watermark with a white-to-transparent gradient overlay.

### Navigation
- **Bottom Bar:** High-legibility icons with 12px labels. Active state is indicated by a Primary Red color and a small indicator dot or bar below the icon.
- **Top Bar:** Solid Primary Red background with white logo and utility icons (notifications, search).

### Inputs
- **Text Fields:** Clear labels above the field, 12px rounded corners, and a subtle gray border that thickens and turns Primary Red on focus.