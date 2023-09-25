import axios from "axios";

export class CursoService {
    baseUrl = "http://localhost:8080/curso/";

    getAll() {
        return axios.get(this.baseUrl + "get").then((res) => res.data);
    }

    getAllDocente(id:number) {
        return axios.get(this.baseUrl + `getCurso/${id}`).then((res) => res.data);
    }


    save(curso: any) {
        return axios.post(this.baseUrl + "post", curso).then((res) => res.data);
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
