'use client';

import { useState, useEffect } from 'react';
import styles from './InstallPrompt.module.css';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        // Check if user has dismissed the prompt before
        const dismissed = localStorage.getItem('install-prompt-dismissed');
        if (dismissed) {
            return;
        }

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt after a short delay
            setTimeout(() => setShowPrompt(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('install-prompt-dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className={styles.installPrompt}>
            <div className={styles.promptContent}>
                <div className={styles.promptIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                </div>
                <div className={styles.promptText}>
                    <h3>Install WorkTime</h3>
                    <p>Install this app on your device for quick access and offline use</p>
                </div>
                <div className={styles.promptActions}>
                    <button onClick={handleInstall} className={styles.installBtn}>
                        Install
                    </button>
                    <button onClick={handleDismiss} className={styles.dismissBtn}>
                        Not now
                    </button>
                </div>
            </div>
        </div>
    );
}
