import { IFichaEducativa } from "./IFichaEducativa";
import { ITipoAnexo } from "./TipoAnexo";

export interface IAnexoEducativo {
  idAnexoEducativo: number;
  documentoAnexo: string;
  otroTipoAnexo: string;
  fechaCarga: string;
  fichaEducativa: IFichaEducativa | null;
  tipoAnexo: ITipoAnexo | null;
}
