---
name: Prestige Voyager
colors:
  surface: '#fff8f7'
  surface-dim: '#f2d3d1'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ef'
  surface-container: '#ffe9e8'
  surface-container-high: '#ffe1e0'
  surface-container-highest: '#fbdbda'
  on-surface: '#281717'
  on-surface-variant: '#5c403f'
  inverse-surface: '#3f2c2b'
  inverse-on-surface: '#ffedeb'
  outline: '#906f6e'
  outline-variant: '#e5bdbb'
  surface-tint: '#bf0229'
  primary: '#9e001f'
  on-primary: '#ffffff'
  primary-container: '#c8102e'
  on-primary-container: '#ffdad8'
  inverse-primary: '#ffb3b1'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#005468'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e87'
  on-tertiary-container: '#b6ebff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b1'
  on-primary-fixed: '#410007'
  on-primary-fixed-variant: '#92001c'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#b6ebff'
  tertiary-fixed-dim: '#82d1ed'
  on-tertiary-fixed: '#001f28'
  on-tertiary-fixed-variant: '#004e60'
  background: '#fff8f7'
  on-background: '#281717'
  surface-variant: '#fbdbda'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  card-name:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
  point-display:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base-unit: 4px
  container-padding-mobile: 16px
  container-padding-desktop: 32px
  gutter: 16px
  card-gap: 20px
  section-margin: 40px
---

## Brand & Style

The design system is centered on the concept of "Elite Global Travel." It targets frequent travelers who value exclusivity, seamless service, and recognition. The emotional response is one of aspiration and security—users should feel like they are part of an inner circle.

The visual style is a fusion of **Corporate Modern** and **Glassmorphism**. It utilizes the clarity of professional fintech apps with the luxurious depth of physical membership cards. Surfaces are treated with subtle translucency and light-refracting borders to simulate premium materials like acrylic, brushed metal, and crystal. This creates a tactile, high-end feel that distinguishes the loyalty program from the standard utility of the main app.

## Colors

The palette is anchored by the heritage brand red, used primarily for functional actions and branding moments. The loyalty experience is defined by its tier-specific colors, which are applied as gradients and glassmorphic tints rather than flat fills.

- **Primary Red:** Reserved for CTA buttons, the company logo, and critical status updates.
- **Surface Neutrals:** A range of soft greys and pure whites are used to maintain a clean, professional canvas.
- **Tier Gradients:** Each tier uses a two-tone linear gradient (Top-Left to Bottom-Right) to create depth. For example, Diamond transitions from a deep navy to a vibrant royal blue.

## Typography

This design system uses a dual-font approach to balance character with readability. **Hanken Grotesk** is used for headlines and loyalty card data to provide a sharp, contemporary "tech-luxury" aesthetic. **Inter** is used for all body copy and functional labels to ensure maximum legibility at small sizes.

Numerical data, such as point balances and currency, should always use Hanken Grotesk with tabular figures to ensure alignment in lists. Tier names within badges use `label-caps` for a distinguished, official appearance.

## Layout & Spacing

The layout follows a **Fluid Grid** model. Content is organized into a primary central column that expands up to a maximum width of 1200px on desktop.

- **Mobile:** A single-column layout with 16px side margins. Loyalty cards occupy the full width of the viewport minus margins.
- **Desktop:** A 12-column system. Loyalty dashboards utilize a 4-column sidebar for user stats and an 8-column main area for rewards and history.
- **Rhythm:** All spacing (padding, margins, gaps) must be multiples of the 4px base unit to maintain a rigorous mathematical harmony.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Glassmorphism**. 

1.  **Level 0 (Base):** Light grey background (#F8F9FA).
2.  **Level 1 (Content Blocks):** White surfaces with a very soft, 1px grey border (#E0E0E0) and no shadow.
3.  **Level 2 (Interactive Elements):** Cards and buttons use an "Ambient Shadow"—a 12% opacity shadow tinted with the primary red or tier color, with a wide 20px blur.
4.  **Level 3 (Loyalty Cards):** These are the hero elements. They feature a 20px backdrop blur, a 1px inner "glow" border (semi-transparent white), and a subtle noise texture overlay to simulate physical card stock.

## Shapes

The shape language is "Rounded Professional." Most containers use a 0.5rem (8px) radius to feel modern but structured. 

**Loyalty Cards** are the exception, utilizing a more pronounced `rounded-xl` (1.5rem / 24px) to mimic the standardized corner radius of premium credit cards. Progress bars and chips (tier badges) use a fully rounded (pill-shaped) style to contrast against the rectangular layout of the cards.

## Components

### Ranking Member Cards
The centerpiece of the UI. Each card must include:
- **Background:** A gradient mesh of the tier color with a glassmorphic frost effect.
- **Tier Badge:** A pill-shaped chip in the top right with an icon (star/diamond) and the tier name.
- **Progress Bar:** A semi-transparent track with a solid white or gold fill indicating the path to the next tier.
- **Point Display:** Points are shown in a large, bold weight with "pts" as a smaller suffix.

### Buttons
- **Primary:** Solid Red (#C8102E) with white text. High-gloss finish.
- **Secondary:** Transparent with a 1.5px border in the tier color.
- **Ghost:** No background, used for "See Details" or less critical actions.

### Input Fields
Minimalist style with a bottom-border only when inactive, transitioning to a full stroke with a subtle glow when focused.

### Progress Indicators
Thin, elegant lines. For loyalty tiers, include a "Next Tier" marker at the end of the track to motivate user progression.