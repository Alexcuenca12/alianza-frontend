export interface IFichaInscripcion {
    idFichaInscripcion?: number;
    fechaIngresoInscrip: string;
    fechaEgreso: string;
    proyectoInscrip: string;
    situacionIngresoInscrip: string;
    asistenciaInscrip: string;
    jornadaAsistenciaInscrip: string;
    fichaPersonal: object | null;
    curso: object | null;
}
