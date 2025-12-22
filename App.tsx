
import { debounce } from 'obsidian';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameState, Task, LifeRPGData, Skill } from './types';
import { HABIT_DEFINITIONS, SKILL_DEFINITIONS } from './constants';
import { parseVault } from './services/markdownService';
import { loadGameData, saveGameData } from './services/persistenceService';
import { GARDEN_THEMES } from './constants';

// Feature Components
import Chronicle from './components/Chronicle';
import Settings from './components/Settings';
import TaskList from './components/TaskList';
import { useGameSound } from './hooks/useGameSound';
import DialogueOverlay from './components/DialogueOverlay';
import WeatherOverlay from './components/WeatherOverlay';
import { motion } from 'framer-motion';
import HomeBase from './components/HomeBase';
import ErrorBoundary from './components/ErrorBoundary';
import FocusTimer from './components/FocusTimer';

// Props passed from main.ts
interface AppProps {
    app: any; // Obsidian App
    plugin: any; // LifeRPGPlugin
}

enum Tab {
    DASHBOARD = 'DASHBOARD',
    TASKS = 'TASKS',
    FOCUS = 'FOCUS',
    STORY = 'STORY',
    HISTORY = 'HISTORY',
    SETTINGS = 'SETTINGS',
}

const NAV_ITEMS = [
    { tab: Tab.TASKS, label: 'Journal', img: 'fas fa-book' },
    { tab: Tab.DASHBOARD, label: 'Garden', img: 'fas fa-tree' },
    { tab: Tab.FOCUS, label: 'Focus', img: 'fas fa-clock' },
    { tab: Tab.STORY, label: 'Journey', img: 'fas fa-scroll' },
    { tab: Tab.HISTORY, label: 'Chronicle', img: 'fas fa-calendar-days' },
];

const POMODORO_DEFAULT = 25 * 60;

// --- THEME ADAPTATION (Sanctuary) ---
const ZEN_BG = "bg-transparent"; // Handled by body::before
const ZEN_TEXT = "text-sanctuary-ink";
const ZEN_ACCENT = "text-sanctuary-red";
const ZEN_BORDER = "border-sanctuary-border";

const App: React.FC<AppProps> = ({ app, plugin }) => {
    // State
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [persistentData, setPersistentData] = useState<LifeRPGData | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>(Tab.TASKS);
    const [showDialogue, setShowDialogue] = useState(false);

    // Focus Timer State
    const [timerActive, setTimerActive] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(POMODORO_DEFAULT);
    const [timerMode, setTimerMode] = useState<'POMODORO' | 'STOPWATCH' | 'MEDITATE'>('POMODORO');
    const [breathPhase, setBreathPhase] = useState<'INHALE' | 'HOLD' | 'EXHALE'>('INHALE');

    // Settings
    const [defaultXpReward, setDefaultXpReward] = useState(10);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const { play } = useGameSound(soundEnabled);
    const [bgUrl, setBgUrl] = useState<string | undefined>(undefined);

    // Base Path for Assets
    const [assetBasePath, setAssetBasePath] = useState<string>('');

    useEffect(() => {
        // Safe Asset Path Handling
        if (process.env.NODE_ENV === 'development') {
            // In local dev, assets are served from /assets relative to root
            setAssetBasePath('./assets');
            return;
        }

        // Obsidian Environment Logic
        if (!plugin?.manifest?.dir) return;

        try {
            const dummyPath = `${plugin.manifest.dir}/assets/zen_garden_bg.png`;
            const resolved = app.vault.adapter.getResourcePath(dummyPath);
            const cleanPath = resolved.split('?')[0];
            const basePath = cleanPath.substring(0, cleanPath.lastIndexOf('/'));
            setAssetBasePath(basePath);
        } catch (e) {
            console.error("Failed to resolve asset path:", e);
        }
    }, [plugin]);

    // --- DATA LOADING & SYNC ---
    useEffect(() => {
        const loadAllData = async () => {
            const data = await loadGameData(plugin);
            setPersistentData(data);
            setDefaultXpReward(data.settings.defaultXp);
            setSoundEnabled(data.settings.soundEnabled);
        };
        loadAllData();

        // Path to Zen Background
        const loadBg = async () => {
            if (!persistentData) return;

            let targetTheme = 'classic';
            const { themeMode, manualThemeId } = persistentData.settings;

            if (themeMode === 'MANUAL' && manualThemeId) {
                targetTheme = manualThemeId;
            } else if (themeMode === 'SMART') {
                // Smart Rotation Logic
                const hour = new Date().getHours();
                const month = new Date().getMonth(); // 0-11

                // Determine Season (Northern Hemisphere)
                let season = 'spring';
                if (month >= 2 && month <= 4) season = 'spring';
                else if (month >= 5 && month <= 7) season = 'summer';
                else if (month >= 8 && month <= 10) season = 'autumn';
                else season = 'winter';

                // Determine Time of Day
                if (hour >= 21 || hour < 5) { // Night (9PM - 5AM)
                    targetTheme = 'night';
                } else if (hour >= 5 && hour < 8) { // Dawn (5AM - 8AM)
                    targetTheme = Math.random() > 0.5 ? 'dawn' : 'fog';
                } else { // Day (8AM - 9PM)
                    // Rain chance (Simple RNG for now, ideally hook into weather API later)
                    // For now, day = season
                    targetTheme = season;
                }
            } else if (themeMode === 'RANDOM') {
                const randomIdx = Math.floor(Math.random() * GARDEN_THEMES.length);
                targetTheme = GARDEN_THEMES[randomIdx].id;
            }

            // Resolve Filename
            const themeDef = GARDEN_THEMES.find(t => t.id === targetTheme) || GARDEN_THEMES[0];
            const themePath = `${plugin.manifest.dir}/assets/${themeDef.file}`;

            if (await app.vault.adapter.exists(themePath)) {
                setBgUrl(app.vault.adapter.getResourcePath(themePath));
            } else {
                console.warn("LifeRPG: Theme file not found:", themePath);
            }
        };
        loadBg();
    }, [persistentData]); // Reload BG when persistentData (settings) changes

    useEffect(() => {
        if (!persistentData) return;

        // Debounced calculation to prevent typing lag
        // We wait N milliseconds after the last change before triggering the heavy vault parse
        const triggerRecalc = debounce(async () => {
            console.log("LifeRPG: Recalculating Stats...");
            const files = app.vault.getMarkdownFiles();
            // Light filtering for daily notes and active note
            const activeFile = app.workspace.getActiveFile();
            const relevantFiles = files.filter((f: any) =>
                f.path.includes('Daily/') || f.path.includes('Journal/') || f.path === activeFile?.path
            );

            const newState = await parseVault(app, relevantFiles, defaultXpReward, persistentData.settings.customMappings);
            setGameState({
                ...newState,
                baseLayout: persistentData.baseLayout || []
            });
        }, persistentData.settings.debounceDelay || 2000, true); // Use setting or default to 2000

        // Trigger on metadata changes using the debounced function
        const metaRef = app.metadataCache.on('changed', () => triggerRecalc());
        const leafRef = app.workspace.on('active-leaf-change', () => triggerRecalc());

        // Initial load (immediate call)
        triggerRecalc();

        return () => {
            app.metadataCache.offref(metaRef);
            app.workspace.offref(leafRef);
            // triggerRecalc.cancel(); // Not strictly available on all Obsidian debounce implementations but safe to omit
        };
    }, [persistentData]);

    // Timer Logic
    useEffect(() => {
        let interval: any;
        if (timerActive) {
            interval = setInterval(() => {
                setTimerSeconds(prev => {
                    if (timerMode === 'STOPWATCH') return prev + 1;
                    if (prev <= 1) {
                        setTimerActive(false);
                        play('gong');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive, timerMode]);

    // UI Helpers
    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!gameState) return <div className={`flex items-center justify-center h-screen ${ZEN_BG} ${ZEN_TEXT}`}>Loading Sanctuary...</div>;

    return (
        <div className={`flex flex-col h-full font-sans ${ZEN_BG} ${ZEN_TEXT} overflow-hidden selection:bg-sanctuary-red selection:text-white relative`}>
            <WeatherOverlay />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto relative scroll-smooth">
                {/* MINIMAL HEADER */}
                <div className="h-24 flex items-center justify-center sticky top-0 z-30 pointer-events-none">
                    <div className="text-2xl font-serif text-sanctuary-ink font-light italic tracking-widest pointer-events-auto opacity-80">
                        the sanctuary
                    </div>
                </div>

                {/* APP VIEWS */}
                <div className="pb-32 min-h-full">
                    <ErrorBoundary>
                        <div className="max-w-4xl mx-auto px-4 sm:px-8">
                            {activeTab === Tab.TASKS && (
                                <div className="space-y-12 animate-fade-in py-12">
                                    <div className="flex flex-col items-center mb-12">
                                        <h1 className="text-4xl font-serif text-sanctuary-ink mb-2">The Chronicle</h1>
                                        <div className="w-12 h-1 bg-sanctuary-red/20 mb-4 rounded-full"></div>
                                        <p className="text-sanctuary-inkLight tracking-[0.1em] text-sm uppercase">
                                            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <TaskList
                                        title="Today's Intentions"
                                        tasks={gameState.tasks && gameState.tasks.length > 0 ? gameState.tasks : [
                                            { id: 'mock-1', description: 'Debug: Meditate for 10 min', completed: false, xpReward: 50, skillTag: 'mind', filename: 'Mock', isHabit: true, currentValue: 0, targetValue: 10 },
                                            { id: 'mock-2', description: 'Debug: Write journal entry', completed: true, xpReward: 20, skillTag: 'create', filename: 'Mock', isHabit: false }
                                        ]}
                                        onToggleTask={(id) => console.log('Toggle', id)}
                                    />
                                </div>
                            )}

                            {activeTab === Tab.DASHBOARD && (
                                <div className="h-full w-full relative">
                                    <HomeBase
                                        gameState={gameState}
                                        backgroundImage={bgUrl}
                                        avatarAction="IDLE"
                                        assetBasePath={assetBasePath}
                                        onInteraction={(id) => console.log(id)}
                                    />
                                </div>
                            )}

                            {activeTab === Tab.FOCUS && (
                                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-fade-in py-12">
                                    <FocusTimer
                                        skills={gameState.skills || []}
                                        isActive={timerActive}
                                        mode={timerMode}
                                        seconds={timerSeconds}
                                        selectedSkillId={gameState.skills?.[0]?.id || 'strength'}
                                        onToggle={() => setTimerActive(!timerActive)}
                                        onStop={() => {
                                            setTimerActive(false);
                                            setTimerSeconds(POMODORO_DEFAULT);
                                            // Handle completion TODO
                                        }}
                                        onModeChange={(m) => setTimerMode(m)}
                                        onSkillChange={(id) => console.log(id)}
                                        assetBasePath={assetBasePath}
                                    />
                                </div>
                            )}

                            {activeTab === Tab.STORY && (
                                <div className="space-y-12 animate-fade-in py-12">
                                    <div className="flex flex-col items-center mb-12">
                                        <h1 className="text-4xl font-serif text-sanctuary-ink mb-2">The Journey</h1>
                                        <div className="w-12 h-1 bg-sanctuary-red/20 mb-4 rounded-full"></div>
                                        <p className="text-sanctuary-inkLight tracking-[0.1em] text-sm uppercase">
                                            Level {gameState?.skills?.find(s => s.id === 'SCHOLAR')?.level || 1} Scholar
                                        </p>
                                    </div>
                                    <div className="p-12 bg-white/40 shadow-soft rounded-sm border border-sanctuary-border text-center">
                                        <p className="text-sanctuary-ink font-serif italic text-lg leading-relaxed">"The path reveals itself only as you walk it."</p>
                                        <div className="mt-8 p-6 bg-white/60 rounded border-l-2 border-sanctuary-red text-left">
                                            <h3 className="font-serif text-xl text-sanctuary-ink mb-2">Chapter 1: The Awakening</h3>
                                            <p className="text-sanctuary-inkLight leading-relaxed">You have begun to document your life. The fog lifts.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === Tab.HISTORY && (
                                <div className="animate-fade-in py-12">
                                    <Chronicle
                                        stats={persistentData?.history || {}}
                                        onDayClick={(date) => console.log('Clicked', date)}
                                    />
                                </div>
                            )}
                        </div>
                    </ErrorBoundary>
                </div>
            </div>

            {/* FLOATING NAVIGATION PILL */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-white/90 backdrop-blur-md border border-sanctuary-border px-6 py-3 rounded-full shadow-soft flex items-center gap-6">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.tab}
                            onClick={() => setActiveTab(item.tab)}
                            className={`flex flex-col items-center justify-center w-12 h-12 transition-all duration-500 group relative
                                ${activeTab === item.tab
                                    ? 'text-sanctuary-red transform -translate-y-1'
                                    : 'text-sanctuary-inkLight hover:text-sanctuary-ink'
                                }`}
                        >
                            <i className={`fa-solid ${item.img} text-xl transition-colors duration-300`}></i>
                            {activeTab === item.tab && (
                                <div className="absolute -bottom-2 w-1 h-1 bg-sanctuary-red rounded-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* NPC DIALOGUE OVERLAY */}
            <DialogueOverlay
                isOpen={showDialogue}
                speakerName="Scout"
                text="The garden reflects your mind, traveler. Be still."
                onClose={() => setShowDialogue(false)}
            />
        </div >
    );
};

export default App;
