
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Mock Obsidian App and Plugin for standalone development environment
const mockApp = {
  workspace: {
    getActiveFile: () => ({ path: 'Daily/2023-12-25.md' }),
    on: () => { },
    offref: () => { },
  },
  metadataCache: {
    on: () => { },
    offref: () => { },
    getFileCache: () => null,
  },
  vault: {
    getMarkdownFiles: () => [
      { basename: '2023-12-25', path: 'Daily/2023-12-25.md' }
    ],
    read: async () => `
- [x] Morning Meditation #hitpoints
- [ ] Code the plugin #dungeoneering
- [ ] Walk the dog #scout
[Exercise:: 30]
[Coding:: 60]
    `,
    process: async () => { },
    on: () => { },
    offref: () => { },
    getAbstractFileByPath: () => null,
    adapter: {
      read: async () => "{}", // Return empty JSON for settings to prevent parse error
      write: async () => { },
      exists: async () => true, // Say yes to assets existing
      getResourcePath: (path: string) => path // Simple identity for local dev
    }
  }
};

const mockPlugin = {
  app: mockApp,
  manifest: {
    dir: '/mock-dir'
  }
};

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App app={mockApp} plugin={mockPlugin} />
    </React.StrictMode>
  );
} catch (e) {
  console.error("React Failed to Render:", e);
  // Render error to screen so it's visible even if console is closed
  rootElement.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace;">
        <h1>CRITICAL ERROR</h1>
        <p>The game engine failed to start.</p>
        <pre>${e}</pre>
    </div>`;
}
