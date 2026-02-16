'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AccessCodePage() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();

            if (data.success) {
                router.push(callbackUrl);
                router.refresh();
            } else {
                setError(data.message || 'Incorrect access code');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] p-4">
            <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#238636] bg-opacity-10 text-[#238636] rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Protected</h1>
                    <p className="text-[#8b949e]">Please enter the access code to continue to the dashboard.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            placeholder="Enter Access Code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full bg-[#0d1117] border border-[#30363d] text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#238636] focus:border-transparent outline-none transition-all placeholder:text-[#484f58] text-center text-xl tracking-widest"
                            autoFocus
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-2 px-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Verifying...
                            </>
                        ) : (
                            'Unlock Dashboard'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[#484f58] text-xs">
                        Hotel Lending Management System
                    </p>
                </div>
            </div>
        </div>
    );
}
