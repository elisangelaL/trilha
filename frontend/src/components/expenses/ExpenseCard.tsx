import { Tag } from "../ui/Tag";
import { ReceiptIcon, UserIcon } from "../ui/icons";
import { formatCurrency } from "../../lib/format";
import type { Expense } from "../../types";

export function ExpenseCard({ expense }: { expense: Expense }) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div className="card-kicker">{expense.category}</div>
          <div className="card-title" style={{ fontSize: 15 }}>{expense.description}</div>
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 15, whiteSpace: "nowrap" }}>
          {formatCurrency(expense.amount)}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="card-meta">
          <UserIcon size={11} />
          Adicionado por {expense.paidBy}
        </div>
        {expense.receiptUrl && (
          <Tag variant="accent">
            <ReceiptIcon size={10} style={{ marginRight: 4 }} />
            Recibo
          </Tag>
        )}
      </div>
    </div>
  );
}
