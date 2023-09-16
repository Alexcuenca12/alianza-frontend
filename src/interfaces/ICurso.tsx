export interface ICurso {
    idCurso?: number;
    nombreCurso: string;
    fechaInicio: string;
    fechaFin: string;
    estadoCurso: boolean;
    rangoEdad: object | null;
    docente: object | null;
}