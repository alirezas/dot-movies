# Agent Instructions for dot-movies

## Commands
- **Build**: `npm run build` or `pnpm build`
- **Dev**: `npm run dev` or `pnpm dev`
- **Lint**: `npm run lint` or `pnpm lint`
- **Lint fix**: `npm run lint:fix` or `pnpm lint:fix`
- **Format**: `npm run format` or `pnpm format`
- **Type check**: `npm run check` or `pnpm check`

## Code Style
- **TypeScript**: Strict mode enabled, target ES2017
- **Formatting**: Biome (2 spaces, 80 line width, double quotes, semicolons)
- **Imports**: Use `@/` alias for relative imports, `import type` for types
- **Naming**: PascalCase for components/interfaces, camelCase for functions/variables
- **Error handling**: Use try/catch, avoid empty catch blocks when possible
- **JSX**: Double quotes, bracket spacing, trailing commas ES5
- **Types**: Avoid `any`, use proper TypeScript types
- **Components**: Functional components with hooks, client directives when needed