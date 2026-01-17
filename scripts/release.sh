#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}$1${NC}"
}

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "Error: GitHub CLI (gh) is not installed."
    print_info "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated with GitHub
if ! gh auth status &> /dev/null; then
    print_error "Error: Not authenticated with GitHub CLI."
    print_info "Run: gh auth login"
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

# Check if git working directory is clean before pull
if [ -n "$(git status --porcelain)" ]; then
    print_error "Error: Git working directory is not clean. Please commit or stash changes first."
    exit 1
fi

# Pull latest changes
print_step "Pulling latest changes from origin..."
git pull origin "$CURRENT_BRANCH"

# Check if git working directory is still clean after pull
if [ -n "$(git status --porcelain)" ]; then
    print_error "Error: Git working directory is not clean after pulling. Please resolve conflicts or issues first."
    git status
    exit 1
fi

# Prompt for tag name
echo ""
print_step "Enter the release version:"
read -p "Tag name (e.g., 1.0.0 or v1.0.0): " TAG

if [ -z "$TAG" ]; then
    print_error "Error: Tag name cannot be empty"
    exit 1
fi

# Check if tag already exists locally or remotely
if git rev-parse "$TAG" >/dev/null 2>&1; then
    print_error "Error: Tag '$TAG' already exists locally"
    exit 1
fi

if git ls-remote --tags origin | grep -q "refs/tags/$TAG$"; then
    print_error "Error: Tag '$TAG' already exists on remote"
    exit 1
fi

echo ""
print_info "Release will be created with tag: $TAG"
print_warning "The GitHub workflow will:"
print_warning "  1. Run all CI checks (lint, format, types, validation, build)"
print_warning "  2. Update package.json version and generate CHANGELOG.md"
print_warning "  3. Create and push the tag"
print_warning "  4. Create GitHub release"
print_warning "  5. Trigger deployment to GitHub Pages"
echo ""

# Confirm before triggering
read -p "Trigger release workflow on GitHub? (Y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    print_warning "Release cancelled"
    exit 1
fi

# Trigger GitHub workflow
print_step "Triggering release workflow on GitHub..."
gh workflow run release.yml -f tag="$TAG"

echo ""
print_info "✓ Release workflow triggered successfully!"
print_info "  - Tag: $TAG"
print_info "  - Workflow: release.yml"
echo ""
print_step "Monitor the workflow progress:"
print_info "  gh run watch"
print_info "  or visit: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"
echo ""
