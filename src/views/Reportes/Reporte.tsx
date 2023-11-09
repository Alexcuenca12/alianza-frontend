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
            reporteService
                .reporteGeneral(formData.cedula, formData.genero, formData.estado)
                .then((data) => {
                    setReporte(data);

                    loadExcelReportData(data);
                    // setDataLoaded(true); // Marcar los datos como cargados
                })
                .catch((error) => {
                    console.error("Error al obtener los datos:", error);
                });
        } else {
            reporteService
                .reporteGeneralRE(formData.cedula, formData.genero, formData.rangoEdad, formData.estado)
                .then((data) => {
                    setReporte(data);
                    loadExcelReportData(data);
                    // setDataLoaded(true); // Marcar los datos como cargados

                })
                .catch((error) => {
                    console.error("Error al obtener los datos:", error);
                });
        }


    };


    function loadExcelReportData(data: IReporte[]) {
        console.log(data)

        const reportName = "General"
        const logo = 'G1:I1'

        const rowData = data.map((item) => ({

            //PERSONAL
            idFichaPersonal: item?.fichaPersonal?.idFichaPersonal || 'FICHA PERSONAL NO REGISTRADA',
            foto: item?.fichaPersonal?.foto || '',
            apellidos: item?.fichaPersonal?.apellidos || '',
            nombres: item?.fichaPersonal?.nombres || '',
            tipoIdentificacion: item?.fichaPersonal?.tipoIdentificacion || '',
            ciPasaporte: item?.fichaPersonal?.ciPasaporte || '',
            nacionalidad: item?.fichaPersonal?.nacionalidad || '',
            actTrabInfantil: item?.fichaPersonal?.actTrabInfantil ? 'SI' : 'NO',
            detalleActTrabInfantil: item?.fichaPersonal?.detalleActTrabInfantil || 'N/A',
            fechaNacimiento: item?.fichaPersonal?.fechaNacimiento || '',
            edad: `${calcularEdad(item?.fichaPersonal?.fechaNacimiento || '')} años`,
            rangoEdad: `${item?.fichaPersonal?.rangoEdad?.limInferior || ''} - ${item?.fichaPersonal?.rangoEdad?.limSuperior || ''}`,
            genero: item?.fichaPersonal?.genero || '',
            etnia: item?.fichaPersonal?.etnia?.etniaNombre || '',
            provincia: item?.fichaPersonal?.parroquia?.canton.provincia.provinciaNombre || '',
            canton: item?.fichaPersonal?.parroquia?.canton.cantonNombre || '',
            parroquia: item?.fichaPersonal?.parroquia?.parroquiaNombre || '',
            zona: item?.fichaPersonal?.zona || '',
            barrioSector: item?.fichaPersonal?.barrioSector || '',
            direccion: item?.fichaPersonal?.direccion || '',
            referencia: item?.fichaPersonal?.referencia || '',
            coordenadaX: item?.fichaPersonal?.coordenadaX || 'Pendiente',
            coordenadaY: item?.fichaPersonal?.coordenadaY || 'Pendiente',
            estVinculacion: item?.fichaPersonal?.estVinculacion ? 'VINCULADO' : 'DESVINCULADO',
            fechaRegistro: item?.fichaPersonal?.fechaRegistro || '',

            //EDUCATIVA
            grado: item?.fichaEducativa?.gradoEducativo || '',
            jornada: item?.fichaEducativa?.jornadaEducativa || '',
            centro: item?.fichaEducativa?.centroEducativo || '',
            direccionedu: item?.fichaEducativa?.direccionEducativa || '',
            referenciaedu: item?.fichaEducativa?.referenciaEducativa || '',
            situacionPsico: item?.fichaEducativa?.situacionPsicopedagogica || 'Ningula',
            repitente: item?.fichaEducativa?.repitente ? 'SI' : 'NO',
            detallePsico: item?.fichaEducativa?.detalleRepitente || 'N/A',
            observacion: item?.fichaEducativa?.observacionesEducativa || '',

            //FAMILIAR
            numIntegrantes: item?.fichaFamiliar?.numIntegrantes || '',
            numNNA: item?.fichaFamiliar?.numNNA || '',
            numAdultos: item?.fichaFamiliar?.numAdultos || '',
            numAdultosMayores: item?.fichaFamiliar?.numAdultosMayores || '',
            visita: item?.fichaFamiliar?.visitaDomiciliaria ? 'SI' : 'NO',
            jefaturaFamiliar: item?.fichaFamiliar?.jefaturaFamiliar || '',
            tipoFamilia: item?.fichaFamiliar?.tipoFamilia?.nombreTipo || '',
            beneficio: item?.fichaFamiliar?.beneficio ? 'SI' : 'NO', // Establecer 'N/A' si es una cadena vacía
            beneficioAdicional: item?.fichaFamiliar?.beneficioAdicional || 'N/A', // Establecer 'N/A' si es una cadena vacía
            organizacionBenefica: item?.fichaFamiliar?.organizacionBeneficio || 'N/A',
            personasDiscapacidad: item?.fichaFamiliar?.discapacidadIntegrantes ? 'SI' : 'NO', // Corrección aquí
            detallesSituacion: item?.fichaFamiliar?.detalleDiscapacidad || 'N/A',
            otrasSituaciones: item?.fichaFamiliar?.otrasSituaciones || 'Ninguna',

            //REPRESENTANTE
            tipoIdentificacionRepre: item?.fichaRepresentante?.tipoIdentificacionRepre || '',
            cedulaRepre: item?.fichaRepresentante?.cedulaRepre || '',
            nombresRepre: item?.fichaRepresentante?.nombresRepre || '',
            apellidosRepre: item?.fichaRepresentante?.apellidosRepre || '',
            parentesco: item?.fichaRepresentante?.parentescoRepre || '',
            nacimiento: item?.fichaRepresentante?.fechaNacimientoRepre || '',
            edadRepre: calcularEdad(item?.fichaRepresentante?.fechaNacimientoRepre || '') || '',
            generoRepre: item?.fichaRepresentante?.generoRepre || '',
            nacionalidadRepre: item?.fichaRepresentante?.nacionalidadRepre || '',
            nivelInstruccion: item?.fichaRepresentante?.nivelInstruccionRepre || '',
            trabajo: item?.fichaRepresentante?.lugarTrabajoRepre || '',
            ocupacion: item?.fichaRepresentante?.ocupacionPrimariaRepre || '',
            ocupacionSec: item?.fichaRepresentante?.ocupacionSecundariaRepre || '',
            contacto: item?.fichaRepresentante?.contactoRepre || '',
            contactoEmerg: item?.fichaRepresentante?.contactoEmergenciaRepre || '',
            observaciones: item?.fichaRepresentante?.observacionesRepre || 'Ninguna',

            //SALUD
            talla: item?.fichaSalud?.tallaFichaSalud + ' m' || 0.00 + ' m',
            peso: item?.fichaSalud?.pesoFichaSalud + ' kg' || 0.00 + ' kg',
            masa: item?.fichaSalud?.masaCorporal + ' %' || 0.00 + ' %',
            discapacidad: item?.fichaSalud?.discapacidadNNAFichaSalud ? 'SI' : 'NO',
            carnet: item?.fichaSalud?.carnetDiscapacidad ? 'SI' : 'NO',
            tipoDisc: item?.fichaSalud?.tipoDiscapacidadFichaSalud || 'N/A',
            porcDisca: item?.fichaSalud?.porcentajeDiscapacidadFichaSalud + ' %' || 0.00 + ' %',
            psicoemocional: item?.fichaSalud?.situacionPsicoemocional || 'Ninguna',
            prevalentes: item?.fichaSalud?.enfermedadesPrevalentesFichaSalud || 'Niunguna',
            condicion1: item?.fichaSalud?.condicionesMedicas || 'Niunguna',
            condicion2: item?.fichaSalud?.condicionesMedicas2 || 'Niunguna',
            condicion3: item?.fichaSalud?.condicionesMedicas3 || 'Niunguna',
            condicion4: item?.fichaSalud?.condicionesMedicas4 || 'Niunguna',
            condicion5: item?.fichaSalud?.condicionesMedicas5 || 'Niunguna',
            condicionAdd: item?.fichaSalud?.condicionesMedicasAdd || 'Niunguna',

            //INSCRIPCION
            fechaInscripcion: typeof item?.fichaInscripcion?.fechaIngresoInscrip === 'string' &&
                `${item?.fichaInscripcion?.fechaIngresoInscrip.split('-')[2] || ''}/${item?.fichaInscripcion?.fechaIngresoInscrip.split('-')[1] || ''}/${item?.fichaInscripcion?.fechaIngresoInscrip.split('-')[0] || ''}` || '',
            curso: item?.fichaInscripcion?.curso?.nombreCurso || '',
            profe: `${item?.fichaInscripcion?.curso?.docente?.persona?.nombresPersona || ''} ${item?.fichaInscripcion?.curso?.docente?.persona?.apellidosPersona || ''}` || '',
            jornadaAsistenciaInscrip: item?.fichaInscripcion?.jornadaAsistenciaInscrip || '',
            asistenciaInscrip: item?.fichaInscripcion?.asistenciaInscrip || '',
            proyecto: item?.fichaInscripcion?.proyectoInscrip || '',
            situacion: item?.fichaInscripcion?.situacionIngresoInscrip || '',

            //DESVINCULACION
            fechaDesvinculacion: new Date(item?.fichaDesvinculacion?.fechaDesvinculacion!).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }) || '',
            motivo: item?.fichaDesvinculacion?.motivo || '',

        }));

        const headerItems: IHeaderItem[] = [
            //PERSONAL
            { header: "№ FICHA" },
            { header: "FOTO" },
            { header: "APELLIDOS" },
            { header: "NOMBRES" },
            { header: "TIPO IDENTIFICACIÓN" },
            { header: "CI/PASAPORTE" },
            { header: "NACIONALIDAD" },
            { header: "ACT. TRAB. INFANTIL" },
            { header: "DETALLE ACT. TRAB. INFANTIL" },
            { header: "FECHA NACIMIENTO" },
            { header: "EDAD" },
            { header: "RANGO DE EDAD" },
            { header: "GENERO" },
            { header: "ETNIA" },
            { header: "PROVINCIA" },
            { header: "CANTON" },
            { header: "PARROQUIA" },
            { header: "ZONA" },
            { header: "BARRIO/SECTOR" },
            { header: "DIRECCIÓN" },
            { header: "REFERENCIA" },
            { header: "COORDENADA X" },
            { header: "COORDENADA Y" },
            { header: "EST. VINCULACIÓN" },
            { header: "FECHA REGISTRO" },

            //EDUCATIVA
            { header: "GRADO" },
            { header: "JORNADA" },
            { header: "CENTRO EDUCATIVO" },
            { header: "DIRECCION" },
            { header: "REFERENCIA" },
            { header: "SITUACIÓN PSICOPEDAGOGICA:" },
            { header: "¿ES REPITENTE?" },
            { header: "DETALLES DEL REPITENTE" },
            { header: "OBSERVACION" },


            //FAMILIAR
            { header: "№ INTEGRANTES" },
            { header: "№ NNA" },
            { header: "№ ADULTOS" },
            { header: "№ ADULTOS MAYORES" },
            { header: "VISITA DOMICILIAR" },
            { header: "JEFATURA FAMILIAR" },
            { header: "TIPO DE FAMILIA" },
            { header: "BENEFICIO ADICIONAL" },
            { header: "DETALLE DEL BENEFICIO" },
            { header: "ORGANIZACION BENEFICA" },
            { header: "¿RESIDE PERSONAS CON DICAPACIDAD?" },
            { header: "DETALLES DE LA SITUACION FAMILIAR" },
            { header: "OTRAS SITUACIONES" },


            //REPRESENTANTE
            { header: "TIPO DE IDENTIFICACION" },
            { header: "CEDULA/PASAPORTE" },
            { header: "NOMBRES" },
            { header: "APELLIDOS" },
            { header: "PARENTESCO" },
            { header: "FECHA DE NACIMIENTO" },
            { header: "EDAD" },
            { header: "GENERO" },
            { header: "NACIONALIDAD" },
            { header: "NIVEL DE INSTRUCCION" },
            { header: "LUGAR DE TRABAJO" },
            { header: "OCUPACIÓN" },
            { header: "OCUPACION SECUNDARIA" },
            { header: "№ DE CONTACTO" },
            { header: "№ DE EMERGENCIA" },
            { header: "OBSERVACIONES" },

            //SALUD
            { header: "TALLA (m,)" },
            { header: "PESO (kg.)" },
            { header: "MASA CORPORAL(%)" },
            { header: "DISCAPACIDAD" },
            { header: "CARNET DE DISCAPACIDAD" },
            { header: "TIPO DE DISCAPACIDAD" },
            { header: "PORCENTAJE DE DISCAPACIDAD" },
            { header: "SITUACION PSICOEMOCIONAL" },
            { header: "ENFERMEDADES PREVALENTES" },
            { header: "CONDICION MÉDICA 1" },
            { header: "CONDICION MÉDICA 2" },
            { header: "CONDICION MÉDICA 3" },
            { header: "CONDICION MÉDICA 4" },
            { header: "CONDICION MÉDICA 5" },
            { header: "CONDICION MÉDICA ADICIONAL" },

            //INSCRIPCION
            { header: "FECHA DE INSCRIPCION" },
            { header: "CURSO" },
            { header: "DOCENTE DE CURSO" },
            { header: "JORNADA" },
            { header: "ASISTENCIA" },
            { header: "PROYECTO" },
            { header: "SITUACION" },

            //DESVINCULACION
            { header: "FECHA DE DESVINCULACIÓN" },
            { header: "MOTIVO" },


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