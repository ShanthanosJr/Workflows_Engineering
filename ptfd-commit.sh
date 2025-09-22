#!/bin/bash

# Script to commit only PTFD changes to avoid conflicts with other team members

echo "=== PTFD-Only Commit Script ==="

# Check if there are any changes in the PTFD directory
cd /Users/kavishka_r/Documents/ITP/SCWMS

# Show current PTFD changes
echo "Current PTFD changes:"
git status PTFD --porcelain

# Add only PTFD changes
echo "Adding PTFD changes..."
git add PTFD

# Commit with a standard message
if [ $# -eq 0 ]; then
    echo "Please provide a commit message"
    echo "Usage: ./ptfd-commit.sh \"Your commit message\""
    exit 1
else
    echo "Committing with message: $1"
    git commit -m "$1"
    echo "PTFD changes committed successfully!"
    echo "Remember to push with: git push origin main"
fi