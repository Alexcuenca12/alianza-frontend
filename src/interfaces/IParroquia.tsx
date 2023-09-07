import { ICanton } from "./ICanton";

export interface IParroquia {
    idParroquia: number;
    parroquiaNombre: string;
    canton: ICanton; // Hacemos idCanton opcional

}
