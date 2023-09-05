export function formatDate(datetime: string | Date): string {
    if (typeof datetime === 'string') {
        const dateObject = new Date(datetime);
        const day = dateObject.getDate().toString().padStart(2, '0');
        const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObject.getFullYear().toString();
        return `${day}-${month}-${year}`;
    }
    return '';
}
