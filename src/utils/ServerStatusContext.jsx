import { createContext, useEffect, useRef, useState } from 'react';

const PING_INTERVAL_MS = 60 * 1000;
const PING_TIMEOUT_MS = 60 * 1000;

const ServerStatusContext = createContext(null);

function ServerStatusProvider({ children }) {
    const [isOnline, setIsOnline] = useState(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        const ping = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/health`, {
                    signal: controller.signal,
                });
                if (!cancelled) setIsOnline(response.ok);
            } catch {
                if (!cancelled) setIsOnline(false);
            } finally {
                clearTimeout(timeoutId);
            }
        };

        ping();
        intervalRef.current = setInterval(ping, PING_INTERVAL_MS);

        return () => {
            cancelled = true;
            clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <ServerStatusContext.Provider value={isOnline}>
            {children}
        </ServerStatusContext.Provider>
    );
}

export { ServerStatusContext, ServerStatusProvider };
