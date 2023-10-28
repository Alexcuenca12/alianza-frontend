import { IFichaDesvinculacion } from "./IFichaDesvinculacion";
import { IFichaEducativa } from "./IFichaEducativa";
import { IFichaFamiliar } from "./IFichaFamiliar";
import { IFichaInscripcion } from "./IFichaInscripcion";
import { IFichaPersonal } from "./IFichaPersonal";
import { IFichaRepresentante } from "./IFichaRepresentante";
import { IFichaSalud } from "./IFichaSalud";

export interface IReporte {
    fichaPersonal?: IFichaPersonal;
    fichaDesvinculacion?: IFichaDesvinculacion;
    fichaEducativa?: IFichaEducativa;
    fichaFamiliar?: IFichaFamiliar;
    fichaInscripcion?: IFichaInscripcion;
    fichaRepresentante?: IFichaRepresentante;
    fichaSalud?: IFichaSalud;
}
