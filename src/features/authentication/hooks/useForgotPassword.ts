import { useState } from 'react';
import { authService } from '../services/auth.service';

export function useForgotPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const forgotPassword = async (emailOrPhone: string) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await authService.forgotPassword(emailOrPhone);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ. يرجى المحاولة مرة أخرى.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { forgotPassword, isLoading, error, success, setError };
}
