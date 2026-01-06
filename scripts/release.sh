#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# Check if git working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    print_error "Error: Git working directory is not clean. Please commit or stash changes first."
    exit 1
fi

# Check if on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "Warning: You are not on the main branch (current: $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Prompt for tag name
read -p "Enter tag name (e.g., 1.0.0 or v1.0.0): " TAG

if [ -z "$TAG" ]; then
    print_error "Error: Tag name cannot be empty"
    exit 1
fi

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
    print_error "Error: Tag '$TAG' already exists"
    exit 1
fi

print_info "Creating release: $TAG"

# Update package.json version
print_info "Updating package.json version..."
npm run release:update-version "$TAG"

# Update package-lock.json by running npm install
print_info "Updating package-lock.json..."
npm install --package-lock-only

# Generate changelog
print_info "Generating changelog..."
npm run release:changelog

# Show changes
print_info "Changes to be committed:"
git diff package.json package-lock.json CHANGELOG.md

# Confirm before committing
read -p "Commit these changes? (Y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    print_warning "Release cancelled"
    git restore package.json package-lock.json CHANGELOG.md 2>/dev/null || true
    exit 1
fi

# Commit changes
print_info "Committing release changes..."
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): $TAG"

# Create tag
print_info "Creating tag $TAG..."
git tag "$TAG"

# Push commit and tag
print_info "Pushing commit and tag to origin..."
git push origin "$CURRENT_BRANCH"
git push origin "$TAG"

print_info "✓ Release $TAG created and pushed successfully!"
print_info "  - Commit: $(git rev-parse HEAD)"
print_info "  - Tag: $TAG"
print_info "  - Deployment will start automatically"
