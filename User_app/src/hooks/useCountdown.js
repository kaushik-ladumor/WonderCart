import { useState, useEffect } from 'react';

const useCountdown = (endTime) => {
    const [timeLeft, setTimeLeft] = useState({
        hours: '00',
        minutes: '00',
        seconds: '00',
        isExpired: false,
        isUrgent: false
    });

    useEffect(() => {
        if (!endTime) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(endTime).getTime() - now;

            if (distance < 0) {
                setTimeLeft({
                    hours: '00',
                    minutes: '00',
                    seconds: '00',
                    isExpired: true,
                    isUrgent: false
                });
                clearInterval(timer);
                return;
            }

            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft({
                hours: String(h).padStart(2, '0'),
                minutes: String(m).padStart(2, '0'),
                seconds: String(s).padStart(2, '0'),
                isExpired: false,
                isUrgent: distance < (1000 * 60 * 60) // less than 1 hour
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    return timeLeft;
};

export default useCountdown;
