export const fileConverter = (file: File): Promise<string> => {
    return new Promise((resolve, reject)=>{
        const reader = new FileReader();
        console.log(file);
        // let blob = await fetch(file.name).then((r) => r.blob());
        reader.readAsDataURL(file);
        reader.onloadend = function () {
            const base64data = reader.result as string;
            console.log({dataType: typeof base64data, content: base64data});
            resolve(base64data);
        }
        reader.onerror = reject
    })
}
