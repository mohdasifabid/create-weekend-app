#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { Command } = require('commander');

const program = new Command();

program
  .name('create-sprint-app')
  .description('Scaffold a Next.js project with the Sprint Stack')
  .argument('[project-name]', 'Name of the project', 'sprint-app')
  .action(async (projectName) => {
    const projectPath = path.join(process.cwd(), projectName);

    console.log(chalk.blue(`\n🚀 Initializing Sprint Stack project: ${chalk.bold(projectName)}...`));

    try {
      // 1. Run create-next-app
      console.log(chalk.cyan('📦 Running create-next-app...'));
      execSync(
        `npx create-next-app@latest ${projectName} --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`,
        { stdio: 'inherit' }
      );

      process.chdir(projectPath);

      // 2. Install Dependencies
      console.log(chalk.cyan('\n🛠️ Installing Sprint Stack dependencies...'));
      const dependencies = [
        'zustand',
        '@tanstack/react-query',
        'lucide-react',
        'framer-motion',
        'recharts',
        'sonner',
        'clsx',
        'tailwind-merge',
        'next-themes',
        'react-day-picker',
        'date-fns',
        '@next/third-parties'
      ];
      execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });

      // 3. File Injection
      console.log(chalk.cyan('\n🏗️ Injecting Sprint Stack components...'));

      // Ensure directories exist
      fs.ensureDirSync(path.join('src', 'lib'));
      fs.ensureDirSync(path.join('src', 'components'));

      // Create Zustand Store
      const storeContent = `import { create } from 'zustand';

interface CounterState {
  count: number;
  history: { time: string; value: number }[];
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useStore = create<CounterState>((set) => ({
  count: 0,
  history: [{ time: new Date().toLocaleTimeString(), value: 0 }],
  increment: () => set((state) => {
    const newCount = state.count + 1;
    return {
      count: newCount,
      history: [...state.history, { time: new Date().toLocaleTimeString(), value: newCount }].slice(-10)
    };
  }),
  decrement: () => set((state) => {
    const newCount = state.count - 1;
    return {
      count: newCount,
      history: [...state.history, { time: new Date().toLocaleTimeString(), value: newCount }].slice(-10)
    };
  }),
  reset: () => set({ 
    count: 0, 
    history: [{ time: new Date().toLocaleTimeString(), value: 0 }] 
  }),
}));
`;
      fs.writeFileSync(path.join('src', 'lib', 'store.ts'), storeContent);

      // Create SprintProvider
      const providerContent = `'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { GoogleAnalytics } from '@next/third-parties/google';

export function SprintProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Replace with your GA Measurement ID
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {mounted && (
          <>
            {children}
            <Toaster position="top-center" richColors />
            {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
          </>
        )}
        {!mounted && <div style={{ visibility: 'hidden' }}>{children}</div>}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
`;
      fs.writeFileSync(path.join('src', 'components', 'SprintProvider.tsx'), providerContent);

      // Update Layout
      const layoutPath = path.join('src', 'app', 'layout.tsx');
      let layoutContent = fs.readFileSync(layoutPath, 'utf8');
      
      // Inject Provider
      if (!layoutContent.includes('SprintProvider')) {
        layoutContent = layoutContent.replace(
          /import type { Metadata }/g,
          'import { SprintProvider } from "@/components/SprintProvider";\nimport type { Metadata }'
        );
        layoutContent = layoutContent.replace(
          /\{children\}/,
          '<SprintProvider>{children}</SprintProvider>'
        );
        // Add suppressHydrationWarning to html tag for next-themes
        layoutContent = layoutContent.replace(
          /<html lang="en">/,
          '<html lang="en" suppressHydrationWarning>'
        );
        fs.writeFileSync(layoutPath, layoutContent);
      }

      // Update Tailwind Config for dark mode
      const tailwindPath = path.join('tailwind.config.ts');
      if (fs.existsSync(tailwindPath)) {
        let tailwindContent = fs.readFileSync(tailwindPath, 'utf8');
        if (!tailwindContent.includes('darkMode')) {
          tailwindContent = tailwindContent.replace(
            /content: \[/,
            'darkMode: "class",\n  content: ['
          );
          fs.writeFileSync(tailwindPath, tailwindContent);
        }
      }

      // Add simple .env.example
      fs.writeFileSync('.env.example', 'NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX\n');

      // Overwrite Page
      const pageContent = `'use client';

import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Minus, RotateCcw, TrendingUp, Activity, BarChart3, 
  Sun, Moon, Calendar as CalendarIcon, LayoutGrid 
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

export default function Home() {
  const { count, history, increment, decrement, reset } = useStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (count !== 0 && count % 10 === 0) {
      toast.success(\`Milestone! Reached \${count}\`, {
        description: "You're making great progress!",
      });
    }
  }, [count]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Navbar */}
        <nav className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="text-white" size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight">Sprint.</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <a href="#" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors">
              <LayoutGrid size={20} />
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black tracking-tighter"
          >
            Insights for your <span className="text-blue-600">Next Big Thing.</span>
          </motion.h1>
          <div className="flex items-center gap-4 text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-2 px-3 py-1 bg-neutral-100 dark:bg-neutral-900 rounded-full text-xs font-medium uppercase tracking-widest">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Analytics
            </div>
            <p className="text-sm">Ready-to-use template for high-speed sprints.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Counter Module */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-center space-y-8 min-h-[400px]"
            >
              <div className="text-center space-y-1">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Global Score</h3>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={count}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="text-8xl font-black tabular-nums block"
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="flex gap-4">
                <button onClick={decrement} className="p-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl hover:shadow-lg transition-all active:scale-95">
                  <Minus size={24} />
                </button>
                <button onClick={reset} className="p-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl hover:shadow-lg transition-all active:scale-95">
                  <RotateCcw size={24} />
                </button>
                <button onClick={increment} className="p-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                  <Plus size={24} />
                </button>
              </div>
            </motion.div>

            {/* Date Picker Module */}
            <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 relative">
              <button 
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700"
              >
                <div className="flex items-center gap-3">
                  <CalendarIcon size={18} className="text-blue-600" />
                  <span className="font-medium">{selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}</span>
                </div>
              </button>

              <AnimatePresence>
                {showCalendar && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl"
                  >
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setShowCalendar(false);
                      }}
                      className="mx-auto"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Visualization Module */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="text-blue-600" /> Activity Stream
                </h2>
                <p className="text-sm text-neutral-500">Visualizing your last 10 interactions</p>
              </div>
              <BarChart3 className="text-neutral-300 dark:text-neutral-700" size={32} />
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1f1f1f' : '#e5e5e5'} vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke={theme === 'dark' ? '#525252' : '#a3a3a3'} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke={theme === 'dark' ? '#525252' : '#a3a3a3'} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#171717' : '#ffffff', 
                      borderColor: theme === 'dark' ? '#262626' : '#e5e5e5',
                      borderRadius: '16px',
                      color: theme === 'dark' ? '#fafafa' : '#171717',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2563eb" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Footer Tech List */}
        <footer className="pt-12 border-t border-neutral-200 dark:border-neutral-800">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 opacity-40 hover:opacity-100 transition-opacity">
            {['Next.js 15', 'Zustand', 'React Query', 'Framer Motion', 'Recharts', 'Day Picker', 'Google Analytics'].map((tech) => (
              <div key={tech} className="text-xs font-bold uppercase tracking-widest text-center py-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                {tech}
              </div>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}
`;
      fs.writeFileSync(path.join('src', 'app', 'page.tsx'), pageContent);

      console.log(chalk.green(`\n✅ Project ${projectName} created successfully with Pro features!`));
      
      console.log(chalk.yellow(`\n🌟 Loved this stack?`));
      console.log(chalk.white(`   If this tool helped you launch your sprint project, consider`));
      console.log(chalk.white(`   giving us a star or leaving a review on GitHub!`));
      console.log(chalk.cyan(`   https://github.com/mohdasifabid/create-sprint-app`));
      
      console.log(chalk.white(`\nNext steps:`));
      console.log(chalk.cyan(`  cd ${projectName}`));
      console.log(chalk.cyan(`  npm run dev -- --turbo\n`));

    } catch (error) {
      console.error(chalk.red('\n❌ Error creating project:'), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
