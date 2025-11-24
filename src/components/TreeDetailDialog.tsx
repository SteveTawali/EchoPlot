import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Phone, CheckCircle, MapPin, Leaf, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import type { KenyanTreeSpecies } from '@/data/kenya';
import type { SeasonalRecommendation, SuccessProbability } from '@/utils/kenyaCompatibility';

interface TreeDetailDialogProps {
  tree: KenyanTreeSpecies | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compatibilityScore?: number;
  seasonalData?: SeasonalRecommendation;
  successData?: SuccessProbability;
}

export const TreeDetailDialog = ({
  tree,
  open,
  onOpenChange,
  compatibilityScore,
  seasonalData,
  successData,
}: TreeDetailDialogProps) => {
  const { language } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!tree) return null;

  const displayName = language === 'sw' ? tree.swahiliName : tree.englishName;
  const displayDescription = tree.description[language as 'en' | 'sw'];

  const simulateMpesaPayment = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 2000);
    });
  };

  const handlePurchase = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error(
        language === 'en' ? 'Please enter a valid M-Pesa number' : 'Tafadhali weka nambari sahihi ya M-Pesa'
      );
      return;
    }

    const totalAmount = tree.price * quantity;

    toast.info(
      language === 'en' ? 'Processing Payment...' : 'Inashughulikia Malipo...',
      {
        description: language === 'en'
          ? 'Check your phone for M-Pesa prompt'
          : 'Angalia simu yako kwa ujumbe wa M-Pesa',
      }
    );

    await simulateMpesaPayment();

    setPaymentSuccess(true);

    toast.success(
      language === 'en' ? 'Payment Successful!' : 'Malipo Yamefaulu!',
      {
        description: language === 'en'
          ? `KSh ${totalAmount.toLocaleString()} paid. You'll receive collection details via SMS.`
          : `KSh ${totalAmount.toLocaleString()} imelipwa. Utapokea maelezo ya ukusanyaji kupitia SMS.`,
      }
    );
  };

  const handleClose = () => {
    setPaymentSuccess(false);
    setQuantity(1);
    setPhoneNumber('');
    onOpenChange(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getSuccessColor = (rating: string) => {
    switch (rating) {
      case 'very-high': return 'text-green-600';
      case 'high': return 'text-green-500';
      case 'moderate': return 'text-yellow-600';
      default: return 'text-orange-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!paymentSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{displayName}</DialogTitle>
              <DialogDescription className="italic">{tree.scientificName}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Compatibility Score */}
              {compatibilityScore !== undefined && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="font-semibold">
                        {language === 'sw' ? 'Upatanifu' : 'Compatibility'}
                      </span>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(compatibilityScore)}`}>
                      {compatibilityScore}%
                    </span>
                  </div>
                </div>
              )}

              {/* Description */}
              <p className="text-muted-foreground">{displayDescription}</p>

              {/* Price */}
              <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                <DollarSign className="w-5 h-5" />
                <span>KSh {tree.price.toLocaleString()} per seedling</span>
              </div>

              {/* Uses */}
              <div>
                <p className="font-semibold mb-2">{language === 'sw' ? 'Matumizi' : 'Uses'}:</p>
                <div className="flex flex-wrap gap-2">
                  {tree.uses.map((use) => (
                    <Badge key={use} variant="secondary">
                      {use}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Planting Guide */}
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  {language === 'sw' ? 'Mwongozo wa Kupanda' : 'Planting Guide'}
                </h3>

                {/* Suitable Counties */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">
                      {language === 'sw' ? 'Kaunti Zinazofaa' : 'Suitable Counties'}:
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tree.suitableCounties.join(', ')}
                  </p>
                </div>

                {/* Agro Zones */}
                <div>
                  <p className="text-sm font-semibold mb-1">
                    {language === 'sw' ? 'Maeneo ya Kilimo' : 'Agro Zones'}:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tree.agroZones.map((zone) => (
                      <Badge key={zone} variant="outline" className="text-xs">
                        {zone}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Seasonal Recommendation */}
                {seasonalData && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold">
                        {language === 'sw' ? 'Ushauri wa Msimu' : 'Seasonal Advice'}:
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{seasonalData.seasonalAdvice}</p>
                    {!seasonalData.canPlantNow && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'sw' ? 'Wakati Bora' : 'Best Time'}: {seasonalData.optimalMonths.join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {/* Success Probability */}
                {successData && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold">
                        {language === 'sw' ? 'Uwezekano wa Mafanikio' : 'Success Probability'}:
                      </p>
                      <p className={`font-bold ${getSuccessColor(successData.rating)}`}>
                        {successData.probability}%
                      </p>
                    </div>
                    {successData.riskFactors.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {successData.riskFactors.map((factor, idx) => (
                          <p key={idx} className="text-xs text-muted-foreground">• {factor}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Purchase Section - Coming Soon with Nursery Marketplace
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-lg">
                  {language === 'sw' ? 'Nunua Miche' : 'Get Seedlings'}
                </h3>
                
                <div className="space-y-3">
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
                  
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{language === 'en' ? 'Total Amount:' : 'Jumla ya Kiasi:'}</span>
                      <span className="text-2xl font-bold text-primary">
                        KSh {(tree.price * quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <Button onClick={handlePurchase} className="w-full" size="lg">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Pay with M-Pesa' : 'Lipa kwa M-Pesa'}
                  </Button>
                </div>
              </div>
              */}
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
                  <span className="font-medium">{displayName}</span>
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
                  <span className="font-medium">KSh {(tree.price * quantity).toLocaleString()}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                {language === 'en'
                  ? 'You will receive SMS with nursery location and collection details within 24 hours.'
                  : 'Utapokea SMS yenye maelezo ya pembejeo na jinsi ya kukusanya ndani ya masaa 24.'}
              </p>

              <Button onClick={handleClose} className="w-full">
                {language === 'en' ? 'Done' : 'Maliza'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
