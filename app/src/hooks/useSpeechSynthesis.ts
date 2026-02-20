import { useState, useEffect, useCallback } from 'react';

export function useSpeechSynthesis() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const loadVoices = () => {
            const vs = window.speechSynthesis.getVoices();
            setVoices(vs);
        };

        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const speak = useCallback((text: string, persona: 'Priya' | 'Arjun' | 'Vikram' | 'Karan' = 'Vikram') => {
        if (!text) return;

        // specific voice preferences per persona
        let preferredVoiceName = 'Google UK English Male'; // Default
        if (persona === 'Priya') preferredVoiceName = 'Google UK English Female';
        if (persona === 'Arjun') preferredVoiceName = 'Google US English Male';
        if (persona === 'Karan') preferredVoiceName = 'Google US English Male'; // or another male voice

        const utterance = new SpeechSynthesisUtterance(text);
        const voice = voices.find(v => v.name.includes(preferredVoiceName)) || voices[0];

        if (voice) utterance.voice = voice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [voices]);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    return { speak, stop, isSpeaking };
}
