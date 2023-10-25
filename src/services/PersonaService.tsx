import axios, { AxiosInstance } from "axios";

const API_BASE_URL = "http://localhost:8080/persona/";
export class PersonaService {

  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
    });
  }

  getAll() {
    return this.api.get("get").then((res) => res.data);
  }
  save(persona: any) {
    return this.api.post("post", persona).then((res) => res.data);
  }

  existsDNI(dni: string) {
    //Método para listar todas los Usuarios
    return this.api.get(`existsDNI?dni=${dni}`).then((res) => res.data);
  }

  delete(id: number) {
    // console.log(`${this.baseUrl}delete/${id}`)
    return this.api.delete(`delete/${id}`).then((res) => res.data);
  }

  update(id: number, user: any) {
    return this.api
      .put("put/" + id, user)
      .then((res) => res.data);
  }
}
