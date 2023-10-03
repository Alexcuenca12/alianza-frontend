import axios from "axios";

export class FichaFamiliarService {
    baseUrl = "http://localhost:8080/fichaFamiliar/";

    //Metodo para listar todas los horarios
    getAll() {
        return axios.get(this.baseUrl + "get").then((res) => res.data);
    }

    getBusquedaID(id: number) {
        return axios.get(`${this.baseUrl}busquedaID/${id}`).then((res) => res.data);
    }

    //Crear
    save(publicacion: any) {
        publicacion.beneficioAdicional = publicacion.beneficioAdicional || 'N/A'
        publicacion.organizacionBeneficio = publicacion.organizacionBeneficio || 'N/A'
        publicacion.otrasSituaciones = publicacion.otrasSituaciones || 'N/A'
        return axios.post(this.baseUrl + "post", publicacion).then((res) => res.data);
    }

    //(Eliminado lógico)
    delete(id: number) {
        return axios.delete(`${this.baseUrl}delete/${id}`).then((res) => res.data);
    }

    //Metodo para actualizar un horario basado en el id de la misma
    update(id: number, user: any) {
        user.beneficioAdicional = user.beneficioAdicional || 'N/A'
        user.organizacionBeneficio = user.organizacionBeneficio || 'N/A'
        user.otrasSituaciones = user.otrasSituaciones || 'N/A'
        return axios
            .put(this.baseUrl + "put/" + id.toString(), user)
            .then((res) => res.data);
    }
}