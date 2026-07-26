export type TripRole = "owner" | "editor" | "viewer";

export interface Trip {
  id: string;
  title: string;
  location: string;
  startDate: string | null;
  endDate: string | null;
  coverUrl: string | null;
  role: TripRole;
}

export interface TripDetail extends Trip {
  memberCount: number;
}

export type EntryType = "photo" | "text" | "link" | "video";
export type EntryCategory = "visitar" | "comer" | "hospedagem" | "transporte";

export interface EntryItem {
  id: string;
  type: EntryType;
  title: string | null;
  body: string | null;
  caption: string | null;
  url: string | null;
  platform: string | null;
  mediaUrl: string | null;
  authorId: string;
  author: string;
  createdAt: string;
}

export type ReactionType = "like" | "dislike";

export interface EntrySummary {
  id: string;
  category: EntryCategory;
  itemCount: number;
  previewType: EntryType | null;
  previewMediaUrl: string | null;
  previewMediaType: "photo" | "video" | null;
  previewText: string | null;
  authorId: string;
  author: string;
  authorInitials: string;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  myReaction: ReactionType | null;
}

export interface EntryDetail {
  id: string;
  category: EntryCategory;
  authorId: string;
  author: string;
  createdAt: string;
  items: EntryItem[];
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  receiptUrl: string | null;
  paidBy: string;
  createdAt: string;
}

export type BalanceStatus = "settled" | "receives" | "owes";

export interface MemberBalance {
  userId: string;
  name: string;
  status: BalanceStatus;
  amount: number;
}

export interface ExpensesResponse {
  expenses: Expense[];
  total: number;
  perPerson: number;
  balances: MemberBalance[];
}

export interface Member {
  id: string;
  userId: string;
  name: string;
  initials: string;
  role: TripRole;
}

export type MessageType = "text" | "image" | "audio" | "entry";

export interface Message {
  id: string;
  type: MessageType;
  text: string | null;
  mediaUrl: string | null;
  durationSeconds: number | null;
  sharedEntry: EntrySummary | null;
  authorId: string;
  author: string;
  authorInitials: string;
  createdAt: string;
  editedAt: string | null;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
}
