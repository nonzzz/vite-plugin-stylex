install:
	@echo "Setup pnpm package manager..."
	@corepack enable
	pnpm install

build:
	@echo "Building..."
	@pnpm exec rollup --config rollup.config.ts --configPlugin swc3

dev:
	@echo "Starting development server..."
	@pnpm exec rollup --config rollup.config.ts --configPlugin swc3 --watch

test:
	@echo "Running tests..."
	@pnpm exec vitest --dir __tests__

end-to-end-test:
	@echo "Running end-to-end tests..."
	@pnpm exec vitest --dir e2e