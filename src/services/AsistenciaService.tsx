import axios from "axios";

export class AsistenciaService {
    baseUrl = "http://localhost:8080/asistencia/";

    getAll() {
        return axios.get(this.baseUrl + "get").then((res) => res.data);
    }
    buscarAsistencia(fecha: string, id: number) {
        // alert(fecha)
        return axios.get(`${this.baseUrl}buscarAsistencia?fecha=${fecha}&id=${id}`)
            .then((res) => res.data)
            .catch((error) => {
                // Manejo de errores aquí
                console.error('Error al buscar asistencia:', error);
            });
    }

    save(asistencia: any) {
        return axios.post(this.baseUrl + "post", asistencia).then((res) => res.data);
    }

    saveAll(asistencia: any[]) {
        return axios.post(this.baseUrl + "postList", asistencia).then((res) => res.data);
    }

    updateAll(asistencia: any[]) {
        return axios.put(this.baseUrl + "updateList", asistencia).then((res) => res.data);
    }

    delete(id: number) {
        return axios.delete(`${this.baseUrl}delete/${id}`).then((res) => res.data);
    }

    update(id: number, user: any) {
        return axios
            .put(this.baseUrl + "put/" + id.toString(), user)
            .then((res) => res.data);
    }
}
