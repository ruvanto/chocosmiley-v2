export interface Revenue {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
}
