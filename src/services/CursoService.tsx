import axios from "axios";

export class CursoService {
    baseUrl = "http://localhost:8080/curso/";

    getAll() {
        return axios.get(this.baseUrl + "get").then((res) => res.data);
    }

    cursoByUser(id: number) {
        return axios.get(this.baseUrl + `cursoByUser?id=${id}`).then((res) => res.data);
    }

    busquedaCurso(busqueda: string) {
        busqueda = busqueda.trim();
        busqueda = busqueda || "NA";

        return axios.get(this.baseUrl + `busquedaCurso/${busqueda}`).then((res) => res.data);
    }

    existsByNombreCurso(nombreCurso: string) {
        //Método para listar todas los Usuarios
        return axios.get(`${this.baseUrl}existsByNombreCurso/${nombreCurso}`).then((res) => res.data);
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
