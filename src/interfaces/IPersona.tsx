import { IUsuario } from "./IUsuario";

export interface IPersona {
  idPersona?: number;
  apellidosPersona: string;
  nombresPersona: string;
  tipoIdentificacion: string;
  ciPasaporte: string;
}
