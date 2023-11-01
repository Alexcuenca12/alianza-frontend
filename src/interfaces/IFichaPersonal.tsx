import { IEtnia } from "./IEtnia";
import { IParroquia } from "./IParroquia";
import { IRangoEdad } from "./IRangoEdad";

export interface IFichaPersonal {
    idFichaPersonal: number;
    foto: string;
    apellidos: string;
    nombres: string;
    tipoIdentificacion: string;
    ciPasaporte: string;
    nacionalidad: string;
    actTrabInfantil: boolean;
    detalleActTrabInfantil: string;
    fechaNacimiento: string | Date;
    rangoEdad: IRangoEdad | null;
    genero: string;
    etnia: IEtnia | null;
    parroquia: IParroquia | null;
    zona: string;
    barrioSector: string;
    direccion: string;
    referencia: string;
    coordenadaX: number;
    coordenadaY: number;
    estVinculacion: boolean;
    fechaRegistro: string | Date | Date[] | null;
    anexosCedula: string;
    anexosDocumentosLegales: string;

}

