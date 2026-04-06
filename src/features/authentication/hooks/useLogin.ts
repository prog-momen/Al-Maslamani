import { useState } from 'react';

import { authService } from '@/src/features/authentication/services/auth.service';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    // TODO: Replace with useMutation + form validation.
    if (!email || !password) return;
    await authService.login(email, password);
  };

  return { email, setEmail, password, setPassword, onSubmit };
}
