import { formatCurrency, balanceLabel, balanceColorVar } from "../../lib/format";
import type { ExpensesResponse } from "../../types";

export function ExpenseSummaryCard({ total, balances }: Pick<ExpensesResponse, "total" | "balances">) {
  return (
    <div className="card elev-sm">
      <div className="card-kicker">Resumo</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 4 }}>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 24 }}>{formatCurrency(total)}</span>
        <span className="text-muted" style={{ fontSize: 12 }}>dividido entre {balances.length} pessoas</span>
      </div>
      <div className="hr" style={{ margin: "8px 0" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {balances.map((b) => (
          <div key={b.userId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span>{b.name}</span>
            <span style={{ color: balanceColorVar(b.status), fontWeight: 600 }}>{balanceLabel(b.status, b.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
