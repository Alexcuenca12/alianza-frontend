import { ICurso } from "./ICurso";
import { IFichaPersonal } from "./IFichaPersonal";

export interface IFichaInscripcion {
  idFichaInscripcion?: number;
  fechaIngresoInscrip: string;
  proyectoInscrip: string;
  situacionIngresoInscrip: string;
  asistenciaInscrip: string;
  jornadaAsistenciaInscrip: string;
  fichaPersonal: IFichaPersonal | null;
  curso: ICurso | null;
  fechaRegistro: string | Date | Date[] | null;
  anexosFichaSocioEconomica: string;
}
