
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
    getActiveFile: () => null,
  },
  vault: {
    getMarkdownFiles: () => [],
    read: async () => "",
    process: async () => {},
    on: () => {},
    offref: () => {},
    getAbstractFileByPath: () => null,
    adapter: {
      read: async () => "{}",
      write: async () => {},
      exists: async () => false
    }
  }
};

const mockPlugin = {
  app: mockApp
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
