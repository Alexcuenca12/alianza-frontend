import axios from "axios";

export class AsistenciaService {
    baseUrl = "http://localhost:8080/asistencia/";

    getAll() {
        return axios.get(this.baseUrl + "get").then((res) => res.data);
    }

    save(asistencia: any) {
        return axios.post(this.baseUrl + "post", asistencia).then((res) => res.data);
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
