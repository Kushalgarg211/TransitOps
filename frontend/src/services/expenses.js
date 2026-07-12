import apiClient, { handleApiWithFallback } from './api';
import { getFromDb, saveToDb } from './mockDb';

export const getExpenses = async () => {
  return handleApiWithFallback(
    () => apiClient.get('/expenses'),
    () => getFromDb('to_expenses')
  );
};

export const createExpense = async (data) => {
  return handleApiWithFallback(
    () => apiClient.post('/expenses', data),
    () => {
      const list = getFromDb('to_expenses');
      const newExpense = {
        ...data,
        id: `e-${Date.now()}`,
        amount: Number(data.amount || 0),
        date: data.date || new Date().toISOString().split('T')[0],
      };
      list.unshift(newExpense);
      saveToDb('to_expenses', list);
      return newExpense;
    }
  );
};
