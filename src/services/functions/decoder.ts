export const decoder = (base64Data: string, fileName: string) => {
    try {
        const base64WithoutHeader = base64Data.replace(/^data:.*,/, '');

        const decodedData = atob(base64WithoutHeader);
        const byteCharacters = new Uint8Array(decodedData.length);

        byteCharacters.forEach((element, index) => {
            byteCharacters[index] = decodedData.charCodeAt(index);
        });

        const byteArray = new Blob([byteCharacters], {type: 'application/pdf'});
        const fileUrl = URL.createObjectURL(byteArray);

        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(fileUrl);
    } catch (e) {
        console.error(e);
    }
}
