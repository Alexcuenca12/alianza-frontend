export interface IFichaDesvinculacion {
  idFichaDesvinculacion?: number;
  fechaDesvinculacion: string;
  motivo: string;
  anexosExtras: string;
  fichaInscripcion: object | null;
}
