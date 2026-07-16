import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { fetchPlans, fetchUserPlans, type ReadingPlan, type UserPlanProgress } from "@/lib/reading-plans";

const ActivePlansMini = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState<Array<{ plan: ReadingPlan; progress: UserPlanProgress }>>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchPlans(user.id), fetchUserPlans(user.id)]).then(([plans, userPlans]) => {
      const joined = userPlans
        .filter((p) => p.is_active)
        .map((up) => {
          const plan = plans.find((pl) => pl.id === up.plan_id);
          return plan ? { plan, progress: up } : null;
        })
        .filter((x): x is { plan: ReadingPlan; progress: UserPlanProgress } => !!x)
        .slice(0, 2);
      setRows(joined);
    });
  }, [user]);

  return (
    <Card className="flex flex-col rounded-3xl border-border/60 bg-card p-4 shadow-scripture">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Planos Ativos
      </p>

      {rows.length === 0 ? (
        <button
          onClick={() => navigate("/plans")}
          className="mt-3 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border/70 p-3 text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Comece um plano de leitura
        </button>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map(({ plan, progress }) => {
            const pct = Math.round((progress.completed_days.length / plan.duration_days) * 100);
            return (
              <li key={progress.id}>
                <button
                  onClick={() => navigate("/plans")}
                  className="w-full rounded-2xl bg-muted/60 px-3 py-2 text-left transition-colors hover:bg-muted"
                >
                  <p className="truncate text-xs font-semibold text-foreground">{plan.name}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
                      <div
                        className="h-full rounded-full bg-accent transition-[width] duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{pct}%</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default ActivePlansMini;
