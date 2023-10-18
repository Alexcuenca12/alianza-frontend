import axios from "axios";

export class UserService {
  //url base para el componente usuario, esta url se encuentra expresada
  //en la api
  baseUrl = "http://localhost:8080/api/usuario/";

  getAll() {
    //Método para listar todas los Usuarios
    return axios.get(this.baseUrl + "read").then((res) => res.data);
  }

  existsUsername(username: string) {
    //Método para listar todas los Usuarios
    return axios.get(`${this.baseUrl}exists-username/${username}`).then((res) => res.data);
  }


  save(user: any) {
    //Método para guardar Usuarios

    return axios.post(this.baseUrl + "signup", user).then((res) => res.data);
  }
  //Método para cambiar el estado enabled a false de un Usuario (Eliminado lógico)
  delete(userId: number) {
    return axios.put(`${this.baseUrl}delete/${userId}`);
  }


  //Método para actualizar un usuario basado en el id del mismo
  update(id: number, user: any) {
    return axios
      .put(this.baseUrl + "update/" + id, user)
      .then((res) => res.data);
  }

  filtroUser(busq: string, rol: number) {
    busq = busq || "NA";
    rol = rol || 0;
    return axios
      .get(`${this.baseUrl}filtroUser/${busq}/${rol}`)
      .then((res) => res.data);
  }

  userXrol(rol: number) {
    rol = rol || 0;
    return axios
      .get(`${this.baseUrl}userXrol/${rol}`)
      .then((res) => res.data);
  }
}
