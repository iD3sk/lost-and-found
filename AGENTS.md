# Repository Guidelines

## Project Structure

- `app/` contains Next.js App Router pages, the root layout, and `globals.css`. Report creation lives in `app/reports/new/`, and report details use the dynamic route `app/reports/[id]/`.
- `components/` holds shared UI such as `ReportCard.tsx` and `ReportForm.tsx`. `lib/mock-data.ts` supplies sample reports and notifications, and `lib/report-form.ts` holds form types and validation rules.
- `public/` contains static assets. See [README.md](README.md) for the planned database schema and `/api/v1` endpoints.

## Build and Development

Run these commands from the repository root.

- `npm ci` installs the dependencies pinned in `package-lock.json`.
- `npm run dev` starts the development server at `http://localhost:3000`.
- `npm run lint` runs ESLint with the Next.js Core Web Vitals and TypeScript rules.
- `npm run build` compiles the production app. Run `npm start` after a successful build to serve it locally.

## Coding Style

Follow existing TypeScript and TSX conventions with two-space indentation and double quotes. Use PascalCase for shared component files, camelCase for variables and functions, and kebab-case for route folders such as `my-reports`. Use the `@/` alias for imports across directories. Reuse shared components and the Tailwind color tokens in `app/globals.css`.

## Verification

The repository currently has no automated test suite or coverage threshold. Run lint and build before opening a pull request, then exercise the affected flow locally. For report changes, check both lost and found forms, required-field validation, and relevant navigation at a mobile viewport.

## Commits and Pull Requests

Git history uses short, informal summaries. Use a specific subject such as `Validate found report photos`. In the pull request, summarize the change, list the checks you ran, link the related issue if one exists, and include screenshots for visible UI changes.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
