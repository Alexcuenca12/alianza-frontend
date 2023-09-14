import axios from "axios";

export class EncargadoService {
  baseUrl = "http://localhost:8080/encargado/";

  getAll() {
    return axios.get(this.baseUrl + "get").then((res) => res.data);
  }
  save(encargado: any) {
    return axios.post(this.baseUrl + "post", encargado).then((res) => res.data);
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
