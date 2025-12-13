#!/bin/bash

# Obsidian Kanban E2E Test Runner
# This script runs the Playwright tests in a Docker container with proper Electron support

set -e

echo "🚀 Obsidian Kanban E2E Test Runner"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker daemon is not running${NC}"
    echo "Please start Docker first"
    exit 1
fi

# Parse command line arguments
REBUILD=false
HEADED=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --rebuild)
            REBUILD=true
            shift
            ;;
        --headed)
            HEADED=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --rebuild    Rebuild the Docker image before running tests"
            echo "  --headed     Run tests in headed mode (not yet supported in Docker)"
            echo "  --help       Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Build or rebuild the Docker image
if [ "$REBUILD" = true ] || ! docker images | grep -q "obsidian-kanban-tests"; then
    echo -e "${YELLOW}Building Docker image...${NC}"
    docker compose -f docker-compose.test.yml build
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
    echo ""
fi

# Run the tests
echo -e "${YELLOW}Running E2E tests in Docker container...${NC}"
echo ""

docker compose -f docker-compose.test.yml run --rm playwright-tests

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Tests completed!${NC}"
    echo ""
    echo "Test results are available in:"
    echo "  - test-results/      (screenshots and traces)"
    echo "  - playwright-report/ (HTML report)"
    echo ""
    echo "To view the HTML report, run:"
    echo "  npx playwright show-report"
else
    echo ""
    echo -e "${RED}✗ Tests failed${NC}"
    echo ""
    echo "Check the output above for details"
    echo "Screenshots and traces are in ./test-results/"
    exit 1
fi
