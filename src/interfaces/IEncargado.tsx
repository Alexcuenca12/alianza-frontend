import { IPersona } from "./IPersona";
export interface IEncargado {
  idEncargado?: number;
  actividadesEncargado: string;
  horarioEncargado: string;
  persona: IPersona | null;
}
