export interface IFichaSalud {
  idFichaSalud?: number;
  condicionesMedicas: string;
  pesoFichaSalud: number;
  tallaFichaSalud: number;
  discapacidadNNAFichaSalud: boolean;
  tipoDiscapacidadFichaSalud: string;
  porcentajeDiscapacidadFichaSalud: number;
  enfermedadesPrevalentesFichaSalud: string;
  fichaPersonal: object | null;
}
