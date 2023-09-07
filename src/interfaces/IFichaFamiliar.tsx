import { ITipoFamilia } from "./ITipoFamilia";

export interface IFichaFamiliar {
    idFichaFamiliar: number;
    visitaDomiciliar: boolean;
    jefaturaFamiliar: string;
    numIntegrantes: number;
    numAdultos: number;
    numNNA: number;
    numAdultosMayores: number;
    beneficioAdicional: string;
    organizacionBeneficio: string;
    discapacidadIntegrantes: boolean;
    otrasSituaciones: string;
    tipoFamilia: ITipoFamilia | null;
 
}

