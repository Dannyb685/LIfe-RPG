#!/bin/bash

# Target directory (Relative path to Obsidian Vault Root based on current location)
# Assumes LIfe-RPG is in: Vault/00. Attachments/06. Antigravity/LIfe-RPG
TARGET_DIR="../../../.obsidian/plugins/life-rpg-obsidian"

echo "Deploying Life-RPG to: $TARGET_DIR"

# Create directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy files
cp main.js "$TARGET_DIR/"
cp manifest.json "$TARGET_DIR/"
cp styles.css "$TARGET_DIR/"
cp -R assets "$TARGET_DIR/"

echo "✅ Deployment Complete!"
echo "👉 Now reload Obsidian (Cmd+R) and enable 'Life RPG' in Settings > Community Plugins."
