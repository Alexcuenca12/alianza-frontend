import axios from "axios";

export class PersonaService {
  baseUrl = "http://localhost:8080/persona/";

  getAll() {
    return axios.get(this.baseUrl + "get").then((res) => res.data);
  }
  save(persona: any) {
    return axios.post(this.baseUrl + "post", persona).then((res) => res.data);
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
