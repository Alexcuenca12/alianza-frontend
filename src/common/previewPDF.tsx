import React from 'react';

const previewBase64PDF = (base64Data: string, fileName: string) => {
    // Crear una URL de datos a partir del base64
    const dataUri = base64Data;

    // Abrir una nueva pestaña
    const newTab = window.open();
    if (newTab) {
        // Crear un documento HTML con un iframe para mostrar el PDF
        const htmlContent = `
         <html>
           <head>
             <title>${fileName}</title>
           </head>
           <body>
             <iframe src="${dataUri}" width="100%" height="100%"></iframe>
           </body>
         </html>
       `;

        newTab.document.open();
        newTab.document.write(htmlContent);
        newTab.document.close();
    } else {
        alert("El navegador ha bloqueado la apertura de una nueva pestaña. Por favor, permite ventanas emergentes e intenta nuevamente.");
    }
};
//     console.log(base64Data)
//     // Crear una URL de datos a partir del base64
//     const dataUri = `${base64Data}`;
//     // Crear un nuevo documento HTML con el contenido del PDF
//     const htmlContent = `<html><head><title>${fileName}</title></head><body><embed width="100%" height="100%" src="${dataUri}" type="application/pdf"></body></html>`;

//     // Abrir una nueva pestaña con el contenido del HTML
//     const newTab = window.open();
//     if (newTab) {
//         newTab.document.open();
//         newTab.document.write(htmlContent);
//         newTab.document.close();
//     } else {
//         alert("El navegador ha bloqueado la apertura de una nueva pestaña. Por favor, permite ventanas emergentes e intenta nuevamente.");
//     }
// };

export default previewBase64PDF;