#!/bin/bash

# Ensure submodule is up to date
git submodule update --init --recursive

# Create the route group folder if it doesn't exist
mkdir -p app/\(brainstorm-chat\)

# Copy necessary files
cp -R brainstorm-chat-source/app/* app/\(brainstorm-chat\)/

# Remove unnecessary files (adjust as needed)
rm -rf app/\(brainstorm-chat\)/api app/\(brainstorm-chat\)/layout.tsx

# Copy components
mkdir -p app/\(brainstorm-chat\)/components
cp -R brainstorm-chat-source/components/* app/\(brainstorm-chat\)/components/

# Copy lib folder
mkdir -p app/\(brainstorm-chat\)/lib
cp -R brainstorm-chat-source/lib/* app/\(brainstorm-chat\)/lib/

echo "Brainstorm chat app updated successfully!"