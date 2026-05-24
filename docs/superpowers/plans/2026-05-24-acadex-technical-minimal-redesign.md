# ACADEX Technical Minimal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the full ACADEX Expo app to the approved Technical Minimal / Instrument UI direction.

**Architecture:** Start with global tokens, then shared primitives, then route shells and screens. Preserve existing hooks, services, stores, and navigation routes; change presentation and interaction chrome only.

**Tech Stack:** Expo SDK 56, Expo Router, React Native 0.85, React 19.2.3, TypeScript, existing Sora/Inter fonts.

---

## File Structure

- Modify `src/constants/colors.ts`: monochrome surfaces, signal color, muted semantic palette.
- Modify `src/constants/typography.ts`: expose technical mono/condensed aliases using existing loaded fonts.
- Modify `src/constants/theme.ts`: square defaults, technical spacing, input/card/button defaults.
- Modify shared components in `src/components`: cards, badges, avatars, headers, inputs, empty/loading states, progress, tabs, dialogs, sheets.
- Modify route shells in `src/app/_layout.tsx`, `src/app/(main)/_layout.tsx`, `src/app/project/[id]/_layout.tsx`, `src/app/project/[id]/workspace.tsx`.
- Modify main routes in `src/app/(auth)`, `src/app/(main)`, and `src/app/project/[id]`.
- Modify workspace screens in `src/screens/workspace`.

## Tasks

### Task 1: Token System
- [ ] Replace `colors.ts` with cold near-black surfaces, thin dividers, orange signal, muted semantic colors, and compatibility aliases.
- [ ] Replace card/input defaults in `theme.ts` with square geometry, thin borders, no shadows, and technical spacing.
- [ ] Add typography aliases in `typography.ts` for display, mono labels, and condensed values using current fonts.
- [ ] Run `npx tsc --noEmit` and fix token type errors.

### Task 2: Shared Primitives
- [ ] Redesign `Badge`, `Avatar`, `ProjectCard`, `TaskCard`, `SectionHeader`, `ProgressBar`, `StatusBadge`, `PriorityBadge`, `FormInput`, `EmptyState`, `LoadingSpinner`, `ConfirmDialog`, `AcadexToast`, and `WorkspaceTabs`.
- [ ] Replace pill/card/FAB visual language with rows, square controls, divider lines, and raw data labels.
- [ ] Preserve props and call sites unless a local screen update is required.
- [ ] Run `npx tsc --noEmit` and fix component contract errors.

### Task 3: Navigation Shells
- [ ] Restyle root backgrounds/status bar.
- [ ] Redesign main tabs as sparse instrument navigation while preserving tab route names.
- [ ] Redesign project workspace header and tab bar.
- [ ] Run `npx tsc --noEmit`.

### Task 4: Main Screens
- [ ] Redesign Home, My Tasks, Explore, Profile, Edit Profile.
- [ ] Convert old rounded cards and blue buttons to technical rows, grid readouts, and square signal commands.
- [ ] Preserve create/join project flows and existing data hooks.
- [ ] Run `npx tsc --noEmit`.

### Task 5: Project and Workspace Screens
- [ ] Redesign project overview, settings, progress, members, meetings, file/note/task detail screens.
- [ ] Redesign Board, Files, Notes, Updates, More workspace screens.
- [ ] Keep board responsive behavior and all create/upload/delete flows intact.
- [ ] Run `npx tsc --noEmit`.

### Task 6: Sheets and Modal Flows
- [ ] Redesign create/join project sheets and create task sheet.
- [ ] Redesign note creation prompt, confirmation dialogs, and toast states.
- [ ] Run `npx tsc --noEmit`.

### Task 7: Final Verification
- [ ] Run `npm run lint` if available.
- [ ] Run `npx tsc --noEmit`.
- [ ] Start Expo web with `npm run web` or `npx expo start --web` and verify the main routes render if the environment allows.
- [ ] Report any environment blocker separately from code status.
