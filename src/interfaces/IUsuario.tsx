import { IPersona } from "./IPersona";
import { IRol } from "./IRol";
export interface IUsuario {
  idUsuario?: number;
  username: string;
  password: string;
  fechaRegistro: string | Date | Date[] | null;
  persona: IPersona | null;
  rol: IRol | null;
}
