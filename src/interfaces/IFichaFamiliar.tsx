import { IFichaPersonal } from "./IFichaPersonal";
import { ITipoFamilia } from "./ITipoFamilia";

export interface IFichaFamiliar {
    idFichaFamiliar: number;
    visitaDomiciliaria: boolean;
    jefaturaFamiliar: string;
    numIntegrantes: number;
    numAdultos: number;
    numNNA: number;
    numAdultosMayores: number;
    beneficioAdicional: string;
    organizacionBeneficio: string;
    discapacidadIntegrantes: boolean;
    beneficio: boolean;
    detalleDiscapacidad: string;
    otrasSituaciones: string;
    tipoFamilia: ITipoFamilia | null;
    fichaPersonal: IFichaPersonal | null;
    fechaRegistro: string | Date | Date[] | null;


}

