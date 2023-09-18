import { ICurso } from "./ICurso";
import { IFichaPersonal } from "./IFichaPersonal";

export interface IFichaInscripcion {
    idFichaInscripcion?: number;
    fechaIngresoInscrip: string;
    fechaEgreso: string;
    proyectoInscrip: string;
    situacionIngresoInscrip: string;
    asistenciaInscrip: string;
    jornadaAsistenciaInscrip: string;
    fichaPersonal: IFichaPersonal | null;
    curso: ICurso | null;
}
