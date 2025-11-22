import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Wallet, ArrowUpRight, ArrowDownRight, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  status: 'verified' | 'pending' | 'rejected';
  created_at: string;
  tree_name: string;
  reward_amount: number;
  reward_paid: boolean;
}

const RewardsWallet = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadWallet = async () => {
      // Load verified rewards (balance)
      const { data: verified } = await supabase
        .from('planting_verifications')
        .select('reward_amount, reward_paid')
        .eq('user_id', user.id)
        .eq('status', 'verified');

      if (verified) {
        const totalEarned = verified.reduce((sum, v) => sum + (v.reward_amount || 0), 0);
        const paid = verified.filter(v => v.reward_paid).reduce((sum, v) => sum + (v.reward_amount || 0), 0);
        setBalance(totalEarned - paid);
      }

      // Load pending rewards
      const { data: pending } = await supabase
        .from('planting_verifications')
        .select('reward_amount')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (pending) {
        setPendingBalance(pending.reduce((sum, v) => sum + (v.reward_amount || 0), 0));
      }

      // Load all transactions (verified plantings as rewards)
      const { data: allVerifications } = await supabase
        .from('planting_verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (allVerifications) {
        setTransactions(allVerifications);
      }

      // Load user phone
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('user_id', user.id)
        .single();

      if (profile?.phone) {
        setWithdrawPhone(profile.phone);
      }

      setLoading(false);
    };

    loadWallet();
  }, [user]);

  const simulateMpesaWithdrawal = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 3000);
    });
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: language === 'en' ? 'Invalid Amount' : 'Kiasi Kisichohali',
        description: language === 'en' ? 'Please enter a valid amount' : 'Tafadhali weka kiasi halali',
        variant: 'destructive',
      });
      return;
    }

    if (amount > balance) {
      toast({
        title: language === 'en' ? 'Insufficient Balance' : 'Salio Haitoshi',
        description: language === 'en' ? 'Not enough funds' : 'Fedha hazitoshi',
        variant: 'destructive',
      });
      return;
    }

    if (!withdrawPhone || withdrawPhone.length < 10) {
      toast({
        title: language === 'en' ? 'Invalid Phone' : 'Nambari Isiyo Sahihi',
        description: language === 'en' ? 'Please enter valid M-Pesa number' : 'Tafadhali weka nambari sahihi ya M-Pesa',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: language === 'en' ? 'Processing Withdrawal...' : 'Inashughulikia Uondoaji...',
      description: language === 'en'
        ? 'Please wait while we process your M-Pesa withdrawal'
        : 'Tafadhali subiri tunaposhughulikia uondoaji wako wa M-Pesa',
    });

    // Simulate M-Pesa withdrawal
    await simulateMpesaWithdrawal();

    toast({
      title: language === 'en' ? 'Withdrawal Successful!' : 'Uondoaji Umefaulu!',
      description: language === 'en'
        ? `KSh ${amount.toFixed(2)} sent to ${withdrawPhone}`
        : `KSh ${amount.toFixed(2)} imetumwa kwa ${withdrawPhone}`,
    });

    // In a real implementation, this would update the database
    setBalance(prev => prev - amount);
    setWithdrawAmount('');
  };

  if (loading) {
    return <div className="text-center py-8">{language === 'en' ? 'Loading...' : 'Inapakia...'}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Wallet className="h-5 w-5" />
              {language === 'en' ? 'Available Balance' : 'Salio Lililopo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">KSh {balance.toFixed(2)}</p>
            <p className="text-sm opacity-90 mt-2">
              {language === 'en' ? 'Ready to withdraw' : 'Iko tayari kuondolewa'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">
              {language === 'en' ? 'Pending Balance' : 'Salio Linalosubiri'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">KSh {pendingBalance.toFixed(2)}</p>
            <p className="text-sm opacity-90 mt-2">
              {language === 'en' ? 'Awaiting verification' : 'Inasubiri uthibitisho'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Form */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'en' ? 'Withdraw to M-Pesa' : 'Ondoa kwa M-Pesa'}</CardTitle>
          <CardDescription>
            {language === 'en'
              ? 'Enter amount and M-Pesa number to withdraw funds'
              : 'Weka kiasi na nambari ya M-Pesa ili kuondoa fedha'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{language === 'en' ? 'Amount (KSh)' : 'Kiasi (KSh)'}</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {language === 'en' ? 'M-Pesa Number' : 'Nambari ya M-Pesa'}
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="254XXXXXXXXX"
              value={withdrawPhone}
              onChange={(e) => setWithdrawPhone(e.target.value)}
            />
          </div>
          <Button onClick={handleWithdraw} className="w-full" disabled={balance === 0}>
            {language === 'en' ? 'Withdraw Funds' : 'Ondoa Fedha'}
          </Button>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'en' ? 'Transaction History' : 'Historia ya Miamala'}</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {language === 'en' ? 'No transactions yet' : 'Hakuna miamala bado'}
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.status === 'verified' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                      {tx.status === 'verified' ? (
                        <ArrowDownRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.tree_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.status === 'verified' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                      {tx.status === 'verified' ? '+' : ''}KSh {tx.reward_amount || 0}
                    </p>
                    <Badge variant={tx.status === 'verified' ? 'default' : 'secondary'} className="text-xs">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsWallet;
