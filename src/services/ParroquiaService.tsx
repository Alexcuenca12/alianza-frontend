import axios from "axios";

export class ParroquiaService {
    baseUrl = "http://localhost:8080/parroquia/";

    //Metodo para listar todas los horarios
    getAll() {
        return axios.get(this.baseUrl + "get").then((res) => res.data);
    }

    //Filtrar por Canton
    getBusqueda(id: number) {
        console.log(`${this.baseUrl}busqueda/${id}`)
        return axios.get(`${this.baseUrl}busqueda/${id}`).then((res) => res.data);
    }

    //Crear
    save(canton: any) {
        return axios.post(this.baseUrl + "post", canton).then((res) => res.data);
    }

    //(Eliminado lógico)
    delete(id: number) {
        return axios.delete(`${this.baseUrl}delete/${id}`).then((res) => res.data);
    }

    //Metodo para actualizar un horario basado en el id de la misma
    update(id: number, user: any) {
        return axios
            .put(this.baseUrl + "put/" + id.toString(), user)
            .then((res) => res.data);
    }
}