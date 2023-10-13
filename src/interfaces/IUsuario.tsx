import { IPersona } from "./IPersona";
import { IRol } from "./IRol";
export interface IUsuario {
  idUsuario?: number;
  username: string;
  password: string;
  persona: IPersona | null;
  rol: IRol | null;
}
