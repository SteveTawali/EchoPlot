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
    'nav.matches': 'My Matches',
    'nav.verifications': 'Verifications',
    'nav.community': 'Community',
    'nav.dashboard': 'Dashboard',
    'nav.admin': 'Admin',
    
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
  },
  sw: {
    // Navigation
    'nav.home': 'Nyumbani',
    'nav.matches': 'Miti Yangu',
    'nav.verifications': 'Uthibitisho',
    'nav.community': 'Jamii',
    'nav.dashboard': 'Dashibodi',
    'nav.admin': 'Usimamizi',
    
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
