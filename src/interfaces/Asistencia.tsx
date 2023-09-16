export interface Asistencia {
    idAsistencia: number;
    fechaAsistencia: string;
    estadoAsistencia: false;
    observacionesAsistencia: string;
    fichaInscripcion: object | null;
    curso: object | null;
}