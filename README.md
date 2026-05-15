# create-weekend-app

Scaffold a Next.js 15+ project with a "batteries-included" Weekend Stack. Optimized for speed, aesthetics, and the modern web.

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
npx create-weekend-app [project-name]
```
*If no project name is provided, it defaults to `weekend-app`.*

## What's Included?
The tool automatically configures a `WeekendProvider` to wrap your app with:
- **ThemeProvider**: Automatic light/dark mode switching.
- **QueryClientProvider**: Ready for all your async data needs.
- **Toaster**: Rich-color notifications by default.
- **Google Analytics**: Just add `NEXT_PUBLIC_GA_ID` to your `.env`.

It also injects a high-quality, responsive **Analytics Dashboard** in `src/app/page.tsx` to showcase the full power of the stack immediately.

## Quick Start
```bash
npx create-weekend-app my-pro-app
cd my-pro-app
npm run dev -- --turbo
```
