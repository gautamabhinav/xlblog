# Premium Frontend Architecture

## Updated Folder Structure

```text
src/
  Components/Premium/
    PremiumShell.jsx       # cinematic shell, glass panels, buttons, inputs, stats, skeletons
    ContentRail.jsx        # OTT horizontal rails and premium content cards
    MobileBottomNav.jsx    # mobile-first app navigation
    ErrorBoundary.jsx      # production UI fallback
  Components/OTT/
    OTTVideoPlayer.jsx     # cinematic video player UI
  Components/Voice/
    VoiceCommandPanel.jsx  # MediaRecorder + Web Speech API UI
  Pages/OTT/
    OTTExperience.jsx      # premium OTT/LMS experience
    EnterpriseDashboard.jsx
```

## Design System

- Premium dark theme with deep black, red, blue, and glass layers.
- Reusable `CinematicPage`, `GlassPanel`, `PremiumButton`, `PremiumInput`, `StatCard`, and `SkeletonCard`.
- Framer Motion page transitions, hover elevation, and OTT-style controls.
- Mobile bottom navigation for an app-like LMS/OTT experience.

## Performance

- `App.jsx` uses route-level `lazy()` imports and `Suspense`.
- Images use lazy loading inside content cards.
- Heavy pages such as Excel, dashboards, tests, and OTT load into separate chunks.
- Existing APIs, auth guards, Redux slices, and route paths are preserved.

## Redesigned Surfaces

- Homepage: cinematic hero, featured rails, smart search, categories, live/AI panels.
- Courses: premium discovery grid with search and skeleton loading.
- Tests: cinematic exam arena with stats and premium cards.
- Admin: enterprise analytics dashboard and model management studio.
- Profile and login: premium dark/auth shell.
- OTT player: custom overlay controls, theater mode, mini-player, progress, notes, subtitles/quality placeholders.
