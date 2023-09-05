import axios from "axios";
import { environment } from "../../environments/environment";

// Aquí se está definiendo una clase fasicellService 
// que proporciona métodos para realizar solicitudes 
// HTTP a una API utilizando la biblioteca axios.
export class fasicellService {
   // La clase utiliza una propiedad estática baseUrl que se define a partir 
   // de la constante environment.baseUrl. environment es un objeto que contiene 
   // las variables de entorno utilizadas en la aplicación, y baseUrl es una de 
   // esas variables. La propiedad baseUrl se utiliza para construir la URL completa 
   // de la API en las solicitudes HTTP.
  static baseUrl = environment.baseUrl;
//   El método post utiliza axios.post para enviar una solicitud POST 
//   a la API con los datos proporcionados en el objeto obj. El método 
//   devuelve una Promise que se resolverá con los datos de la respuesta 
//   de la API o se rechazará con un error si la solicitud falla.
  public static post(path: string, obj: any): Promise<any> {
    return axios.post(this.baseUrl + path, obj);
  }
//   El método get utiliza axios.get para enviar una solicitud GET a la API 
//   con la ruta del endpoint proporcionada en path. El método devuelve una 
//   Promise que se resolverá con los datos de la respuesta de la API o se 
//   rechazará con un error si la solicitud falla.
  public static get(path: string): Promise<any> {
    return axios.get(this.baseUrl + path);
  }
}
