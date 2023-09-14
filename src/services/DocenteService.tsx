import axios from "axios";

export class DocenteService {
  baseUrl = "http://localhost:8080/docente/";

  getAll() {
    return axios.get(this.baseUrl + "get").then((res) => res.data);
  }
  save(docente: any) {
    return axios.post(this.baseUrl + "post", docente).then((res) => res.data);
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
