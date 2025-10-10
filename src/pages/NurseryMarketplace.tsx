import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { KENYAN_TREES } from '@/data/kenya';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Leaf, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NurseryMarketplace = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedTree, setSelectedTree] = useState<typeof KENYAN_TREES[0] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleBuyClick = (tree: typeof KENYAN_TREES[0]) => {
    setSelectedTree(tree);
    setQuantity(1);
    setPhoneNumber('');
    setPaymentSuccess(false);
    setShowPaymentDialog(true);
  };

  const simulateMpesaPayment = () => {
    // Simulate M-Pesa STK Push
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 2000);
    });
  };

  const handlePurchase = async () => {
    if (!selectedTree) return;

    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: language === 'en' ? 'Invalid Phone Number' : 'Nambari Isiyo Sahihi',
        description: language === 'en' ? 'Please enter a valid M-Pesa number' : 'Tafadhali weka nambari sahihi ya M-Pesa',
        variant: 'destructive',
      });
      return;
    }

    const totalAmount = selectedTree.price * quantity;

    toast({
      title: language === 'en' ? 'Processing Payment...' : 'Inashughulikia Malipo...',
      description: language === 'en' 
        ? 'Check your phone for M-Pesa prompt' 
        : 'Angalia simu yako kwa ujumbe wa M-Pesa',
    });

    // Simulate M-Pesa payment
    await simulateMpesaPayment();

    setPaymentSuccess(true);

    toast({
      title: language === 'en' ? 'Payment Successful!' : 'Malipo Yamefaulu!',
      description: language === 'en' 
        ? `KSh ${totalAmount} paid. You'll receive collection details via SMS.` 
        : `KSh ${totalAmount} imelipwa. Utapokea maelezo ya ukusanyaji kupitia SMS.`,
    });
  };

  const handleCloseDialog = () => {
    setShowPaymentDialog(false);
    setSelectedTree(null);
    setPaymentSuccess(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 border-b">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Back' : 'Rudi'}
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {language === 'en' ? 'Nursery Marketplace' : 'Soko la Pembejeo'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Buy seedlings directly from certified nurseries near you' 
              : 'Nunua miche moja kwa moja kutoka kwa pembejeo zilizoidhinishwa karibu nawe'}
          </p>
        </div>
      </div>

      {/* Tree Listings */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {KENYAN_TREES.map((tree) => (
            <Card key={tree.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Leaf className="h-8 w-8 text-green-600" />
                  <Badge variant="secondary">KSh {tree.price}/seedling</Badge>
                </div>
                <CardTitle className="mt-2">{tree.englishName}</CardTitle>
                <CardDescription>
                  <span className="font-medium italic">{tree.scientificName}</span>
                  <br />
                  {language === 'en' ? tree.swahiliName : tree.englishName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? tree.description.en : tree.description.sw}
                </p>
                <div className="flex flex-wrap gap-1">
                  {tree.uses.map((use) => (
                    <Badge key={use} variant="outline" className="text-xs">
                      {use}
                    </Badge>
                  ))}
                </div>
                <Button onClick={() => handleBuyClick(tree)} className="w-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Buy Seedlings' : 'Nunua Miche'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          {!paymentSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {language === 'en' ? 'Purchase Seedlings' : 'Nunua Miche'}
                </DialogTitle>
                <DialogDescription>
                  {selectedTree?.englishName} - KSh {selectedTree?.price} {language === 'en' ? 'each' : 'kila moja'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">{language === 'en' ? 'Quantity' : 'Idadi'}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
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
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{language === 'en' ? 'Total Amount:' : 'Jumla ya Kiasi:'}</span>
                    <span className="text-2xl font-bold text-primary">
                      KSh {selectedTree ? selectedTree.price * quantity : 0}
                    </span>
                  </div>
                </div>
                <Button onClick={handlePurchase} className="w-full">
                  {language === 'en' ? 'Pay with M-Pesa' : 'Lipa kwa M-Pesa'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-green-100 p-4">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <DialogTitle className="text-center">
                  {language === 'en' ? 'Payment Successful!' : 'Malipo Yamefaulu!'}
                </DialogTitle>
                <DialogDescription className="text-center">
                  {language === 'en' 
                    ? 'Your order has been confirmed' 
                    : 'Agizo lako limethibitishwa'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Tree Species:' : 'Aina ya Mti:'}
                    </span>
                    <span className="font-medium">{selectedTree?.englishName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Quantity:' : 'Idadi:'}
                    </span>
                    <span className="font-medium">{quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Total Paid:' : 'Jumla Iliyolipwa:'}
                    </span>
                    <span className="font-medium">KSh {selectedTree ? selectedTree.price * quantity : 0}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {language === 'en' 
                    ? 'You will receive SMS with nursery location and collection details within 24 hours.' 
                    : 'Utapokea SMS yenye maelezo ya pembejeo na jinsi ya kukusanya ndani ya masaa 24.'}
                </p>
                <Button onClick={handleCloseDialog} className="w-full">
                  {language === 'en' ? 'Done' : 'Maliza'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NurseryMarketplace;
