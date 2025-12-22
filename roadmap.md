# Life-RPG Project Roadmap

## Phase 1: Deepening the Garden (Polishing & UX)
- [ ] **Mobile Optimization**
    - Ensure grid layout allows scrolling on phones.
    - Touch-friendly tap targets for Task list.
- [ ] **Audio Feedback System**
    - Implement `useSound` or Web Audio API.
    - Sounds for: Task Completion (Chime), Purchase (Coins), Level Up (Gong).
- [ ] **Animation Polish**
    - Add `framer-motion` for smooth layout transitions.
    - Fade-in effects for new log entries.

## Phase 2: The Hero's Journey (Gameplay Expansion)
- [ ] **Story Mode Implementation**
    - Create a narrative engine that unlocks chapters based on Total Level.
    - [ ] Chapter 1: The Awakening (Levels 1-10)
    - [ ] Chapter 2: The Restoration (Levels 11-20)
- [ ] **Combat System (Entropy Battles)**
    - Implement the "Combat Dummy" logic.
    - Random Events: "Entropy Spirits" attack the garden (decay habits).
    - Use `Defense` skill to mitigate damage.
- [ ] **Advanced Questing**
    - Support multi-step quests in `QUESTS.md`.
    - NPC Dialogue system overlay.

## Phase 3: Total Integration (Obsidian Ecosystem)
- [ ] **Dataview API Hook**
    - Allow users to write custom Dataview queries to feed XP.
    - Example: `1 XP per 100 words written in Vault`.
- [ ] **Calendar Plugin Sync**
    - Visualize "Streaks" directly on the Obsidian Calendar plugin.
- [ ] **Smart Prompts**
    - Suggest habits based on time of day (Morning Routine vs Night Routine).

## Phase 4: Economy 3.0 (Inventory & loot)
- [ ] **Inventory System**
    - Loot drops from completing tasks (RNG).
    - Equipment slots (Weapon, Armor) that boost Habit XP.
- [ ] **Crafting**
    - Combine resource drops (Herbs from "Health", Ore from "Work") to craft Potions.
- [ ] **Pet System**
    - Upgrade the "Scout" dog to an interactive pet that roams the garden.

## Ideas & Backlog
- **Meditation Mode**: A built-in breathing timer that awards XP per minute.
- **Focus Tree**: A visual tree that grows in real-time while you focus (Forest app style).
- **Themes**: Unlockable color themes (Dark Souls, Cyberpunk, Stardew).
