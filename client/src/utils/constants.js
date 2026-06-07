export const CATEGORIES = [
  { value: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
  { value: 'Bills & Utilities', icon: '⚡', color: '#4ECDC4' },
  { value: 'Entertainment', icon: '🎬', color: '#45B7D1' },
  { value: 'Shopping', icon: '🛍️', color: '#96CEB4' },
  { value: 'Transport', icon: '🚗', color: '#FFEAA7' },
  { value: 'Healthcare', icon: '🏥', color: '#DDA0DD' },
  { value: 'Education', icon: '📚', color: '#98D8C8' },
  { value: 'Travel', icon: '✈️', color: '#F7DC6F' },
  { value: 'Fitness', icon: '💪', color: '#82E0AA' },
  { value: 'Personal Care', icon: '💅', color: '#F1948A' },
  { value: 'Investments', icon: '📈', color: '#85C1E9' },
  { value: 'Other', icon: '💼', color: '#BFC9CA' },
];

export const getCategoryInfo = (value) =>
  CATEGORIES.find((c) => c.value === value) || { icon: '💼', color: '#BFC9CA' };

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
