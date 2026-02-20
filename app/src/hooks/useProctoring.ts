import { useEffect } from 'react';
import { Socket } from 'socket.io-client';

interface UseProctoringProps {
    socket: Socket | null;
    sessionId: string;
    active: boolean;
}

export function useProctoring({ socket, sessionId, active }: UseProctoringProps) {
    useEffect(() => {
        if (!socket || !active || !sessionId) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                socket.emit('integrity_event', {
                    sessionId,
                    type: 'tab_switch',
                    timestamp: Date.now()
                });
            }
        };

        const handleBlur = () => {
            socket.emit('integrity_event', {
                sessionId,
                type: 'window_blur',
                timestamp: Date.now()
            });
        };

        const handlePaste = (e: ClipboardEvent) => {
            // We don't block paste, but we log the length
            const text = e.clipboardData?.getData('text') || '';
            if (text.length > 50) {
                socket.emit('integrity_event', {
                    sessionId,
                    type: 'paste',
                    length: text.length,
                    timestamp: Date.now()
                });
            }
        };

        // Attach listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('paste', handlePaste);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('paste', handlePaste);
        };
    }, [socket, sessionId, active]);
}
