#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { Command } = require('commander');

const program = new Command();

program
  .name('create-weekend-app')
  .description('Scaffold a Next.js project with the Weekend Stack')
  .argument('[project-name]', 'Name of the project', 'weekend-app')
  .action(async (projectName) => {
    const projectPath = path.join(process.cwd(), projectName);

    console.log(chalk.blue(`\n🚀 Initializing Weekend Stack project: ${chalk.bold(projectName)}...`));

    try {
      // 1. Run create-next-app
      console.log(chalk.cyan('📦 Running create-next-app...'));
      execSync(
        `npx create-next-app@latest ${projectName} --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`,
        { stdio: 'inherit' }
      );

      process.chdir(projectPath);

      // 2. Install Dependencies
      console.log(chalk.cyan('\n🛠️ Installing Weekend Stack dependencies...'));
      const dependencies = [
        'zustand',
        '@tanstack/react-query',
        'lucide-react',
        'framer-motion',
        'recharts',
        'sonner',
        'clsx',
        'tailwind-merge'
      ];
      execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });

      // 3. File Injection
      console.log(chalk.cyan('\n🏗️ Injecting Weekend Stack components...'));

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

      // Create WeekendProvider
      const providerContent = `'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState } from 'react';

export function WeekendProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
`;
      fs.writeFileSync(path.join('src', 'components', 'WeekendProvider.tsx'), providerContent);

      // Update Layout
      const layoutPath = path.join('src', 'app', 'layout.tsx');
      let layoutContent = fs.readFileSync(layoutPath, 'utf8');
      
      // Inject Provider
      layoutContent = layoutContent.replace(
        "import \"./globals.css\";",
        "import \"./globals.css\";\nimport { WeekendProvider } from \"@/components/WeekendProvider\";"
      );
      layoutContent = layoutContent.replace(
        "{children}",
        "<WeekendProvider>{children}</WeekendProvider>"
      );
      fs.writeFileSync(layoutPath, layoutContent);

      // Overwrite Page
      const pageContent = `'use client';

import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, RotateCcw, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useEffect } from 'react';

export default function Home() {
  const { count, history, increment, decrement, reset } = useStore();

  useEffect(() => {
    if (count !== 0 && count % 10 === 0) {
      toast.success(\`Milestone! Reached \${count}\`, {
        description: "You're making great progress!",
      });
    }
  }, [count]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 p-8 md:p-24 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"
          >
            Weekend Dashboard
          </motion.h1>
          <p className="text-neutral-400">Real-time counter analytics with the Weekend Stack.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Counter Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="md:col-span-1 bg-neutral-900 border border-neutral-800 rounded-2xl p-8 flex flex-col items-center justify-center space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 opacity-10">
              <Activity size={80} />
            </div>
            
            <span className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Active Counter</span>
            
            <AnimatePresence mode="wait">
              <motion.span 
                key={count}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="text-7xl font-black tabular-nums"
              >
                {count}
              </motion.span>
            </AnimatePresence>

            <div className="flex gap-4">
              <button 
                onClick={decrement}
                className="p-4 bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors group"
              >
                <Minus className="group-active:scale-90 transition-transform" />
              </button>
              <button 
                onClick={reset}
                className="p-4 bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors group"
              >
                <RotateCcw className="group-active:rotate-180 transition-transform duration-500" />
              </button>
              <button 
                onClick={increment}
                className="p-4 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors group"
              >
                <Plus className="group-active:scale-125 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Analytics Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-8 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-400" />
                <h2 className="text-lg font-semibold">Activity Trend</h2>
              </div>
              <BarChart3 size={20} className="text-neutral-500" />
            </div>

            <div className="h-[240px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#525252" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#525252" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#171717', 
                      borderColor: '#262626',
                      borderRadius: '12px',
                      color: '#fafafa'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Footer Tech Stack */}
        <footer className="pt-12 border-t border-neutral-800 flex flex-wrap gap-8 justify-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Next.js 15</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Zustand</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">React Query</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Framer Motion</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Recharts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Lucide</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Sonner</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
`;
      fs.writeFileSync(path.join('src', 'app', 'page.tsx'), pageContent);

      console.log(chalk.green(`\n✅ Project ${projectName} created successfully!`));
      console.log(chalk.white(`\nNext steps:`));
      console.log(chalk.cyan(`  cd ${projectName}`));
      console.log(chalk.cyan(`  npm run dev\n`));

    } catch (error) {
      console.error(chalk.red('\n❌ Error creating project:'), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
