import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

const AuthContext = createContext({});



export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        const getSession = async () => {
            console.log('AuthContext: Initializing session check...');
            const hasUser = !!localStorage.getItem('user');
            const hasToken = !!localStorage.getItem('access_token');
            console.log(`AuthContext: LocalStorage status: user=${hasUser}, token=${hasToken}`);

            try {
                // 1. Check Supabase Session
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Error checking session:", error);
                }

                if (data?.session?.user) {
                    setUser(data.session.user);
                } else {
                    // 2. Check LocalStorage (Bypass Mode)
                    const localUser = localStorage.getItem('user');
                    // Relaxed check: valid user in storage is enough
                    if (localUser) {
                        try {
                            const parsedUser = JSON.parse(localUser);
                            const token = localStorage.getItem('access_token');
                            if (!token) {
                                console.warn("AuthContext: User found but access_token MISSING. Clearing state to force re-login.");
                                signOut();
                            } else {
                                setUser(parsedUser);
                                console.log("AuthContext: Bypass user & token restored successfully.");
                            }
                        } catch (e) {
                            console.error("Error parsing local user:", e);
                            signOut();
                        }
                    }
                }
            } catch (err) {
                console.error("Unexpected error in AuthContext:", err);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`AuthContext: onAuthStateChange event: ${event}`);
            if (session?.user) {
                setUser(session.user);
            } else {
                // Check local storage again on auth change (e.g. logout)
                const localUser = localStorage.getItem('user');
                if (localUser) {
                    try {
                        setUser(JSON.parse(localUser));
                    } catch (e) {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            }
            setLoading(false);
        });

        const handleForceLogout = () => {
            console.warn("AuthContext: Force logout event received!");
            signOut();
            toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
        };

        window.addEventListener('auth:logout', handleForceLogout);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('auth:logout', handleForceLogout);
        };
    }, []);

    const signIn = async (data) => {
        return supabase.auth.signInWithPassword(data);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('bypass_mode');
        setUser(null);
    };

    // Helper to manually set user and token (for bypass mode login)
    const setBypassAuth = (userData, token) => {
        setUser(userData);
        if (token) localStorage.setItem('access_token', token);
        if (userData) localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('bypass_mode', 'true');
    };

    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn,
        signOut,
        setBypassAuth, // Export this!
        user,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
                        <p className="text-sm font-medium text-slate-400 dark:text-slate-500 animate-pulse">Đang kiểm tra phiên làm việc...</p>
                    </div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    // Safety check just in case, though useContext usually returns default value if provider missing
    return context;
};
