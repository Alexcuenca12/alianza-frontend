import { ICurso } from "./ICurso";
import { IFichaInscripcion } from "./IFichaInscripcion";

export interface IAsistencia {
    idAsistencia?: number;
    fechaAsistencia: string;
    estadoAsistencia: boolean;
    observacionesAsistencia: string;
    fichaInscripcion: IFichaInscripcion | null;
    curso: ICurso | null;
}