import React from 'react';
import useCountdown from '../hooks/useCountdown';

const DealTimer = ({ endTime, size = 'sm' }) => {
    const { hours, minutes, seconds, isExpired, isUrgent } = useCountdown(endTime);

    if (isExpired) return <span className="text-gray-400">Deal Expired</span>;

    const sizeClass = size === 'lg' ? 'text-[1.2rem] gap-2' : 'text-[0.82rem] gap-1';
    const colorClass = isUrgent ? 'text-red-600' : 'text-gray-700';

    return (
        <div className={`flex items-center font-mono ${sizeClass} ${colorClass}`}>
            <span className="bg-gray-100 p-1 rounded px-2">{hours}</span>
            <span>:</span>
            <span className="bg-gray-100 p-1 rounded px-2">{minutes}</span>
            <span>:</span>
            <span className="bg-gray-100 p-1 rounded px-2">{seconds}</span>
        </div>
    );
};

export default DealTimer;
