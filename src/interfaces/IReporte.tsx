export interface IReporte {
    ficha: string;
    idFichaPersonal: number;
    actTrabInfantil: string;
    apellidos: string;
    barrioSector: string;
    ciPasaporte: string;
    coordenadaX: number;
    coordenadaY: number;
    detalleActTrabInfantil: string;
    direccion: string;
    estVinculacion: string;
    fechaNacimiento: string;
    fechaRegistroFichaPersonal: string;
    foto: string;
    genero: string;
    idEtnia: number;
    idParroquia: number;
    idRangoEdad: number;
    nacionalidad: string;
    nombres: string;
    referencia: string;
    tipoIdentificacion: string;
    zona: string;

    idFichaInscripcion: number;
    asistenciaInscripcion: string;
    fechaIngresoInscripcion: string;
    fechaRegistroFichaInscripcion: string;
    jornadaAsistenciaInscripcion: string;
    proyectoInscripcion: string;
    situacionIngresoInscripcion: string;
    idCurso: number;

    idFichaRepresentante: number;
    apellidosRepresentante: string;
    cedulaRepresentante: string;
    contactoEmergenciaRepresentante: string;
    contactoRepresentante: string;
    fechaNacimientoRepresentante: string;
    fechaRegistroFichaRepresentante: string;
    generoRepresentante: string;
    lugarTrabajoRepresentante: string;
    nacionalidadRepresentante: string;
    nivelInstruccionRepresentante: string;
    nombresRepresentante: string;
    observacionesRepresentante: string;
    ocupacionPrimariaRepresentante: string;
    ocupacionSecundariaRepresentante: string;
    parentescoRepresentante: string;
    tipoIdentificacionRepresentante: string;

    idFichaSalud: number;
    carnetDiscapacidad: string;
    condicionesMedicas: string;
    condicionesMedicas2: string;
    condicionesMedicas3: string;
    condicionesMedicas4: string;
    condicionesMedicas5: string;
    condicionesMedicasAdd: string;
    discapacidadNNAFichaSalud: string;
    enfermedadesPrevalentesFichaSalud: string;
    fechaRegistroFichaSalud: string;
    masaCorporal: number;
    pesoFichaSalud: number;
    porcentajeDiscapacidadFichaSalud: number;
    situacionPsicoemocional: string;
    tallaFichaSalud: number;
    tipoDiscapacidadFichaSalud: string;

    idFichaFamiliar: number;
    beneficio: string;
    beneficioAdicional: string;
    detalleDiscapacidad: string;
    discapacidadIntegrantes: string;
    fechaRegistroFichaFamiliar: string;
    jefaturaFamiliar: string;
    numAdultos: number;
    numAdultosMayores: number;
    numIntegrantes: number;
    numNNA: number;
    organizacionBeneficio: string;
    otrasSituaciones: string;
    visitaDomiciliaria: string;
    idTipoFamilia: number;

    idFichaEducativa: number;
    centroEducativo: string;
    detalleRepitente: string;
    direccionEducativa: string;
    fechaRegistroFichaEducativa: string;
    gradoEducativo: string;
    jornadaEducativa: string;
    observacionesEducativa: string;
    referenciaEducativa: string;
    repitente: string;
    situacionPsicopedagogica: string;

    idFichaDesvinculacion: number;
    fechaDesvinculacion: string;
    fechaRegistroFichaDesvinculacion: string;
    motivoDesvinculacion: string;

    // Campos adicionales
    etniaNombre: string;
    parroquiaNombre: string;
    cantonNombre: string;
    provinciaNombre: string;
    limInferior: number;
    limSuperior: number;

    // Campos de FichaInscripcion
    fechaInicioCurso: string;
    fechaRegistroCurso: string;
    nombreCurso: string;
    username: string;
    nombresPersona: string;
    apellidosPersona: string;
    tipoIdentificacionPersona: string;
    ciPasaportePersona: string;
    limInferiorRec: number;
    limSuperiorRec: number;

    // Campos de FichaFamiliar
    nombreTipoFamilia: string;
}
