import { IFichaPersonal } from "./IFichaPersonal";

export interface IFichaDesvinculacion {
  idFichaDesvinculacion?: number;
  fechaDesvinculacion: string;
  motivo: string;
  anexosExtras: string;
  fichaInscripcion: object | null;
  fichaPersonal: IFichaPersonal | null;
  fechaRegistro: string | Date | Date[] | null;

}
