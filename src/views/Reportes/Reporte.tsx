import React, { useEffect, useState, useRef } from "react";

import { Card } from "primereact/card";
import { Fieldset } from "primereact/fieldset";
import cardHeader from "../../shared/CardHeader";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { string } from "yup";
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { RangoEdadService } from "../../services/RangoEdadService";
import { IRangoEdad } from "../../interfaces/IRangoEdad";
import { AiFillPrinter } from "react-icons/ai";
import swal from "sweetalert";

import { PiFileXlsFill } from "react-icons/pi";
import { IFichaPersonal } from "../../interfaces/IFichaPersonal";
import { FichaPersonalService } from "../../services/FichaPersonalService";
import { IBusquedaReporte } from "../../interfaces/IBusquedaReporte";
import '../../styles/Reporte.css'
import * as XLSX from 'xlsx';
import { Divider } from "primereact/divider";
import toast, { Toaster } from "react-hot-toast";
import { IExcelReportParams, IHeaderItem } from "../../interfaces/IExcelReportParams";
import { calcularEdad } from "../../services/functions/calcularEdad";
import { ReportBar } from "../../common/ReportBar";
import { IReporte } from "../../interfaces/IReporte";
import { ReporteService } from "../../services/ReporteService";
import { excelExport } from "../../services/functions/excelExport";

function Reporte() {

    const fichaPersonalService = new FichaPersonalService();
    const reporteService = new ReporteService();



    const [listRangoEdades, setListRangoEdades] = useState<IRangoEdad[]>([]);



    const [formData, setFormData] = useState<IBusquedaReporte>({
        cedula: '',
        genero: '',
        rangoEdad: 0,
        estado: true
    });

    const rangoEdadService = new RangoEdadService();

    const [listFichaPersonal, setListFichaPersonal] = useState<IFichaPersonal[]>([]);
    const [listReporte, setReporte] = useState<IReporte[]>([]);

    const [excelReportData, setExcelReportData] = useState<IExcelReportParams | null>(null);


    useEffect(() => {

        loadComboEdades();
        loadData();
        loadReporte();

    }, [formData.cedula, formData.genero, formData.rangoEdad, formData.estado]);


    const loadData = () => {

        if (formData.rangoEdad === 0) {
            // console.log("4 SIN EDAD")
            fichaPersonalService
                .getBusqueda(formData.cedula, formData.genero, formData.estado)
                .then((data) => {
                    setListFichaPersonal(data);
                    // loadExcelReportData(data);
                    // setDataLoaded(true); // Marcar los datos como cargados
                })
                .catch((error) => {
                    console.error("Error al obtener los datos:", error);
                });
        } else {
            // console.log(" 4 CON EDAD")
            fichaPersonalService
                .getBusquedaRE(formData.cedula, formData.genero, formData.rangoEdad, formData.estado)
                .then((data) => {
                    setListFichaPersonal(data);
                    // loadExcelReportData(data);
                    // setDataLoaded(true); // Marcar los datos como cargados
                })
                .catch((error) => {
                    console.error("Error al obtener los datos:", error);
                });
        }


    };

    const loadComboEdades = () => {
        rangoEdadService
            .getAll()
            .then((data: IRangoEdad[]) => { // Proporciona un tipo explícito para "data"
                // Transforma los datos para agregar la propiedad "label"
                const dataWithLabel = data.map((rangoEdad) => ({
                    ...rangoEdad,
                    label: `${rangoEdad.limInferior} - ${rangoEdad.limSuperior}`,
                }));

                // Establece la lista de rango de edades en el estado
                setListRangoEdades(dataWithLabel);
                // setDataLoaded(true); // Marcar los datos como cargados
            })
            .catch((error) => {
                console.error("Error al obtener los datos:", error);
            });
    };

    const loadReporte = () => {

        if (formData.rangoEdad === 0) {
            // console.log("4 SIN EDAD")
            reporteService
                .busquedaReporte(formData.cedula, formData.genero, formData.estado)
                .then((data) => {
                    setReporte(data);
                    console.log(data);

                    loadExcelReportData(data);
                    // setDataLoaded(true); // Marcar los datos como cargados
                })
                .catch((error) => {
                    console.error("Error al obtener los datos:", error);
                });
        } else {
            // console.log(" 4 CON EDAD")
            reporteService
                .busquedaReporteRE(formData.cedula, formData.genero, formData.rangoEdad, formData.estado)
                .then((data) => {
                    setReporte(data);
                    loadExcelReportData(data);
                    // setDataLoaded(true); // Marcar los datos como cargados
                    console.log(data);

                })
                .catch((error) => {
                    console.error("Error al obtener los datos:", error);
                });
        }


    };


    function loadExcelReportData(data: IReporte[]) {
        const reportName = "Reporte General"
        const logo = 'G1:I1'

        const rowData = data.map((item) => ({
            idFichaPersonal: item.idFichaPersonal,
            actTrabInfantil: item.actTrabInfantil,
            apellidos: item.apellidos,
            barrioSector: item.barrioSector,
            ciPasaporte: item.ciPasaporte,
            coordenadaX: item.coordenadaX,
            coordenadaY: item.coordenadaY,
            detalleActTrabInfantil: item.detalleActTrabInfantil,
            direccion: item.direccion,
            estVinculacion: item.estVinculacion,
            fechaNacimiento: item.fechaNacimiento,
            fechaRegistroFichaPersonal: item.fechaRegistroFichaPersonal,
            foto: item.foto,
            genero: item.genero,
            idEtnia: item.idEtnia,
            idParroquia: item.idParroquia,
            idRangoEdad: item.idRangoEdad,
            nacionalidad: item.nacionalidad,
            nombres: item.nombres,
            referencia: item.referencia,
            tipoIdentificacion: item.tipoIdentificacion,
            zona: item.zona,

            idFichaInscripcion: item.idFichaInscripcion,
            asistenciaInscripcion: item.asistenciaInscripcion,
            fechaIngresoInscripcion: item.fechaIngresoInscripcion,
            fechaRegistroFichaInscripcion: item.fechaRegistroFichaInscripcion,
            jornadaAsistenciaInscripcion: item.jornadaAsistenciaInscripcion,
            proyectoInscripcion: item.proyectoInscripcion,
            situacionIngresoInscripcion: item.situacionIngresoInscripcion,
            idCurso: item.idCurso,

            idFichaRepresentante: item.idFichaRepresentante,
            apellidosRepresentante: item.apellidosRepresentante,
            cedulaRepresentante: item.cedulaRepresentante,
            contactoEmergenciaRepresentante: item.contactoEmergenciaRepresentante,
            contactoRepresentante: item.contactoRepresentante,
            fechaNacimientoRepresentante: item.fechaNacimientoRepresentante,
            fechaRegistroFichaRepresentante: item.fechaRegistroFichaRepresentante,
            generoRepresentante: item.generoRepresentante,
            lugarTrabajoRepresentante: item.lugarTrabajoRepresentante,
            nacionalidadRepresentante: item.nacionalidadRepresentante,
            nivelInstruccionRepresentante: item.nivelInstruccionRepresentante,
            nombresRepresentante: item.nombresRepresentante,
            observacionesRepresentante: item.observacionesRepresentante,
            ocupacionPrimariaRepresentante: item.ocupacionPrimariaRepresentante,
            ocupacionSecundariaRepresentante: item.ocupacionSecundariaRepresentante,
            parentescoRepresentante: item.parentescoRepresentante,
            tipoIdentificacionRepresentante: item.tipoIdentificacionRepresentante,

            idFichaSalud: item.idFichaSalud,
            carnetDiscapacidad: item.carnetDiscapacidad,
            condicionesMedicas: item.condicionesMedicas,
            condicionesMedicas2: item.condicionesMedicas2,
            condicionesMedicas3: item.condicionesMedicas3,
            condicionesMedicas4: item.condicionesMedicas4,
            condicionesMedicas5: item.condicionesMedicas5,
            condicionesMedicasAdd: item.condicionesMedicasAdd,
            discapacidadNNAFichaSalud: item.discapacidadNNAFichaSalud,
            enfermedadesPrevalentesFichaSalud: item.enfermedadesPrevalentesFichaSalud,
            fechaRegistroFichaSalud: item.fechaRegistroFichaSalud,
            masaCorporal: item.masaCorporal,
            pesoFichaSalud: item.pesoFichaSalud,
            porcentajeDiscapacidadFichaSalud: item.porcentajeDiscapacidadFichaSalud,
            situacionPsicoemocional: item.situacionPsicoemocional,
            tallaFichaSalud: item.tallaFichaSalud,
            tipoDiscapacidadFichaSalud: item.tipoDiscapacidadFichaSalud,

            idFichaFamiliar: item.idFichaFamiliar,
            beneficio: item.beneficio,
            beneficioAdicional: item.beneficioAdicional,
            detalleDiscapacidad: item.detalleDiscapacidad,
            discapacidadIntegrantes: item.discapacidadIntegrantes,
            fechaRegistroFichaFamiliar: item.fechaRegistroFichaFamiliar,
            jefaturaFamiliar: item.jefaturaFamiliar,
            numAdultos: item.numAdultos,
            numAdultosMayores: item.numAdultosMayores,
            numIntegrantes: item.numIntegrantes,
            numNNA: item.numNNA,
            organizacionBeneficio: item.organizacionBeneficio,
            otrasSituaciones: item.otrasSituaciones,
            visitaDomiciliaria: item.visitaDomiciliaria,
            idTipoFamilia: item.idTipoFamilia,

            idFichaEducativa: item.idFichaEducativa,
            centroEducativo: item.centroEducativo,
            detalleRepitente: item.detalleRepitente,
            direccionEducativa: item.direccionEducativa,
            fechaRegistroFichaEducativa: item.fechaRegistroFichaEducativa,
            gradoEducativo: item.gradoEducativo,
            jornadaEducativa: item.jornadaEducativa,
            observacionesEducativa: item.observacionesEducativa,
            referenciaEducativa: item.referenciaEducativa,
            repitente: item.repitente,
            situacionPsicopedagogica: item.situacionPsicopedagogica,

            idFichaDesvinculacion: item.idFichaDesvinculacion,
            fechaDesvinculacion: item.fechaDesvinculacion,
            fechaRegistroFichaDesvinculacion: item.fechaRegistroFichaDesvinculacion,
            motivoDesvinculacion: item.motivoDesvinculacion,

            etniaNombre: item.etniaNombre,
            parroquiaNombre: item.parroquiaNombre,
            cantonNombre: item.cantonNombre,
            provinciaNombre: item.provinciaNombre,
            limInferior: item.limInferior,
            limSuperior: item.limSuperior,

            fechaInicioCurso: item.fechaInicioCurso,
            fechaRegistroCurso: item.fechaRegistroCurso,
            nombreCurso: item.nombreCurso,
            username: item.username,
            nombresPersona: item.nombresPersona,
            apellidosPersona: item.apellidosPersona,
            tipoIdentificacionPersona: item.tipoIdentificacionPersona,
            ciPasaportePersona: item.ciPasaportePersona,
            limInferiorRec: item.limInferiorRec,
            limSuperiorRec: item.limSuperiorRec,

            nombreTipoFamilia: item.nombreTipoFamilia,

        }));

        const headerItems: IHeaderItem[] = [
            { header: "ID FICHA PERSONAL" },
            { header: "ACT TRAB INFANTIL" },
            { header: "APELLIDOS" },
            { header: "BARRIO/SECTOR" },
            { header: "CI/PASAPORTE" },
            { header: "COORDENADA X" },
            { header: "COORDENADA Y" },
            { header: "DETALLE ACT TRAB INFANTIL" },
            { header: "DIRECCIÓN" },
            { header: "EST VINCULACIÓN" },
            { header: "FECHA NACIMIENTO" },
            { header: "FECHA REGISTRO FICHA PERSONAL" },
            { header: "FOTO" },
            { header: "GÉNERO" },
            { header: "ID ETNIA" },
            { header: "ID PARROQUIA" },
            { header: "ID RANGO EDAD" },
            { header: "NACIONALIDAD" },
            { header: "NOMBRES" },
            { header: "REFERENCIA" },
            { header: "TIPO IDENTIFICACIÓN" },
            { header: "ZONA" },
            { header: "ID FICHA INSCRIPCIÓN" },
            { header: "ASISTENCIA INSCRIPCIÓN" },
            { header: "FECHA INGRESO INSCRIPCIÓN" },
            { header: "FECHA REGISTRO FICHA INSCRIPCIÓN" },
            { header: "JORNADA ASISTENCIA INSCRIPCIÓN" },
            { header: "PROYECTO INSCRIPCIÓN" },
            { header: "SITUACIÓN INGRESO INSCRIPCIÓN" },
            { header: "ID CURSO" },
            { header: "ID FICHA REPRESENTANTE" },
            { header: "APELLIDOS REPRESENTANTE" },
            { header: "CÉDULA REPRESENTANTE" },
            { header: "CONTACTO EMERGENCIA REPRESENTANTE" },
            { header: "CONTACTO REPRESENTANTE" },
            { header: "FECHA NACIMIENTO REPRESENTANTE" },
            { header: "FECHA REGISTRO FICHA REPRESENTANTE" },
            { header: "GÉNERO REPRESENTANTE" },
            { header: "LUGAR TRABAJO REPRESENTANTE" },
            { header: "NACIONALIDAD REPRESENTANTE" },
            { header: "NIVEL INSTRUCCIÓN REPRESENTANTE" },
            { header: "NOMBRES REPRESENTANTE" },
            { header: "OBSERVACIONES REPRESENTANTE" },
            { header: "OCUPACIÓN PRIMARIA REPRESENTANTE" },
            { header: "OCUPACIÓN SECUNDARIA REPRESENTANTE" },
            { header: "PARENTESCO REPRESENTANTE" },
            { header: "TIPO IDENTIFICACIÓN REPRESENTANTE" },
            { header: "ID FICHA SALUD" },
            { header: "CARNET DISCAPACIDAD" },
            { header: "CONDICIONES MÉDICAS" },
            { header: "CONDICIONES MÉDICAS 2" },
            { header: "CONDICIONES MÉDICAS 3" },
            { header: "CONDICIONES MÉDICAS 4" },
            { header: "CONDICIONES MÉDICAS 5" },
            { header: "CONDICIONES MÉDICAS ADD" },
            { header: "DISCAPACIDAD NNA FICHA SALUD" },
            { header: "ENFERMEDADES PREVALENTES FICHA SALUD" },
            { header: "FECHA REGISTRO FICHA SALUD" },
            { header: "MASA CORPORAL" },
            { header: "PESO FICHA SALUD" },
            { header: "PORCENTAJE DISCAPACIDAD FICHA SALUD" },
            { header: "SITUACIÓN PSICOEMOCIONAL" },
            { header: "TALLA FICHA SALUD" },
            { header: "TIPO DISCAPACIDAD FICHA SALUD" },
            { header: "ID FICHA FAMILIAR" },
            { header: "BENEFICIO" },
            { header: "BENEFICIO ADICIONAL" },
            { header: "DETALLE DISCAPACIDAD" },
            { header: "DISCAPACIDAD INTEGRANTES" },
            { header: "FECHA REGISTRO FICHA FAMILIAR" },
            { header: "JEFE DE FAMILIA" },
            { header: "NÚMERO DE ADULTOS" },
            { header: "NÚMERO DE ADULTOS MAYORES" },
            { header: "NÚMERO DE INTEGRANTES" },
            { header: "NÚMERO DE NNA" },
            { header: "ORGANIZACIÓN BENEFICIO" },
            { header: "OTRAS SITUACIONES" },
            { header: "VISITA DOMICILIARIA" },
            { header: "ID TIPO FAMILIA" },
            { header: "ID FICHA EDUCATIVA" },
            { header: "CENTRO EDUCATIVO" },
            { header: "DETALLE REPITENTE" },
            { header: "DIRECCIÓN EDUCATIVA" },
            { header: "FECHA REGISTRO FICHA EDUCATIVA" },
            { header: "GRADO EDUCATIVO" },
            { header: "JORNADA EDUCATIVA" },
            { header: "OBSERVACIONES EDUCATIVA" },
            { header: "REFERENCIA EDUCATIVA" },
            { header: "REPITENTE" },
            { header: "SITUACIÓN PSICOPEDAGÓGICA" },
            { header: "ID FICHA DESVINCULACIÓN" },
            { header: "FECHA DESVINCULACIÓN" },
            { header: "FECHA REGISTRO FICHA DESVINCULACIÓN" },
            { header: "MOTIVO DESVINCULACIÓN" },
            { header: "ETNIA NOMBRE" },
            { header: "PARROQUIA NOMBRE" },
            { header: "CANTON NOMBRE" },
            { header: "PROVINCIA NOMBRE" },
            { header: "LIM INFERIOR" },
            { header: "LIM SUPERIOR" },
            { header: "FECHA INICIO CURSO" },
            { header: "FECHA REGISTRO CURSO" },
            { header: "NOMBRE CURSO" },
            { header: "USERNAME" },
            { header: "NOMBRES PERSONA" },
            { header: "APELLIDOS PERSONA" },
            { header: "TIPO IDENTIFICACIÓN PERSONA" },
            { header: "CI/PASAPORTE PERSONA" },
            { header: "LIM INFERIOR REC" },
            { header: "LIM SUPERIOR REC" },
            { header: "NOMBRE TIPO FAMILIA" },
        ];

        setExcelReportData({
            reportName,
            headerItems,
            rowData,
            logo
        }
        )
    }


    const resetForm = () => {
        setFormData({
            cedula: '',
            genero: '',
            estado: true,
            rangoEdad: 0
        })
    };

    const decodeBase64Download = (base64Data: string) => {
        try {
            // Eliminar encabezados o metadatos de la cadena base64
            const base64WithoutHeader = base64Data.replace(/^data:.*,/, "");

            const decodedData = atob(base64WithoutHeader); // Decodificar la cadena base64
            const byteCharacters = new Uint8Array(decodedData.length);

            for (let i = 0; i < decodedData.length; i++) {
                byteCharacters[i] = decodedData.charCodeAt(i);
            }

            const byteArray = new Blob([byteCharacters], { type: "image/jpeg" });
            const fileUrl = URL.createObjectURL(byteArray);

            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = "FotoNNA.jpeg";
            link.click();
            swal({
                title: "Descarga completada",
                text: "Descargando imagen....",
                icon: "success",
                timer: 1000,
            });

            URL.revokeObjectURL(fileUrl);
        } catch (error) {
            console.error("Error al decodificar la cadena base64:", error);
        }
    };



    const handleExportExcel = () => {
        loadReporte(); // Espera a que loadReporte() se complete
        swal({
            title: "Imprimir Rerporte General",
            text: "Si el registro que busca no esta en el reporte, se debe a que el mismo no cuenta con todas las fichas necesarias",
            icon: "warning",
            buttons: {
                cancel: {
                    text: "Cancelar",
                    visible: true,
                    className: "cancel-button",
                },
                confirm: {
                    text: "Imprimir",
                    className: "confirm-button",
                },
            },
        }).then((confirmed) => {
            if (confirmed) {


                if (excelReportData) {
                    excelExport(excelReportData); // Espera a que excelExport se complete
                    console.log('Generated report');
                    if (excelReportData.onButtonClick) {
                        excelReportData.onButtonClick(); // Llama al evento onClick opcional si se proporciona.
                    }

                    setExcelReportData(null)
                    console.log(excelReportData)
                }
            }
        });

        // toast.promise(
        //     loadReporte(),
        //     {
        //         loading: 'Cargando datos...', // Mensaje de carga
        //         success: 'Datos cargados exitosamente.', // Mensaje de éxito
        //         error: 'Error al cargar los datos.', // Mensaje de error
        //     }
        // ).then(() => {
        //     // Continuar con la siguiente acción después de que la promesa se resuelva
        //     // Esta función se ejecutará una vez que los datos se hayan cargado o en caso de error
        //     // Puedes agregar tu código aquí
        //     if (excelReportData) {
        //         excelExport(excelReportData); // Espera a que excelExport se complete
        //         console.log('Generated report');
        //         if (excelReportData.onButtonClick) {
        //             excelReportData.onButtonClick(); // Llama al evento onClick opcional si se proporciona.
        //         }
        //     }
        //     vaciarReporte();

        // })
        // try {

        // } catch (err) {
        //     console.error(err);
        // }
    };





    return (
        <>
            <div>
                <Toaster position="top-right"
                    reverseOrder={true} />
            </div>
            <Fieldset className="fgrid col-fixed " style={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                    header={cardHeader}
                    className="border-solid border-red-800 border-3 flex-1 flex-wrap"
                    style={{ marginBottom: "35px", maxWidth: "1250px" }}
                >
                    <div
                        className="h1-rem"
                        style={{ display: 'flex', justifyContent: 'center' }}
                    >
                        <h1 className="text-5xl font-smibold lg:md-2 h-full max-w-full max-h-full min-w-min">
                            Reporte
                        </h1>
                    </div>



                    {/* <div > */}
                    {/* <div className="card"> */}
                    <Divider align="left">
                        <div className="inline-flex align-items-center">
                            <i className="pi pi-filter-fill mr-2"></i>
                            <b>Filtro</b>
                        </div>
                    </Divider>

                    <Fieldset legend="Filtros de busqueda" >
                        <section className="layout">


                            <div></div>
                            <div></div>
                            <div className="divEnd">
                                {/* <button className="btnExcel" onClick={handleExportExcel}>
                                    <div className="svg-wrapper-1">
                                        <div className="svg-wrapper">
                                            <PiFileXlsFill className="icono"></PiFileXlsFill>
                                        </div>
                                    </div>
                                    <span>Generar Excel</span>
                                </button> */}
                                <ReportBar
                                    reportName={excelReportData?.reportName!}
                                    headerItems={excelReportData?.headerItems!}
                                    rowData={excelReportData?.rowData!}
                                    logo={excelReportData?.logo!}
                                    onButtonClick={() => {
                                        toast('No olvides ingresar las coordenadas del domicilio más tarde', {
                                            icon: '⚠️',
                                            style: {
                                                fontSize: '17px'

                                            },
                                            duration: 8000,
                                            position: "top-center"
                                        });
                                        loadReporte();

                                    }}
                                />

                            </div>
                            <div className="divEnd">
                                <label className="font-medium w-auto min-w-min" htmlFor="rangoEdad" style={{ marginRight: "15px" }}>Limpiar filtros:</label>

                                <Button icon="pi pi-times" rounded severity="danger" aria-label="Cancel" onClick={() => resetForm()} />
                            </div>
                            <div className="filter">
                                <div>
                                    <label className="font-medium w-auto min-w-min" htmlFor='genero'>Cedula o Nombres:</label>

                                    <div className="flex-1">
                                        <InputText
                                            placeholder="Busqueda por cedula de identidad o nombres"
                                            id="integer"
                                            onChange={(e) => {
                                                // Actualizar el estado usando setFormData
                                                setFormData({
                                                    ...formData,
                                                    cedula: e.currentTarget.value,
                                                });

                                                // Luego, llamar a loadData después de que se actualice el estado
                                                loadData();
                                                loadReporte();

                                            }}
                                            value={formData.cedula}
                                        />

                                        {/* <Button icon="pi pi-search" className="p-button-warning" onClick={() => loadReporte()} /> */}
                                        <Button icon="pi pi-search" className="p-button-warning"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="filter">
                                <div className="gender-box">
                                    <label className="font-medium w-auto min-w-min" htmlFor='genero'>Genero:</label>

                                    <div className='gender-option'>
                                        <div className='gender'>
                                            <div className="mydict">
                                                <div>
                                                    <label className="radioLabel">
                                                        <input
                                                            className="input"
                                                            type="radio"
                                                            id="genMasculino"
                                                            name="masculino"
                                                            value="Masculino"
                                                            checked={formData.genero === 'Masculino'}
                                                            onChange={(e) => {
                                                                setFormData({ ...formData, genero: e.target.value })
                                                                loadData()
                                                                loadReporte();

                                                            }}

                                                        />
                                                        <span>Masculino</span>
                                                    </label>
                                                    <label className="radioLabel">
                                                        <input
                                                            className="input"
                                                            type="radio"
                                                            id="genFemenino"
                                                            name="femenino"
                                                            value="Femenino"
                                                            checked={formData.genero === 'Femenino'}
                                                            onChange={(e) => {
                                                                setFormData({ ...formData, genero: e.target.value })
                                                                loadData()
                                                                loadReporte();

                                                            }}

                                                        />
                                                        <span>Femenino</span>
                                                    </label>


                                                </div>
                                            </div>


                                        </div>
                                    </div>

                                </div >
                            </div>
                            <div className="filter">
                                <div>
                                    <label className="font-medium w-auto min-w-min" htmlFor="rangoEdad">Rango de Edad:</label>
                                    <Dropdown
                                        className="text-2xl"
                                        id="tiempo_dedicacion"
                                        name="tiempo_dedicacion"
                                        style={{ width: "100%" }}
                                        options={listRangoEdades}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                rangoEdad: parseInt(e.value)
                                            })
                                            loadData()
                                            loadReporte();

                                        }}
                                        value={formData.rangoEdad}
                                        optionLabel="label"
                                        optionValue="idRangoEdad"
                                        placeholder="Seleccione el rango de edad"
                                    />
                                </div>
                            </div>
                            <div className="filter">

                                <div className="gender-box">
                                    <label className="font-medium w-auto min-w-min" htmlFor='genero'>Estado:</label>

                                    <div className='gender-option'>
                                        <div className='gender'>
                                            <div className="mydict">
                                                <div>
                                                    <label className="radioLabel">
                                                        <input
                                                            className="input"
                                                            type="radio"
                                                            id="genSI"
                                                            name="genSI"
                                                            value="true"
                                                            checked={formData.estado === true}
                                                            onChange={(e) => {
                                                                setFormData({ ...formData, estado: true })
                                                                loadData()
                                                                loadReporte();

                                                            }}
                                                        />
                                                        <span>Vinculado</span>
                                                    </label>
                                                    <label className="radioLabel">
                                                        <input
                                                            className="input"
                                                            type="radio"
                                                            id="genNO"
                                                            name="genNO"
                                                            value="false"
                                                            checked={formData.estado === false}
                                                            onChange={(e) => {
                                                                setFormData({ ...formData, estado: false })
                                                                loadData()
                                                                loadReporte();

                                                            }}
                                                        />
                                                        <span>Desvinculado</span>
                                                    </label>


                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div >
                            </div>

                        </section>


                    </Fieldset>
                    {/* </div> */}

                    {/* </div> */}


                    <Divider align="left" style={{ marginBottom: "0px", marginTop: "40px" }}>
                        <div className="inline-flex align-items-center">
                            <i className="pi pi-list mr-2"></i>
                            <b>Lista</b>
                        </div>
                    </Divider>
                    <div className="tblContainer" >
                        <table className="tableFichas">
                            <thead className="theadTab" >
                                <tr style={{ backgroundColor: "#871b1b", color: "white" }}>
                                    <th className="trFichas">Nº Ficha</th>
                                    <th className="trFichas">Cedula/Pasaporte</th>
                                    <th className="trFichas">Nombres</th>
                                    <th className="trFichas">Apellidos</th>
                                    <th className="trFichas">Nacionalidad</th>
                                    <th className="trFichas">Edad</th>
                                    <th className="trFichas">Genero</th>
                                    <th className="trFichas">Canton</th>
                                    <th className="trFichas">Barrio/Sector</th>
                                    <th className="trFichas">Foto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listFichaPersonal.map((ficha) => (
                                    <tr
                                        className="text-center"
                                        key={ficha.idFichaPersonal?.toString()}
                                    >

                                        <td className="tdFichas">{ficha.idFichaPersonal}</td>
                                        <td className="tdFichas">{ficha.ciPasaporte}</td>
                                        <td className="tdFichas">{ficha.nombres}</td>
                                        <td className="tdFichas">{ficha.apellidos} </td>
                                        <td className="tdFichas">{ficha.nacionalidad}</td>
                                        <td className="tdFichas">{calcularEdad(ficha.fechaNacimiento)}</td>
                                        <td className="tdFichas">{ficha.genero}</td>
                                        <td className="tdFichas">{ficha.parroquia?.canton.cantonNombre}</td>
                                        <td className="tdFichas">{ficha.barrioSector}</td>
                                        <td className="tdFichas" style={{ width: "70px" }}>
                                            {ficha.foto ? (
                                                <>
                                                    <section className="imgSection" >
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                            <img src={ficha.foto} alt="FotoNNA" style={{ width: "65px" }} />
                                                        </div>
                                                        <div
                                                            style={{
                                                                position: "absolute",
                                                                bottom: "0",
                                                                right: "0",
                                                                margin: "5px",
                                                            }}
                                                        >
                                                            <button className="BtnDown" title="Descargar" onClick={() => decodeBase64Download(ficha.foto)}>

                                                                <svg
                                                                    className="svgIcon"
                                                                    viewBox="0 0 384 512"
                                                                    height="1em"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path>
                                                                </svg>
                                                                <span className="icon2"></span>
                                                            </button>
                                                        </div>
                                                    </section>

                                                </>
                                            ) : (
                                                <span>Sin evidencia</span>
                                            )}



                                        </td>

                                    </tr>



                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </Fieldset>
        </>
    );
}
export default Reporte;