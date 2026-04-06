import { useContext } from 'react';

import { AuthContext } from '@/src/shared/contexts/AuthContext';

export function useAuth() {
  return useContext(AuthContext);
}
