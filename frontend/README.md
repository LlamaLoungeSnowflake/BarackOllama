# BarackOllama Frontend

This is the Next.js 14 frontend for the BarackOllama AI-powered resume generator.

## Prerequisites

- Node.js 18+
- npm or yarn

## Getting Started

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` to point to your backend:

```
COPILOTKIT_BACKEND_URL=http://localhost:8000/copilotkit
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
npm start
```

## What it does

The frontend provides a two-panel layout:

- **Left panel**: Input form (GitHub URL, LinkedIn URL, Job Posting URL) + real-time agent progress log
- **Right panel**: Tabbed output (Resume, GitHub README, Portfolio, Similar Jobs)

## Architecture

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **CopilotKit** (`@copilotkit/react-core`) for AG-UI real-time agent communication
- **TanStack Table** for job suggestions and skills match tables
- **react-markdown** for rendering the generated GitHub README
- **IndexedDB** (via `idb`) for caching LinkedIn/GitHub data between sessions

## Mock mode

The `useResumeAgent` hook currently runs in mock mode, simulating the agent steps with delays. Once the backend AG-UI endpoint is ready at `http://localhost:8000/copilotkit`, update `src/hooks/useResumeAgent.ts` to use the real CopilotKit integration.

## Project structure

```
src/
├── app/           # Next.js App Router pages + layout
├── components/    # UI components
├── hooks/         # Custom React hooks
├── lib/           # Utility libraries (IndexedDB)
└── types/         # TypeScript type definitions
```
