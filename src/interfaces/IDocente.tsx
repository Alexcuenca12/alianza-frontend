import { IPersona } from "./IPersona";
export interface IDocente {
  idDocente?: number;
  tituloDocente: string;
  materiaDocente: string;
  persona: IPersona | null;
}
