import { IFichaPersonal } from "./IFichaPersonal";

export interface IFichaEducativa {
  idFichaEducativa?: number;
  centroEducativo: string;
  direccionEducativa: string;
  referenciaEducativa: string;
  repitente: boolean;
  detalleRepitente: string;
  situacionPsicopedagogica: string;
  jornadaEducativa: string;
  observacionesEducativa: string;
  gradoEducativo: string;
  fichaPersonal: IFichaPersonal | null;
  fechaRegistro: string | Date | Date[] | null;

}
