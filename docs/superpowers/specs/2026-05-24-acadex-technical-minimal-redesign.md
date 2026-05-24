# ACADEX Technical Minimal Redesign Spec

## Goal
Redesign the full ACADEX Expo app around the attached HTML component library direction: Technical Minimal / Instrument UI / Data Aesthetics.

## Scope
This is a full-surface UI/UX redesign. It covers auth screens, main tabs, profile, project overview, workspace tabs, board/files/notes/updates/more, detail screens, settings/progress/members/meetings, sheets, dialogs, toasts, cards, badges, avatars, buttons, inputs, and navigation chrome.

## Visual System
- Backgrounds use a cold near-black stack: base canvas, paper surface, rail surface, and thin divider lines.
- Color is signal, not decoration. The primary signal color is a sparse warm orange. Red remains reserved for destructive or overdue states. Green is muted and used only for completed/healthy states.
- Typography carries hierarchy. Large raw values use condensed display styling. Data labels, status labels, routes, dates, and metadata use monospaced styling.
- Geometry is square and exposed. Controls, avatars, badges, cards, tabs, sheets, and dialogs use radius `0` unless an image thumbnail requires a small crop radius.
- Layout uses structural whitespace, row systems, dividers, and grid-like groupings. Avoid soft SaaS cards, glow shadows, pill-heavy filters, decorative icon rows, and blue/purple accent drift.

## UX Changes
- Main screens should read like instrument panels: title row, metadata row, list/readout body, action controls.
- Projects become indexed rows or open grid modules with subject, members, visibility, and status exposed as data.
- Tasks become row-first records with priority, due state, completion/checklist information, and compact assignee identifiers.
- Workspace board remains usable on mobile and desktop, but columns should feel like technical lanes with divider lines and count readouts.
- Files, notes, meetings, and updates use consistent row/card primitives with explicit metadata and square controls.
- Empty/loading/error states stay functional and quiet: no decorative illustration emphasis, no friendly marketing copy.
- Floating action buttons are replaced or restyled as square signal controls anchored to the same command language.

## Implementation Strategy
1. Replace core tokens in `src/constants/colors.ts`, `src/constants/typography.ts`, and `src/constants/theme.ts`.
2. Update shared primitives so the rest of the app inherits the redesign.
3. Update app navigation chrome and tab/workspace shells.
4. Update main, project, workspace, auth, and detail screens where old layout patterns remain.
5. Verify with TypeScript/lint and Expo web render where the environment allows it.

## Acceptance Criteria
- No remaining blue/purple decorative accent system.
- Most rounded containers are removed or reduced to square geometry.
- Shared UI elements visibly match the attached component library direction.
- Main tabs, project workspace, auth, profile, and modal flows are visually consistent.
- App remains functional with existing data hooks and navigation routes.
- Verification command results are reported honestly, including any environment blockers.
