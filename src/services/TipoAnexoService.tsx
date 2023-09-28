import axios from "axios";

export class TipoAnexoService {
  baseUrl = "http://localhost:8080/tipoAnexo/";

  get() {
    return axios.get(this.baseUrl + "get").then((res) => res.data);
  }
}
