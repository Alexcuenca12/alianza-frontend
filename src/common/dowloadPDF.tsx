import React from 'react';
import swal from "sweetalert";

const dowloadBase64 = (base64Data: string, fileName: string, tipo: string) => {
    try {
        // Eliminar encabezados o metadatos de la cadena base64
        const base64WithoutHeader = base64Data.replace(/^data:.*,/, "");

        const decodedData = atob(base64WithoutHeader); // Decodificar la cadena base64
        const byteCharacters = new Uint8Array(decodedData.length);

        for (let i = 0; i < decodedData.length; i++) {
            byteCharacters[i] = decodedData.charCodeAt(i);
        }

        const byteArray = new Blob([byteCharacters], { type: "application/pdf" });
        const fileUrl = URL.createObjectURL(byteArray);

        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName + '.pdf';
        link.click();
        swal({
            title: tipo,
            text: "Descargando pdf....",
            icon: "success",
            timer: 3000,
        });
        console.log("pdf descargado...");

        URL.revokeObjectURL(fileUrl);
    } catch (error) {
        console.error("Error al decodificar la cadena base64:", error);
    }
};

export default dowloadBase64;