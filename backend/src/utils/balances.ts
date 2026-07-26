export interface ExpenseForSplit {
  paidBy: string; // user id
  amount: number;
}

export interface MemberForSplit {
  userId: string;
  name: string;
}

export type BalanceStatus = "settled" | "receives" | "owes";

export interface MemberBalance {
  userId: string;
  name: string;
  status: BalanceStatus;
  /** Valor absoluto do quanto essa pessoa recebe/deve. 0 quando "settled". */
  amount: number;
}

export interface ExpenseSplit {
  total: number;
  perPerson: number;
  balances: MemberBalance[];
}

/**
 * Divisão igualitária do total de gastos entre os membros da viagem —
 * mesma regra do protótipo original (fmt()/renderVals() em Trilha.dc.html):
 * cada pessoa "deve" a diferença entre o que pagou e a cota por pessoa.
 */
export function splitExpenses(expenses: ExpenseForSplit[], members: MemberForSplit[]): ExpenseSplit {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = members.length ? total / members.length : 0;

  const paidByUser = new Map<string, number>();
  for (const expense of expenses) {
    paidByUser.set(expense.paidBy, (paidByUser.get(expense.paidBy) || 0) + expense.amount);
  }

  const balances: MemberBalance[] = members.map((member) => {
    const diff = (paidByUser.get(member.userId) || 0) - perPerson;
    if (Math.abs(diff) < 1) {
      return { userId: member.userId, name: member.name, status: "settled", amount: 0 };
    }
    if (diff > 0) {
      return { userId: member.userId, name: member.name, status: "receives", amount: diff };
    }
    return { userId: member.userId, name: member.name, status: "owes", amount: -diff };
  });

  return { total, perPerson, balances };
}
