import type { Revenue, Expense, Appointment } from './types';

// Mock data to simulate Firestore
let revenues: Revenue[] = [
  { id: 'rev1', amount: 1200, category: 'Web Design', date: new Date(2023, 4, 1).toISOString(), description: 'Project for Client A' },
  { id: 'rev2', amount: 750, category: 'Consulting', date: new Date(2023, 4, 5).toISOString(), description: 'Hourly consulting' },
  { id: 'rev3', amount: 2500, category: 'Web Development', date: new Date(2023, 4, 15).toISOString(), description: 'E-commerce site for Client B' },
  { id: 'rev4', amount: 500, category: 'Maintenance', date: new Date(2023, 4, 20).toISOString(), description: 'Monthly retainer' },
];

let expenses: Expense[] = [
  { id: 'exp1', amount: 50, category: 'Software', date: new Date(2023, 4, 2).toISOString(), description: 'Design tool subscription' },
  { id: 'exp2', amount: 200, category: 'Marketing', date: new Date(2023, 4, 10).toISOString(), description: 'Online ads' },
  { id: 'exp3', amount: 150, category: 'Office Supplies', date: new Date(2023, 4, 12).toISOString(), description: 'Paper, ink, etc.' },
  { id: 'exp4', amount: 800, category: 'Contractor', date: new Date(2023, 4, 18).toISOString(), description: 'Freelance writer' },
];

let appointments: Appointment[] = [
  { id: 'apt1', title: 'Client A - Project Kickoff', date: new Date().toISOString(), time: '10:00', description: 'Initial meeting to discuss project goals.' },
  { id: 'apt2', title: 'Dentist', date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), time: '14:00', description: 'Routine check-up.' },
  { id: 'apt3', title: 'Team Sync', date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), time: '09:00', description: 'Weekly team meeting.' },
];

// Simulate async data fetching
export const getRevenue = async (): Promise<Revenue[]> => {
  return new Promise(resolve => setTimeout(() => resolve([...revenues]), 500));
};

export const getExpenses = async (): Promise<Expense[]> => {
  return new Promise(resolve => setTimeout(() => resolve([...expenses]), 500));
};

export const getAppointments = async (): Promise<Appointment[]> => {
  return new Promise(resolve => setTimeout(() => resolve([...appointments]), 500));
};

export const addRevenue = async (item: Omit<Revenue, 'id'>): Promise<Revenue> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newItem = { ...item, id: `rev${Date.now()}` };
      revenues.push(newItem);
      resolve(newItem);
    }, 300);
  });
};

export const addExpense = async (item: Omit<Expense, 'id'>): Promise<Expense> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newItem = { ...item, id: `exp${Date.now()}` };
      expenses.push(newItem);
      resolve(newItem);
    }, 300);
  });
};

export const addAppointment = async (item: Omit<Appointment, 'id'>): Promise<Appointment> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newItem = { ...item, id: `apt${Date.now()}` };
      appointments.push(newItem);
      resolve(newItem);
    }, 300);
  });
};
