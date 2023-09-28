import { IEtnia } from "./IEtnia";
import { IParroquia } from "./IParroquia";
import { IRangoEdad } from "./IRangoEdad";

export interface IFichaPersonal {
    idFichaPersonal: number;
    foto: string;
    apellidos: string;
    nombres: string;
    ciIdentidad: string;
    nacionalidad: string;
    fechaNacimiento: string;
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

}

