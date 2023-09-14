import { IPersona } from "./IPersona";
export interface ISecretaria {
  idSecretaria?: number;
  actividadesSecretaria: string;
  horarioSecretaria: string;
  persona: IPersona | null;
}
