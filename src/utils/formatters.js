export const formatUptime = (startTime) => {
    if (!startTime) return 'n/a';
    const now = Date.now();
    const diff = now - startTime;

    if (diff < 0) return '0m';

    const millisecondsInDay = 1000 * 60 * 60 * 24;
    const millisecondsInHour = 1000 * 60 * 60;
    const millisecondsInMinute = 1000 * 60;

    const days = Math.floor(diff / millisecondsInDay);
    const hours = Math.floor((diff % millisecondsInDay) / millisecondsInHour);
    const minutes = Math.floor((diff % millisecondsInHour) / millisecondsInMinute);

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m`;

    return result.trim() || '0m';
};

export const toReadableTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('id-ID');
};