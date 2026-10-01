# Brain Arena v1.17 Release Notes

## Player Experience & Release Hardening

### Multi Local Profile
Route: `#/profiles`. Brain Arena can keep up to six local player slots. The currently active local progress is snapshotted before a profile switch and again on `pagehide`. Profile-manager metadata is intentionally excluded from ordinary progress imports so profile slots are not destroyed by a restore.

### Player Showcase
Route: `#/showcase`. Players can choose a featured game/result and decide whether Arena Rank, streak, and mastery appear on the showcase card.

### Shareable Result Card
Route: `#/share-result`. Uses Canvas in the browser to generate a 1200×675 PNG from the selected Match History result. Web Share is used when supported; otherwise PNG download is available.

### Arena Cup
Route: `#/arena-cup`. A seven-stage local bracket progresses through four Quarterfinal stages, two Semifinal stages, and one Final. Each stage receives a Challenge Code. Failed stages end the cup as Eliminated; completing the Final marks the cup Champion.

### Practice Lab
Route: `#/practice-lab`. One focused drill is defined for each of the 12 games. Starting a drill forces Practice mode and applies the drill's recommended education/difficulty setup.

### Save Slot & Backup Manager
Route: `#/save-slots`. Supports up to 10 named snapshots with restore, overwrite, rename, delete, and JSON export. Save-slot metadata is kept outside ordinary progress backup replacement.

### Storage Optimization Center
Route: `#/storage-center`. Reports approximate localStorage usage by category and can selectively compact replay action data, clear Match History/recent entries, delete local backups, clear recovery state, or delete Brain Arena PWA caches. Core XP/Rank/profile progression is not targeted by these cleanup actions.

### System Diagnostics v3
Route: `#/diagnostics`. Reports app/schema versions, local storage size, service worker state, PWA display mode, cache names, connectivity, viewport, last crash, and release rollback availability. ErrorBoundary records the latest crash summary locally for troubleshooting.

### Keyboard & Controller Support
Route: `#/controls`. D-Pad / left stick map to Arrow Keys and the primary gamepad button maps to Enter. This bridge reuses keyboard support already implemented by each game; it does not change game rules.

### Release Safety & Rollback
Schema v17 creates a release rollback snapshot before upgrading an existing schema. If migration throws, Brain Arena attempts to restore the previous snapshot and records a rolled-back migration log entry. A manual rollback action is exposed from System Diagnostics while the snapshot exists.

### Compatibility
- 12-game catalog remains unchanged.
- Existing XP, Rank, Season, Mission, Achievement, Mastery, PB, Match History, Replay, Daily, goals, pinned games, accessibility, and profile data remain compatible.
- PWA cache version: `brain-arena-v1.17.0`.
