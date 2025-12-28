import { Quote } from '../types';

const STORAGE_KEY = 'renolx_saved_quotes_v1';

export const saveQuote = (quote: Quote): void => {
  const existingJson = localStorage.getItem(STORAGE_KEY);
  let quotes: Quote[] = existingJson ? JSON.parse(existingJson) : [];
  
  const index = quotes.findIndex(q => q.id === quote.id);
  if (index >= 0) {
    quotes[index] = quote;
  } else {
    quotes.push(quote);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
};

export const getSavedQuotes = (): Quote[] => {
  const existingJson = localStorage.getItem(STORAGE_KEY);
  return existingJson ? JSON.parse(existingJson) : [];
};

export const deleteQuote = (id: string): void => {
  const quotes = getSavedQuotes();
  const filtered = quotes.filter(q => q.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
