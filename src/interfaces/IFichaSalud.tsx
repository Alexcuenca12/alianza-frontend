import { IFichaPersonal } from "./IFichaPersonal";

export interface IFichaSalud {
  idFichaSalud?: number;
  condicionesMedicas: string;
  condicionesMedicas2: string;
  condicionesMedicas3: string;
  condicionesMedicas4: string;
  condicionesMedicas5: string;
  condicionesMedicasAdd: string;
  carnetDiscapacidad: boolean;//
  situacionPsicoemocional: string;//
  masaCorporal: number;//
  pesoFichaSalud: number;//
  tallaFichaSalud: number;//
  discapacidadNNAFichaSalud: boolean;//
  tipoDiscapacidadFichaSalud: string;//
  porcentajeDiscapacidadFichaSalud: number;//
  enfermedadesPrevalentesFichaSalud: string;//
  fichaPersonal: IFichaPersonal | null;//
  fechaRegistro: string | Date | Date[] | null;//

}
