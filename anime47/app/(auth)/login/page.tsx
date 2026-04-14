'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSettings } from '@/components/providers/SettingsProvider';

export default function LoginPage() {
    const { settings } = useSettings();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const primaryColor = settings.theme.primaryColor || '#d32f2f';

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const res = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (res?.error) {
                setError('Email hoặc mật khẩu không chính xác');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi đăng nhập');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 animate-fadeIn">
                <div className="text-center">
                    <h2 className="mt-6 text-4xl font-black text-white tracking-tight">
                        Chào mừng <span className="text-primary" style={{ color: primaryColor }}>trở lại</span>
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Đăng nhập để tiếp tục xem hành trình của bạn
                    </p>
                </div>

                <div className="bg-[#111216] border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-40 h-40 bg-primary/20 blur-[80px] rounded-full" style={{ backgroundColor: `${primaryColor}22` }}></div>
                    
                    <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <span>✅</span> {success}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                    Email của bạn
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="block w-full px-4 py-3.5 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2 ml-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Mật khẩu
                                    </label>
                                    <Link href="#" className="text-xs font-bold text-primary hover:brightness-125 transition-all" style={{ color: primaryColor }}>
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full px-4 py-3.5 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative group"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <span className="relative z-10">{isLoading ? 'Đang xác thực...' : 'Đăng nhập ngay'}</span>
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                            </button>
                        </div>

                        <div className="text-center text-sm">
                            <span className="text-gray-500 font-medium">Bạn chưa có tài khoản? </span>
                            <Link href="/register" className="font-bold text-primary hover:brightness-125 transition-all" style={{ color: primaryColor }}>
                                Đăng ký thành viên
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
