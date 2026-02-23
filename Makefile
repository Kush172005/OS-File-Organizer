# File Organizer - OS Project
# Use: make help, make install, make run, make build, make test

.PHONY: help install run run-backend run-frontend build test clean

help:
	@echo "File Organizer - Build & Run"
	@echo "  make install     - Install backend + frontend dependencies"
	@echo "  make run-backend - Start backend server (port 3001)"
	@echo "  make run-frontend - Start frontend dev server (port 5173)"
	@echo "  make run        - Start both (backend in background)"
	@echo "  make build      - Build frontend for production"
	@echo "  make test       - Run API test script (backend must be running)"
	@echo "  make clean      - Remove node_modules and build artifacts"

install:
	cd backend && npm install
	cd frontend && npm install

run-backend:
	cd backend && node server.js

run-frontend:
	cd frontend && npm run dev

run: install
	@echo "Starting backend..."
	@cd backend && node server.js & \
	echo "Starting frontend..."; \
	cd frontend && npm run dev

build:
	cd frontend && npm run build

test:
	@echo "Run: ./backend/test-api.sh (ensure backend is running on 3001)"
	@cd backend && bash test-api.sh

clean:
	rm -rf backend/node_modules frontend/node_modules frontend/dist
