export interface IFichaEducativa {
  idFichaEducativa?: number;
  centroEducativo: string;
  direccionEducativa: string;
  referenciaEducativa: string;
  jornadaEducativa: string;
  observacionesEducativa: string;
  gradoEducativo: string;
  fichaInscripcion: object | null;
}
