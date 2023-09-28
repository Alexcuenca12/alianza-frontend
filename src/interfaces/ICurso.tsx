import { IDocente } from "./IDocente";
import { IRangoEdad } from "./IRangoEdad";

export interface ICurso {
    idCurso?: number;
    nombreCurso: string;
    fechaInicio: string;
    estadoCurso: boolean;
    rangoEdad: IRangoEdad | null; // Cambiar 'object' a 'IRangoEdad'
    docente: IDocente | null; // Cambiar 'object' a 'IDocente'
}
