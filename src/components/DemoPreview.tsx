import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, History, Home, PlusCircle, TrendingUp, UserCog, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Dados fake inspirados no FinancialChart real
const CHART_DATA = [
  { mes: 'Jan', Rendimento: 4500, Despesas: 1200, Pendentes: 200, Disponível: 3100 },
  { mes: 'Fev', Rendimento: 4500, Despesas: 980,  Pendentes: 150, Disponível: 3370 },
  { mes: 'Mar', Rendimento: 5300, Despesas: 1580, Pendentes: 250, Disponível: 3470 },
];

const CHART_DATA_UPDATED = [
  { mes: 'Jan', Rendimento: 4500, Despesas: 1200, Pendentes: 200, Disponível: 3100 },
  { mes: 'Fev', Rendimento: 4500, Despesas: 980,  Pendentes: 150, Disponível: 3370 },
  { mes: 'Mar', Rendimento: 5300, Despesas: 1665, Pendentes: 250, Disponível: 3385 },
];

const NAV_ITEMS = [
  { label: 'Dashboard',  icon: Home,     active: true  },
  { label: 'Despesas',   icon: BarChart3, active: false },
  { label: 'Rendimento', icon: TrendingUp,active: false },
  { label: 'Histórico',  icon: History,  active: false },
  { label: 'Usuário',    icon: UserCog,  active: false },
];

const TYPING_LABEL = 'Jantar fora';
const TYPING_VALUE = '85';

type Step = 'idle' | 'hover-btn' | 'modal-open' | 'typing-label' | 'typing-value' | 'submitting' | 'submitted';

export function DemoPreview() {
  const [step, setStep]             = useState<Step>('idle');
  const [typedLabel, setTypedLabel] = useState('');
  const [typedValue, setTypedValue] = useState('');
  const [chartData, setChartData]   = useState(CHART_DATA);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => { const id = setTimeout(fn, ms); timeouts.push(id); };

    const run = () => {
      setStep('idle');
      setTypedLabel('');
      setTypedValue('');
      setChartData(CHART_DATA);

      t(() => setStep('hover-btn'), 1500);
      t(() => setStep('modal-open'), 2300);
      t(() => setStep('typing-label'), 3000);

      TYPING_LABEL.split('').forEach((_, i) =>
        t(() => setTypedLabel(TYPING_LABEL.slice(0, i + 1)), 3100 + i * 80)
      );

      const afterLabel = 3100 + TYPING_LABEL.length * 80 + 400;
      t(() => setStep('typing-value'), afterLabel);
      TYPING_VALUE.split('').forEach((_, i) =>
        t(() => setTypedValue(TYPING_VALUE.slice(0, i + 1)), afterLabel + 100 + i * 150)
      );

      const afterValue = afterLabel + 100 + TYPING_VALUE.length * 150 + 500;
      t(() => setStep('submitting'), afterValue);
      t(() => { setStep('submitted'); setChartData(CHART_DATA_UPDATED); }, afterValue + 700);
      t(() => run(), afterValue + 4500);
    };

    run();
    return () => timeouts.forEach(clearTimeout);
  }, []);

  const isModalOpen = ['modal-open', 'typing-label', 'typing-value', 'submitting'].includes(step);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-border bg-background relative flex w-full overflow-hidden rounded-2xl border shadow-xl"
      style={{ minHeight: 380 }}
    >
      {/* Sidebar */}
      <div className="border-border bg-sidebar flex w-14 flex-col items-center gap-1 border-r py-4 md:w-44 md:items-start md:px-3">
        <div className="mb-4 flex items-center gap-2 px-1">
          <div className="bg-primary flex size-7 items-center justify-center rounded-full">
            <TrendingUp className="size-3.5 text-white" />
          </div>
          <span className="hidden text-xs font-semibold md:block">Task's Finance</span>
        </div>

        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            className={`flex w-full items-center gap-2 rounded-full px-2 py-1.5 text-xs transition-colors ${
              item.active
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-muted-foreground'
            }`}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="hidden md:block">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold">Visão Geral</p>
            <p className="text-muted-foreground text-[10px]">Março de 2026</p>
          </div>
          <motion.button
            animate={step === 'hover-btn' ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-primary text-primary-foreground flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium"
          >
            <PlusCircle className="size-3" />
            <span className="hidden md:block">Adicionar</span>
          </motion.button>
        </div>

        {/* AreaChart — replica o FinancialChart real */}
        <div className="border-border overflow-hidden rounded-xl border p-3">
          <div className="text-primary mb-2 flex items-center gap-1.5 text-xs font-semibold">
            <TrendingUp className="size-3.5" />
            Evolução Financeira 2026
          </div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dg-rend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dg-desp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dg-pend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dg-disp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.07} />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 9, opacity: 0.5 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, opacity: 0.4 }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} width={36} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                <Area type="monotone" dataKey="Rendimento" stroke="#3b82f6" strokeWidth={1.5} fill="url(#dg-rend)" dot={false} />
                <Area type="monotone" dataKey="Despesas"   stroke="#ef4444" strokeWidth={1.5} fill="url(#dg-desp)" dot={false} />
                <Area type="monotone" dataKey="Pendentes"  stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" fill="url(#dg-pend)" dot={false} />
                <Area type="monotone" dataKey="Disponível" stroke="#10b981" strokeWidth={1.5} fill="url(#dg-disp)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dicas de Economia — replica o bloco real */}
        <div className="border-border rounded-xl border p-3">
          <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold text-amber-500">
            💡 Dicas de Economia
          </p>
          <ul className="flex flex-col gap-1">
            {['Reduza gastos com alimentação fora', 'Reserve 20% do salário todo mês'].map((d) => (
              <li key={d} className="text-muted-foreground flex items-start gap-1.5 text-[10px]">
                <span className="mt-0.5 text-emerald-500">✓</span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal de nova despesa */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-background border-border mx-4 w-full max-w-xs rounded-xl border p-4 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold">Nova despesa</span>
                <X className="text-muted-foreground size-4" />
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs">Descrição</label>
                  <div className="border-border flex items-center rounded-lg border px-3 py-2 text-sm">
                    <span>{typedLabel}</span>
                    {(step === 'typing-label' || step === 'modal-open') && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="ml-0.5 inline-block h-4 w-px bg-current"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block text-xs">Valor (R$)</label>
                  <div className="border-border flex items-center rounded-lg border px-3 py-2 text-sm">
                    <span>{typedValue}</span>
                    {step === 'typing-value' && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="ml-0.5 inline-block h-4 w-px bg-current"
                      />
                    )}
                  </div>
                </div>

                <motion.button
                  animate={step === 'submitting' ? { scale: 0.97, opacity: 0.7 } : { scale: 1, opacity: 1 }}
                  className="bg-primary text-primary-foreground w-full rounded-lg py-2 text-sm font-semibold"
                >
                  {step === 'submitting' ? 'Salvando...' : 'Salvar'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
