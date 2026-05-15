# create-sprint-app

Scaffold a Next.js 15+ project with a "batteries-included" Sprint Stack. Optimized for high-speed development, aesthetics, and the modern web.

## Features
- **Next.js 15+** (App Router, TypeScript, Tailwind)
- **Zustand** - Global state management
- **@tanstack/react-query** - Async data fetching
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **Recharts** - Responsive charts
- **Sonner** - Elegant toast notifications
- **🌓 Dark Mode** - Built-in support with `next-themes`
- **📅 Date Picker** - Integrated `react-day-picker` & `date-fns`
- **📊 Analytics** - Google Analytics ready via `@next/third-parties`

## Usage

```bash
npx create-sprint-app [project-name]
```
*If no project name is provided, it defaults to `sprint-app`.*

## What's Included?
The tool automatically configures a `SprintProvider` to wrap your app with:
- **ThemeProvider**: Automatic light/dark mode switching.
- **QueryClientProvider**: Ready for all your async data needs.
- **Toaster**: Rich-color notifications by default.
- **Google Analytics**: Just add `NEXT_PUBLIC_GA_ID` to your `.env`.

It also injects a high-quality, responsive **Analytics Dashboard** in `src/app/page.tsx` to showcase the full power of the stack immediately.

## Quick Start
```bash
npx create-sprint-app my-pro-app
cd my-pro-app
npm run dev -- --turbo
```

## Feedback & Contribution
We love feedback! If this tool helped you launch your sprint project, consider giving us a star or leaving a review on GitHub:
[https://github.com/mohdasifabid/create-sprint-app](https://github.com/mohdasifabid/create-sprint-app)
