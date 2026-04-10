import { useState } from 'react';
import { authService } from '../services/auth.service';

export function useVerifyOtp() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const verifyOtp = async (code: string) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await authService.verifyOtp(code);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ. يرجى المحاولة مرة أخرى.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { verifyOtp, isLoading, error, success, setError };
}
