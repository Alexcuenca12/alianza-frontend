export interface IFichaRepresentante {
  idFichaRepresentante?: number;
  nombresRepre: string;
  apellidosRepre: string;
  cedulaRepre: string;
  contactoRepre: string;
  contactoEmergenciaRepre: string;
  fechaNacimientoRepre: string;
  ocupacionPrimariaRepre: string;
  ocupacionSecundariaRepre: string;
  lugarTrabajoRepre: string;
  observacionesRepre: string;
  nivelInstruccionRepre: string;
  parentescoRepre: string;
  fichaInscripcion: object | null;
}
