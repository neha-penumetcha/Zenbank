export type Transaction = {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
};

export type User = {
  id: string;
  username: string;
  password;
  string;
  balance: number;
  transactions: Transaction[];
};
