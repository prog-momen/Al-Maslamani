import { useState } from 'react';
import { authService } from '../services/auth.service';

export function useLogin() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (credentials: { email: string; password: string }) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await authService.signIn(credentials);
            return data;
        } catch (err: any) {
            setError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { login, isLoading, error };
}
