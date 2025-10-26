'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getAiSuggestions } from '@/app/actions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

type TransactionFormProps = {
  type: 'deposit' | 'withdrawal';
};

const formSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'Please enter a valid amount.' })
    .positive({ message: 'Amount must be positive.' }),
});

export function TransactionForm({ type }: TransactionFormProps) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<number[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
    },
  });

  const handleAiSuggest = async () => {
    if (!user) return;
    setIsAiLoading(true);
    const transactionHistory = user.transactions
      .filter(t => t.type === type)
      .map(t => t.amount);
    
    const recommendedAmounts = await getAiSuggestions({ transactionHistory, transactionType: type });
    setSuggestions(recommendedAmounts);
    setIsAiLoading(false);
  };
  
  const handleSuggestionClick = (amount: number) => {
    form.setValue('amount', amount);
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setIsLoading(true);
    const { amount } = values;

    if (type === 'withdrawal' && amount > user.balance) {
      toast({
        variant: 'destructive',
        title: 'Transaction Failed',
        description: 'Insufficient funds for this withdrawal.',
      });
      setIsLoading(false);
      return;
    }

    const newBalance = type === 'deposit' ? user.balance + amount : user.balance - amount;

    const newTransaction = {
      id: Date.now().toString(),
      type,
      amount,
      date: new Date().toISOString(),
    };

    const updatedUser = {
      ...user,
      balance: newBalance,
      transactions: [newTransaction, ...user.transactions],
    };

    updateUser(updatedUser);

    toast({
      title: 'Transaction Successful',
      description: `Successfully ${type === 'deposit' ? 'deposited' : 'withdrew'} ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.`,
    });
    
    form.reset();
    setSuggestions([]);
    setIsLoading(false);
  };
  
  const title = type === 'deposit' ? 'Deposit Funds' : 'Withdraw Cash';
  const buttonText = type === 'deposit' ? 'Deposit' : 'Withdraw';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input type="number" placeholder="0.00" className="pl-6" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
               {suggestions.map((s) => (
                <Button key={s} type="button" variant="outline" size="sm" onClick={() => handleSuggestionClick(s)}>
                  ${s}
                </Button>
              ))}
               <Button type="button" variant="ghost" size="sm" onClick={handleAiSuggest} disabled={isAiLoading}>
                {isAiLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4 text-accent" />
                )}
                Suggest
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {buttonText}
          </Button>
        </form>
      </Form>
    </div>
  );
}
