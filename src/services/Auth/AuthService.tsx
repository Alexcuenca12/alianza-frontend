import { ApiResponse } from "../../interfaces/Auth/ApiResponse";
import { User } from "../../interfaces/Auth/UserL";
import { fasicellService } from "./FasicellService";

export class AuthService{
//El método login en la clase fasicellService se utiliza para 
// enviar una solicitud HTTP POST a la API con la ruta /signin y 
// un objeto User como datos. Devuelve una Promise que se resuelve 
// con un objeto ApiResponse o se rechaza con un error si la solicitud falla.
   public static async login(obj:User):Promise<ApiResponse>{
      return (await fasicellService.post('/signin', obj)).data
   }

}