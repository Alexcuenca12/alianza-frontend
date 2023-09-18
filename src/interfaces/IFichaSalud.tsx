import { IFichaPersonal } from "./IFichaPersonal";

export interface IFichaSalud {
  idFichaSalud?: number;
  condicionesMedicas: string;
  pesoFichaSalud: number;
  tallaFichaSalud: number;
  discapacidadNNAFichaSalud: boolean;
  tipoDiscapacidadFichaSalud: string;
  porcentajeDiscapacidadFichaSalud: number;
  enfermedadesPrevalentesFichaSalud: string;
  fichaPersonal: IFichaPersonal | null;
}
