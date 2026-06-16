---
name: Midnight Violet
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#bec6e0'
  on-secondary: '#283044'
  secondary-container: '#3f465c'
  on-secondary-container: '#adb4ce'
  tertiary: '#c4c1fb'
  on-tertiary: '#2d2a5b'
  tertiary-container: '#8e8bc2'
  on-tertiary-container: '#262354'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#e3dfff'
  tertiary-fixed-dim: '#c4c1fb'
  on-tertiary-fixed: '#181445'
  on-tertiary-fixed-variant: '#444173'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  headline-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  container-max: 1280px
---

## Brand & Style

This design system is built for high-performance SaaS platforms that prioritize technical precision and a premium, "pro-tool" feel. The aesthetic is heavily influenced by the "Linear" design movement—characterized by a dark, immersive environment, high-contrast typography, and meticulously thin structural elements. 

The brand personality is sophisticated and forward-thinking. It evokes a sense of deep focus and speed through the use of high-contrast violet accents against a midnight canvas. By blending **Minimalism** with **Glassmorphism**, the UI achieves depth without clutter. It utilizes subtle "glow" effects and light-refracting borders to guide user attention and define a distinct digital hierarchy.

## Colors

The color palette is rooted in a deep-space spectrum. The background architecture is built on a "Midnight" foundation—a series of navy-tinted blacks and dark indigos that provide more depth than a pure black.

- **Primary:** A vibrant, electric violet used sparingly for call-to-actions, active states, and focus indicators.
- **Secondary/Surface:** Deep navy tones used for cards and containers to create a subtle distinction from the background.
- **Neutral:** A range of slate and cool grays used for secondary text and decorative borders.
- **Accents:** Occasional use of cyan or magenta "glows" (via gradients) is permitted to highlight high-value features or system status.

## Typography

This design system utilizes a single, highly technical typeface—**Geist**—to maintain a cohesive, developer-friendly aesthetic. The typography is designed for maximum legibility in dark environments.

Headlines are set with tight tracking and aggressive leading to create a "command center" feel. Body text uses generous line heights to prevent visual fatigue against the dark background. A specific "label-caps" style is used for metadata and small navigation elements to provide architectural structure to the layout. All type should be rendered as "sharp" as possible, leaning on pure white (#FFFFFF) for primary headers and light-gray (#E2E8F0) for secondary content.

## Layout & Spacing

The layout philosophy follows a **fixed-fluid hybrid grid**. Content is contained within a maximum width of 1280px to ensure readability on ultra-wide monitors, while elements inside use a 12-column fluid system.

Spacing is based on an 8px atomic scale. We prioritize "breathability"—large margins (64px+) separate major sections, while tight gutters (24px) are used for component groupings. For mobile, margins collapse to 20px, and the grid shifts to a single-column stack. Vertical rhythm is strictly enforced to maintain the "Linear" sense of order and precision.

## Elevation & Depth

Depth is not communicated through heavy shadows, but through **tonal layering** and **light refraction**.

1.  **Level 0 (Background):** The darkest navy (#020617).
2.  **Level 1 (Surface):** Subtle indigo-tinted cards (#0F172A) with a 1px "inner-glow" border (white at 5-10% opacity).
3.  **Level 2 (Overlays):** Glassmorphic modals using `backdrop-filter: blur(12px)` and a semi-transparent background (#1E293B at 60% opacity).

Instead of traditional drop shadows, use a subtle "outer glow" with the primary violet color for active elements, creating a neon-like radiance that feels native to a dark-mode environment.

## Shapes

The shape language is controlled and modern. We utilize a **Rounded (Level 2)** approach for most interface elements to soften the technical nature of the typography and dark colors.

- **Standard Elements:** 0.5rem (8px) radius for buttons and input fields.
- **Large Elements:** 1rem (16px) radius for cards and containers.
- **Search/Badges:** Pill-shaped (fully rounded) to distinguish them from structural components.

Thin, 1px borders are a mandatory requirement for all shapes. These borders should never be pure black; they should be slightly lighter than the surface they sit on to create a "etched" look.

## Components

### Buttons
Primary buttons feature a subtle vertical gradient (from Primary to a slightly darker violet) with a 1px top-edge highlight. Secondary buttons are "Ghost" style with a 1px border and a low-opacity hover state.

### Input Fields
Inputs use a deep-indigo background with a persistent 1px border. On focus, the border transitions to the primary violet with a subtle 4px outer glow.

### Cards
Cards are the primary container. They must utilize the Level 1 surface color. They should have no shadow but must have a 1px border at 10% white opacity. For "Premium" cards, add a slight violet-to-transparent gradient stroke.

### Chips & Badges
Small, high-contrast elements. Use the primary violet background with white text for "active" status, and a semi-transparent gray for "neutral" or "inactive" status.

### Lists
Lists are separated by thin, 1px horizontal dividers (#1E293B). Hover states on list items should use a subtle background tint change rather than a border.