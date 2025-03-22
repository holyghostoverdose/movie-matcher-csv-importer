export const formatDate = (date: Date, format: string): string => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const generateUniqueId = (): string => {
    return 'id-' + Math.random().toString(36).substr(2, 9);
};

export const parseCSV = (data: string): string[][] => {
    return data.split('\n').map(row => row.split(','));
};