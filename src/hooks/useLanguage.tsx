import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type Language = 'en' | 'sw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.nursery': 'Nursery',
    'nav.verifications': 'Verifications',
    'nav.admin': 'Admin',
    'nav.profile': 'Profile',
    'nav.signOut': 'Sign Out',
    'nav.matches': 'My Matches',
    'nav.community': 'Community',

    // Homepage
    'home.tagline': 'Creating Ripples of Impact Through Time',
    'home.welcome': 'Welcome to LeafSwipe!',
    'home.description': 'LeafSwipe transforms tree planting from a simple agricultural activity into a profound act of intergenerational stewardship. Every tree you plant creates ripples that echo through generations.',
    'home.startSwiping': 'Start Swiping',
    'home.matches': 'Matches',
    'home.countries': 'Countries',
    'home.howItWorks': 'How It Works',
    'home.browseTrees': 'Browse Trees',
    'home.browseDesc': 'Discover diverse tree species perfectly matched to your climate and soil conditions',
    'home.swipeRight': 'Swipe Right',
    'home.swipeDesc': 'Match with trees that fit your land. Each right swipe brings you closer to a greener future',
    'home.makeImpact': 'Make Impact',
    'home.impactDesc': 'Your matches contribute to reforestation projects worldwide. Track your environmental impact',
    'home.findMatch': 'Find Your Perfect Match',
    'home.findMatchDesc': 'Each tree has unique benefits and requirements. Swipe through our curated selection and discover the perfect species for your land.',
    'home.footer': 'Together, we\'re making the world greener, one swipe at a time',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.approve': 'Approve',
    'common.reject': 'Reject',
    'common.pending': 'Pending',
    'common.approved': 'Approved',
    'common.rejected': 'Rejected',

    // Admin
    'admin.title': 'Admin Dashboard',
    'admin.queue': 'Verification Queue',
    'admin.stats': 'Statistics',
    'admin.pending': 'Pending Verifications',
    'admin.approved': 'Approved',
    'admin.rejected': 'Rejected',
    'admin.approvalRate': 'Approval Rate',
    'admin.location': 'Location',
    'admin.plantingDate': 'Planting Date',
    'admin.submittedBy': 'Submitted By',
    'admin.actions': 'Actions',
    'admin.viewDetails': 'View Details',
    'admin.noVerifications': 'No verifications pending',

    // Trees
    'trees.title': 'Find Your Perfect Tree',
    'trees.compatibility': 'Compatibility',
    'trees.uses': 'Uses',
    'trees.price': 'Price',
    'trees.county': 'County',
    'trees.agroZone': 'Agro-Ecological Zone',

    // Offline
    'offline.back_online': 'Back online - syncing data...',
    'offline.offline_mode': 'You are offline. Some features may be limited.',
  },
  sw: {
    // Navigation
    'nav.home': 'Nyumbani',
    'nav.dashboard': 'Dashibodi',
    'nav.nursery': 'Pembejeo',
    'nav.verifications': 'Uthibitisho',
    'nav.admin': 'Usimamizi',
    'nav.profile': 'Wasifu',
    'nav.signOut': 'Toka',
    'nav.matches': 'Miti Yangu',
    'nav.community': 'Jamii',

    // Homepage
    'home.tagline': 'Kuunda Mawimbi ya Athari Kupitia Wakati',
    'home.welcome': 'Karibu LeafSwipe!',
    'home.description': 'LeafSwipe inabadilisha upandaji wa miti kutoka shughuli rahisi ya kilimo kuwa kitendo cha kina cha uangalizi wa kizazi. Kila mti unaopanda huunda mawimbi yanayorudia kwa vizazi.',
    'home.startSwiping': 'Anza Kupapasa',
    'home.matches': 'Mechi',
    'home.countries': 'Nchi',
    'home.howItWorks': 'Jinsi Inavyofanya Kazi',
    'home.browseTrees': 'Vinjari Miti',
    'home.browseDesc': 'Gundua aina mbalimbali za miti zinazofaa kabisa na hali yako ya hewa na udongo',
    'home.swipeRight': 'Papasa Kulia',
    'home.swipeDesc': 'Pata mechi na miti inayofaa ardhi yako. Kila upapasaji wa kulia unakupeleka karibu na mustakabali wa kijani',
    'home.makeImpact': 'Fanya Athari',
    'home.impactDesc': 'Mechi zako zinachangia miradi ya upandaji miti duniani kote. Fuatilia athari yako ya mazingira',
    'home.findMatch': 'Pata Mechi Yako Kamili',
    'home.findMatchDesc': 'Kila mti una faida na mahitaji ya kipekee. Papasa kupitia uteuzi wetu na ugundue aina kamili kwa ardhi yako.',
    'home.footer': 'Pamoja, tunafanya dunia kuwa ya kijani zaidi, kupapasa moja kwa wakati',

    // Common
    'common.loading': 'Inapakia...',
    'common.error': 'Hitilafu',
    'common.save': 'Hifadhi',
    'common.cancel': 'Ghairi',
    'common.confirm': 'Thibitisha',
    'common.approve': 'Kubali',
    'common.reject': 'Kataa',
    'common.pending': 'Inasubiri',
    'common.approved': 'Imekubaliwa',
    'common.rejected': 'Imekataliwa',

    // Admin
    'admin.title': 'Dashibodi ya Usimamizi',
    'admin.queue': 'Foleni ya Uthibitisho',
    'admin.stats': 'Takwimu',
    'admin.pending': 'Uthibitisho Unaosubiri',
    'admin.approved': 'Imekubaliwa',
    'admin.rejected': 'Imekataliwa',
    'admin.approvalRate': 'Kiwango cha Kukubali',
    'admin.location': 'Mahali',
    'admin.plantingDate': 'Tarehe ya Kupanda',
    'admin.submittedBy': 'Imetumwa na',
    'admin.actions': 'Vitendo',
    'admin.viewDetails': 'Angalia Maelezo',
    'admin.noVerifications': 'Hakuna uthibitisho unaosubiri',

    // Trees
    'trees.title': 'Pata Mti Wako Kamili',
    'trees.compatibility': 'Ulinganifu',
    'trees.uses': 'Matumizi',
    'trees.price': 'Bei',
    'trees.county': 'Kaunti',
    'trees.agroZone': 'Eneo la Kilimo',

    // Offline
    'offline.back_online': 'Umerudi mtandaoni - inasawazisha data...',
    'offline.offline_mode': 'Uko nje ya mtandao. Baadhi ya vipengele vinaweza kuwa na kikomo.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const { user } = useAuth();

  useEffect(() => {
    const loadUserLanguage = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('user_id', user.id)
          .single();

        if (data?.preferred_language) {
          setLanguageState(data.preferred_language as Language);
        }
      }
    };

    loadUserLanguage();
  }, [user]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    if (user) {
      await supabase
        .from('profiles')
        .update({ preferred_language: lang })
        .eq('user_id', user.id);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
