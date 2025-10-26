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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

type TransactionFormProps = {
  type: 'deposit' | 'withdrawal';
};

const formSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'Please enter a valid amount.' })
    .positive({ message: 'Amount must be positive.' }),
});

const pinSchema = z.object({
  pin: z.string().length(4, { message: 'PIN must be 4 digits.' }),
});

export function TransactionForm({ type }: TransactionFormProps) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<number[]>([]);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState<number | null>(null);

  const amountForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '' as any,
    },
  });

  const pinForm = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: '',
    },
  });

  const handleAiSuggest = async () => {
    if (!user) return;
    setIsAiLoading(true);
    const transactionHistory = user.transactions
      .filter(t => t.type === type)
      .map(t => t.amount)
      .slice(0, 3);
    
    const recommendedAmounts = await getAiSuggestions({ 
      transactionHistory, 
      transactionType: type,
      previousSuggestions: suggestions 
    });
    setSuggestions(recommendedAmounts);
    setIsAiLoading(false);
  };
  
  const handleSuggestionClick = (amount: number) => {
    amountForm.setValue('amount', amount);
  }

  const handleAmountSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    const { amount } = values;

    if (type === 'withdrawal' && amount > user.balance) {
      toast({
        variant: 'destructive',
        title: 'Transaction Failed',
        description: 'Insufficient funds for this withdrawal.',
      });
      return;
    }
    setTransactionAmount(amount);
    setIsPinModalOpen(true);
  };

  const handlePinSubmit = (values: z.infer<typeof pinSchema>) => {
    if (!user || transactionAmount === null) return;
    setIsLoading(true);
    const { pin } = values;

    if (pin !== user.pin) {
      toast({
        variant: 'destructive',
        title: 'Incorrect PIN',
        description: 'The PIN you entered is incorrect. Please try again.',
      });
      pinForm.reset();
      setIsLoading(false);
      return;
    }

    const newBalance = type === 'deposit' ? user.balance + transactionAmount : user.balance - transactionAmount;

    const newTransaction = {
      id: Date.now().toString(),
      type,
      amount: transactionAmount,
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
      description: `Successfully ${type === 'deposit' ? 'deposited' : 'withdrew'} ${transactionAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}.`,
    });
    
    amountForm.reset();
    pinForm.reset();
    setSuggestions([]);
    setIsLoading(false);
    setIsPinModalOpen(false);
    setTransactionAmount(null);
  };
  
  const title = type === 'deposit' ? 'Deposit Funds' : 'Withdraw Cash';
  const buttonText = type === 'deposit' ? 'Deposit' : 'Withdraw';

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <Form {...amountForm}>
          <form onSubmit={amountForm.handleSubmit(handleAmountSubmit)} className="space-y-4">
            <FormField
              control={amountForm.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
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
                    ₹{s}
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

            <Button type="submit" className="w-full">
              {buttonText}
            </Button>
          </form>
        </Form>
      </div>

      <Dialog open={isPinModalOpen} onOpenChange={setIsPinModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter PIN to Confirm</DialogTitle>
            <DialogDescription>
              For your security, please enter your 4-digit PIN to complete this {type}.
            </DialogDescription>
          </DialogHeader>
          <Form {...pinForm}>
            <form onSubmit={pinForm.handleSubmit(handlePinSubmit)} className="space-y-4">
              <FormField
                control={pinForm.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        maxLength={4}
                        placeholder="••••"
                        className="text-center text-2xl tracking-[1rem]"
                        {...field}
                      />

                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPinModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
