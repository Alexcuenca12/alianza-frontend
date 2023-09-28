import axios from "axios";
import { IFichaSalud } from "../interfaces/IFichaSalud";

export class FichaSaludService {
  baseUrl = "http://localhost:8080/fichaSalud/";

  //Metodo para listar todas los horarios
  getAll() {
    return axios.get(this.baseUrl + "get").then((res) => res.data);
  }
  getBusquedaID(id: number) {
    return axios.get(`${this.baseUrl}busquedaID/${id}`).then((res) => res.data);
  }
  //Crear
  save(publicacion: IFichaSalud) {

    publicacion.condicionesMedicas = publicacion.condicionesMedicas || 'N/A';
    publicacion.enfermedadesPrevalentesFichaSalud = publicacion.enfermedadesPrevalentesFichaSalud || 'N/A';
    publicacion.tipoDiscapacidadFichaSalud = publicacion.tipoDiscapacidadFichaSalud || 'N/A';

    console.log({ publicacion })

    return axios.post(this.baseUrl + "post", publicacion).then((res) => res.data);
  }

  //(Eliminado lógico)
  delete(id: number) {
    return axios.delete(`${this.baseUrl}delete/${id}`).then((res) => res.data);
  }
  //Metodo para actualizar un horario basado en el id de la misma
  update(id: number, user: any) {

    user.condicionesMedicas = user.condicionesMedicas || 'N/A';
    user.enfermedadesPrevalentesFichaSalud = user.enfermedadesPrevalentesFichaSalud || 'N/A';
    user.tipoDiscapacidadFichaSalud = user.tipoDiscapacidadFichaSalud || 'N/A';
    return axios
      .put(this.baseUrl + "put/" + id.toString(), user)
      .then((res) => res.data);
  }
}