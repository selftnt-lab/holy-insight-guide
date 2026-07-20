import PageSeo from "@/components/PageSeo";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, Check, ChevronRight, Loader2, Plus, Trash2, BookOpen, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import SacredDivider from "@/components/SacredDivider";
import CreatePlanDialog from "@/components/CreatePlanDialog";
import {
  fetchPlans,
  fetchUserPlans,
  enrollInPlan,
  unenroll,
  markDayComplete,
  buildPlanDays,
  type ReadingPlan,
  type UserPlanProgress,
} from "@/lib/reading-plans";

const categoryLabel = (c: string) =>
  c === "completo" ? "Cânon completo" : c === "tematico" ? "Temático" : c === "devocional" ? "Devocional" : "Plano";

const PlanCard = ({
  plan,
  progress,
  onEnroll,
  onLeave,
  onMarkToday,
  busyId,
}: {
  plan: ReadingPlan;
  progress?: UserPlanProgress;
  onEnroll: (planId: string) => void;
  onLeave: (progressId: string) => void;
  onMarkToday: (plan: ReadingPlan, progress: UserPlanProgress) => void;
  busyId: string | null;
}) => {
  const navigate = useNavigate();
  const enrolled = !!progress;
  const days = useMemo(() => (enrolled ? buildPlanDays(plan) : null), [plan, enrolled]);
  const completed = progress?.completed_days.length ?? 0;
  const pct = Math.round((completed / plan.duration_days) * 100);
  const todayDay = progress?.current_day ?? 1;
  const todayRefs = days?.find((d) => d.day === todayDay)?.refs ?? [];
  const alreadyToday = progress?.completed_days.includes(todayDay) ?? false;

  return (
    <Card className="overflow-hidden rounded-2xl border p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wider">
            {categoryLabel(plan.category)}
          </Badge>
          <h3 className="mt-2 font-serif text-lg font-semibold text-foreground">{plan.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
        </div>
        <div className="flex flex-col items-end">
          <Calendar size={16} className="text-muted-foreground" />
          <span className="mt-1 text-xs text-muted-foreground">{plan.duration_days} dias</span>
        </div>
      </div>

      {enrolled && progress && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Dia {todayDay} de {plan.duration_days}
            </span>
            <span className="font-medium text-foreground">{pct}%</span>
          </div>
          <Progress value={pct} className="mt-2 h-2" />

          {todayRefs.length > 0 && (
            <div className="mt-3 rounded-xl bg-muted/40 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Leitura de hoje
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {todayRefs.map((r, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      navigate(`/reading?book=${encodeURIComponent(r.book)}&chapter=${r.chapter}`)
                    }
                    className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <BookOpen size={12} /> {r.name} {r.chapter}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => onMarkToday(plan, progress)}
              disabled={alreadyToday || busyId === progress.id}
              className="flex-1 rounded-full"
            >
              {busyId === progress.id ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : (
                <Check size={14} className="mr-1" />
              )}
              {alreadyToday ? "Dia concluído" : "Marcar dia como lido"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onLeave(progress.id)}
              className="rounded-full text-muted-foreground hover:text-destructive"
              aria-label="Sair do plano"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      )}

      {!enrolled && (
        <Button
          onClick={() => onEnroll(plan.id)}
          disabled={busyId === plan.id}
          variant="outline"
          size="sm"
          className="mt-4 w-full rounded-full"
        >
          {busyId === plan.id ? (
            <Loader2 size={14} className="mr-1 animate-spin" />
          ) : (
            <Plus size={14} className="mr-1" />
          )}
          Começar este plano
        </Button>
      )}
    </Card>
  );
};

const Plans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [userPlans, setUserPlans] = useState<UserPlanProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  const reload = async () => {
    if (!user) return;
    const [p, u] = await Promise.all([fetchPlans(user.id), fetchUserPlans(user.id)]);
    setPlans(p);
    setUserPlans(u);
    setLoading(false);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const progressByPlan = useMemo(() => {
    const m = new Map<string, UserPlanProgress>();
    for (const up of userPlans) m.set(up.plan_id, up);
    return m;
  }, [userPlans]);

  const handleEnroll = async (planId: string) => {
    if (!user) return;
    setBusyId(planId);
    await enrollInPlan(user.id, planId);
    await reload();
    setBusyId(null);
    toast({ title: "Plano iniciado", description: "Sua jornada começa hoje." });
  };

  const handleLeave = async (progressId: string) => {
    setBusyId(progressId);
    await unenroll(progressId);
    await reload();
    setBusyId(null);
  };

  const handleMarkToday = async (plan: ReadingPlan, progress: UserPlanProgress) => {
    setBusyId(progress.id);
    const updated = await markDayComplete(user!.id, progress, progress.current_day, plan.duration_days);
    setUserPlans((arr) => arr.map((p) => (p.id === progress.id ? updated : p)));
    setBusyId(null);
    if (!updated.is_active) {
      toast({ title: "Plano concluído!", description: `Você completou ${plan.name}.` });
    }
  };

  const active = plans.filter((p) => progressByPlan.has(p.id));
  const available = plans.filter((p) => !progressByPlan.has(p.id));

  return (
    <div className="min-h-screen pb-32">
      <PageSeo title="Planos de Leitura — RC Bible" description="Escolha ou crie planos de leitura bíblica personalizados, acompanhe seu progresso e mantenha a constância diária." path="/plans" />
      <div className="mx-auto max-w-lg px-5 pt-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Planos de Leitura
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-foreground">
            Caminhe pelas Escrituras
            <br />
            <span className="text-primary">um dia de cada vez</span>
          </h1>
          <SacredDivider className="mt-5" />

          <Button
            onClick={() => setCreateOpen(true)}
            variant="outline"
            className="mt-5 w-full justify-start gap-2 rounded-2xl border-accent/30 bg-accent/5 py-6 text-left hover:bg-accent/10"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-accent">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Criar plano personalizado</p>
              <p className="text-xs font-normal text-muted-foreground">
                Diga um tema, a IA monta um plano sob medida.
              </p>
            </div>
          </Button>
        </motion.div>

        <CreatePlanDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={reload}
        />


        {loading ? (
          <div className="mt-10 flex justify-center">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section className="mt-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Seus planos ativos
                </h2>
                <div className="space-y-3">
                  <AnimatePresence>
                    {active.map((p) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <PlanCard
                          plan={p}
                          progress={progressByPlan.get(p.id)}
                          onEnroll={handleEnroll}
                          onLeave={handleLeave}
                          onMarkToday={handleMarkToday}
                          busyId={busyId}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {available.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {active.length > 0 ? "Outros planos" : "Planos disponíveis"}
                </h2>
                <div className="space-y-3">
                  {available.map((p) => (
                    <PlanCard
                      key={p.id}
                      plan={p}
                      onEnroll={handleEnroll}
                      onLeave={handleLeave}
                      onMarkToday={handleMarkToday}
                      busyId={busyId}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Plans;
