# Product

## Register

product

## Users

Curious general public: students, seekers, skeptics, and casual believers who encounter big questions and want a place to reason through them seriously. They are not academics by default, but they are not shallow either. They arrive from search, from recommendations, and from intellectual restlessness. They read before they post. The interface must reward lurking and lower the activation energy for first participation.

## Product Purpose

Sacred Discourse is a forum for substantive, cross-tradition religious and philosophical discussion. It exists to give curious people a place to engage seriously with Christianity, Islam, Judaism, and atheism without the noise of social media or the gatekeeping of academia. Success looks like a post thread where a skeptic and a believer both leave having thought harder.

## Brand Personality

Intelligent · Warm · Inviting

Voice is measured, never preachy. It makes space for disagreement without encouraging conflict. The tone is a well-run seminar room: rigorous but not cold, hospitable but not sentimental.

## Anti-references

- **Generic SaaS dark mode**: indigo accent on gray-900, Tailwind UI card skeletons, identical card grids, the default output of every dark-mode starter kit.
- **Religious kitsch**: gold halos, stained-glass gradients, heavy iconographic symbolism used decoratively.
- **Reddit / old-forum gray**: dense upvote tables, no visual hierarchy, information compressed for density at the expense of readability.
- **Twitter / X clone energy**: social feed aesthetics, engagement metrics front and center, dopamine loop design, reply counts as the primary content signal.

## Design Principles

1. **Substance first.** Typography, spacing, and hierarchy should make a long post easy to read — not just easy to scan. This is a reading product, not a feed.
2. **Warmth is not decoration.** The dark palette needs warmth built in, not added as an accent. Background tints, careful text contrast, and deliberate typographic color earn the "inviting" in the personality.
3. **Each tradition earns its space.** The four topic colors exist for a reason: use them with commitment at the right moments, not as thin left-border stripes on cards.
4. **Credibility through restraint.** Avoid engagement-bait patterns (visible like counts on cards, prominent reply tallies as the first thing you read). Surface them for context, not motivation.
5. **One consistent voice.** From empty states to error messages to CTA labels, every string should sound like the same thoughtful person wrote it.

## Accessibility & Inclusion

- Target WCAG AA minimum; AA-large on body copy.
- Keyboard navigation is already partially implemented (role=button + onKeyDown on PostCard). Maintain and extend this.
- Reduced motion: the current `pageFadeIn` / `cardFadeIn` animations should respect `prefers-reduced-motion`.
- Color is never the sole signal for state (error, active, liked) — always paired with an icon, label, or structural change.
