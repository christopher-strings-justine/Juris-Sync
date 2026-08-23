#!/usr/bin/env bash
# ==============================================================================
# JurisSync Localhost Runner
# Starts both FastAPI Backend (port 8000) and Next.js Frontend (port 3000)
# ==============================================================================

set -e

# Color definitions
BOLD='\033[1m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BOLD}${CYAN}"
echo "  ╔═══════════════════════════════════════════════════════╗"
echo "  ║                   JURIS-SYNC PLATFORM                 ║"
echo "  ║        Legal Contradiction Detection & DPDP Audit     ║"
echo "  ╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"

# Cleanup handler on exit or Ctrl+C
cleanup() {
  echo -e "\n${YELLOW}Shutting down JurisSync services...${NC}"
  if [ -n "${BACKEND_PID}" ] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
    kill "${BACKEND_PID}" 2>/dev/null || true
  fi
  if [ -n "${FRONTEND_PID}" ] && kill -0 "${FRONTEND_PID}" 2>/dev/null; then
    kill "${FRONTEND_PID}" 2>/dev/null || true
  fi
  wait 2>/dev/null || true
  echo -e "${GREEN}Services stopped successfully.${NC}"
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Check Python virtual environment & backend dependencies
echo -e "${BOLD}1. Checking Backend Setup...${NC}"
cd "${BACKEND_DIR}"

if [ -f ".venv/bin/python" ]; then
  PYTHON_EXE=".venv/bin/python"
  UVICORN_EXE=".venv/bin/uvicorn"
elif command -v python3 >/dev/null 2>&1; then
  if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment in backend/.venv...${NC}"
    python3 -m venv .venv
    .venv/bin/pip install --upgrade pip
    .venv/bin/pip install -r requirements.txt
  fi
  PYTHON_EXE=".venv/bin/python"
  UVICORN_EXE=".venv/bin/uvicorn"
else
  echo -e "${RED}Error: python3 is not installed. Please install Python 3.10+${NC}"
  exit 1
fi

# Ensure public directory exists
mkdir -p "${BACKEND_DIR}/public"

# 2. Check Node / Frontend dependencies
echo -e "${BOLD}2. Checking Frontend Setup...${NC}"
cd "${FRONTEND_DIR}"

# Determine node / npm / pnpm runner
if [ -d "${ROOT_DIR}/../.local/share/pnpm/bin" ]; then
  export PATH="${ROOT_DIR}/../.local/share/pnpm/bin:${ROOT_DIR}/../.local/bin:$PATH"
fi

if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing frontend dependencies with npm...${NC}"
  npm install
fi

# 3. Start Backend Server
echo -e "\n${BOLD}3. Starting FastAPI Backend on http://localhost:8000 ...${NC}"
cd "${BACKEND_DIR}"
${UVICORN_EXE} main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to be ready
echo -n "Waiting for backend to initialize..."
for i in {1..20}; do
  if curl -s http://127.0.0.1:8000/api/health >/dev/null 2>&1 || curl -s http://localhost:8000/api/health >/dev/null 2>&1; then
    echo -e " ${GREEN}Ready!${NC}"
    break
  fi
  sleep 0.5
  echo -n "."
done

# 4. Start Frontend Server
echo -e "\n${BOLD}4. Starting Next.js Frontend on http://localhost:3000 ...${NC}"
cd "${FRONTEND_DIR}"
npm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}${BOLD}✓ JurisSync is running!${NC}"
echo -e "  ➜ ${BOLD}Frontend App:${NC}      ${CYAN}http://localhost:3000${NC}"
echo -e "  ➜ ${BOLD}Dashboard Workspace:${NC} ${CYAN}http://localhost:3000/dashboard${NC}"
echo -e "  ➜ ${BOLD}Backend API Docs:${NC}   ${CYAN}http://localhost:8000/docs${NC}"
echo -e "  ➜ ${BOLD}API Health:${NC}         ${CYAN}http://localhost:8000/api/health${NC}"
echo -e "\n${YELLOW}Press Ctrl+C to stop all servers.${NC}\n"

# Wait for background processes
wait "${BACKEND_PID}" "${FRONTEND_PID}"
