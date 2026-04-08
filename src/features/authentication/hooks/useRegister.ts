import { SignUpWithPasswordCredentials } from '@supabase/supabase-js';
import { useState } from 'react';
import { authService } from '../services/auth.service';

export function useRegister() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const register = async (credentials: SignUpWithPasswordCredentials, fullName?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.signUp(credentials, fullName);
        } catch (err: any) {
            setError(err.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { register, isLoading, error };
}
