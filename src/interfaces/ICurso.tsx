import { IUsuario } from "./IUsuario";
import { IRangoEdad } from "./IRangoEdad";

export interface ICurso {
    idCurso?: number;
    nombreCurso: string;
    fechaInicio: string | Date;
    rangoEdad: IRangoEdad | null;
    docente: IUsuario | null;
    fechaRegistro: string | Date | Date[] | null;

}
