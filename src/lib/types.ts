export type Transaction = {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
};

export type User = {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  pin: string;
  balance: number;
  transactions: Transaction[];
};

export type SignupData = Omit<User, 'id' | 'balance' | 'transactions'> & { password: NonNullable<User['password']> };
