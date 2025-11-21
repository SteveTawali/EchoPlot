import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';

type UserRole = 'admin' | 'moderator' | 'user';

export const useAdminAuth = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const [county, setCounty] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole('user');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, county')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle() instead of single() to handle 0 rows

        // No error if there's no row - user just has no role
        if (error) {
          logger.error('Error fetching user role:', error);
          setRole('user');
        } else if (data) {
          setRole(data.role as UserRole);
          setCounty(data.county);
        } else {
          // No role assigned - default to user
          setRole('user');
        }
      } catch (error) {
        logger.error('Error:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator';
  const canModerate = isAdmin || isModerator;

  return {
    role,
    loading,
    county,
    isAdmin,
    isModerator,
    canModerate
  };
};
