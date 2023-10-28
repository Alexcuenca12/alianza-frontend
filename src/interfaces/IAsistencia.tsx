import { Nullable } from "primereact/ts-helpers";
import { ICurso } from "./ICurso";
import { IFichaInscripcion } from "./IFichaInscripcion";

export interface IAsistencia {
    idAsistencia?: number;
    fechaAsistencia: Nullable<string | Date | Date[]>;//
    estadoAsistencia: boolean;
    observacionesAsistencia: string;
    fichaInscripcion: IFichaInscripcion | null;
    curso: ICurso | null;//
}