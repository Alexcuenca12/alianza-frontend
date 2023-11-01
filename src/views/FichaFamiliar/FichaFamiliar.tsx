// src/components/RegistroForm.tsx
import React, { useEffect, useState, useRef } from "react";

import { IFichaFamiliar } from '../../interfaces/IFichaFamiliar';
import { ITipoFamilia } from '../../interfaces/ITipoFamilia';
import { FichaFamiliarService } from '../../services/FichaFamiliarService';
import swal from "sweetalert";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import cardHeader from "../../shared/CardHeader";
import { Calendar, CalendarChangeEvent } from 'primereact/calendar';
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputText } from 'primereact/inputtext';


import { Divider } from 'primereact/divider';

import { ICalcularEdad } from '../../interfaces/ICalcularEdad';
import CalcularEdad from "../../common/CalcularEdad";
import { FichaPersonalService } from "../../services/FichaPersonalService";
import { IFichaPersonal } from "../../interfaces/IFichaPersonal";

import '../../styles/Fichas.css'
import '../../styles/FiltroFichas.css'
import { TipoFamiliaService } from "../../services/TipoFamiliaService";
import * as XLSX from 'xlsx';
import { IExcelReportParams, IHeaderItem } from "../../interfaces/IExcelReportParams";
import { ReportBar } from "../../common/ReportBar";
import toast, { Toaster } from "react-hot-toast";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";


function FichaPersonal() {

    const service = new FichaFamiliarService();
    const fichaPersonalService = new FichaPersonalService();

    const [excelReportData, setExcelReportData] = useState<IExcelReportParams | null>(null);


    const fileUploadRef = useRef<FileUpload>(null);
    const [dataLoaded, setDataLoaded] = useState(false);

    const tipoFamiliaService = new TipoFamiliaService();
    const [busqueda, setBusqueda] = useState<string>('');
    const [foto, setFoto] = useState<string>('https://cdn-icons-png.flaticon.com/128/666/666201.png');
    const [listFperonales, setListFperonales] = useState<IFichaPersonal[]>([]);
    const [listTipoFamilia, setListTipoFamilia] = useState<ITipoFamilia[]>([]);


    const [editItemId, setEditItemId] = useState<number | undefined>(undefined);
    const [editMode, setEditMode] = useState(false);

    const [listFichaFamiliar, setFichaFamiliar] = useState<IFichaFamiliar[]>([]);
    const [formData, setFormData] = useState<IFichaFamiliar>({
        idFichaFamiliar: 0,
        visitaDomiciliaria: false,
        jefaturaFamiliar: '',
        numIntegrantes: 0,
        numAdultos: 0,
        numNNA: 0,
        numAdultosMayores: 0,
        beneficioAdicional: '',
        organizacionBeneficio: '',
        discapacidadIntegrantes: false,
        beneficio: false,
        detalleDiscapacidad: '',
        otrasSituaciones: '',
        tipoFamilia: null,
        fichaPersonal: null,
        fechaRegistro: new Date

    });

    useEffect(() => {

        loadTipoFamilias();

        loadData();
    }, []);

    const loadData = () => {
        service
            .getAll()
            .then((data) => {
                setFichaFamiliar(data);
                loadExcelReportData(data);
                setDataLoaded(true); // Marcar los datos como cargados
            })
            .catch((error) => {
                console.error("Error al obtener los datos:", error);
            });
    };

    const loadTipoFamilias = () => {
        tipoFamiliaService
            .getAll()
            .then((data) => {
                setListTipoFamilia(data);
                setDataLoaded(true); // Marcar los datos como cargados
            })
            .catch((error) => {
                console.error("Error al obtener los datos:", error);
            });
    };

    function validaciones(): boolean {

        if (!formData.fichaPersonal?.idFichaPersonal) {
            toast.error("Seleccione al propietario de la ficha", {
                style: {
                    fontSize: '15px'
                },
                duration: 3000,
            })
            return false
        }

        if (!formData.numIntegrantes) {
            toast.error("Indique la cantidad de integrantes del hogar", {
                style: {
                    fontSize: '15px'
                },
                duration: 3000,
            })
            return false
        } else {
            if ((formData.numAdultos + formData.numAdultosMayores + formData.numNNA) !== formData.numIntegrantes) {
                toast('La suma de los integrantes no coincide', {
                    icon: '⚠️',
                    style: {
                        fontSize: '15px'

                    },
                    duration: 4000,
                });
                return false;
            }
        }

        if (!formData.jefaturaFamiliar) {
            toast.error("Ingrese el nombre de la cabeza del hogar", {
                style: {
                    fontSize: '15px'
                },
                duration: 3000,
            })
            return false
        }

        if (!formData.tipoFamilia) {
            toast.error("Seleccione el tipo de familia", {
                style: {
                    fontSize: '15px'
                },
                duration: 3000,
            })
            return false
        }

        if (formData.beneficio) {
            if (!formData.beneficioAdicional) {
                toast.error("Especifique cual es el beneficio con el que cuenta", {
                    style: {
                        fontSize: '15px'
                    },
                    duration: 3000,
                })
                return false
            }
            if (!formData.organizacionBeneficio) {
                toast.error("Indique la organizacion que le proporciona el beneficio", {
                    style: {
                        fontSize: '15px'
                    },
                    duration: 3000,
                })
                return false
            }
        }

        if (formData.discapacidadIntegrantes) {
            if (!formData.detalleDiscapacidad) {
                toast.error("Proporcione detalles hacerca de su situacion familiar", {
                    style: {
                        fontSize: '15px'
                    },
                    duration: 3000,
                })
                return false
            }
        }

        if (!formData.otrasSituaciones) {
            toast('No ha ingresado ninguna otra situación', {
                icon: '⚠️',
                style: {
                    fontSize: '15px'

                },
                duration: 4000,
            });
        }

        return true

    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validaciones()) {
            service
                .save(formData)
                .then((response) => {
                    resetForm();
                    swal("Perfecto", "Datos Guardados Correctamente", "success");
                    loadDataID(response.fichaPersonal?.idFichaPersonal);
                    resetForm();
                    resetFiltro()

                })
                .catch((error) => {
                    console.error("Error al enviar el formulario:", error);
                });
        }



        // Aquí puedes enviar los datos del formulario al servidor o realizar otras acciones
        console.log('Datos enviados:', { formData });
    };

    const handleDelete = (id: number | undefined) => {
        if (id !== undefined) {
            swal({
                title: "Confirmar Eliminación",
                text: "¿Estás seguro de eliminar este registro?",
                icon: "warning",
                buttons: {
                    cancel: {
                        text: "Cancelar",
                        visible: true,
                        className: "cancel-button",
                    },
                    confirm: {
                        text: "Sí, eliminar",
                        className: "confirm-button",
                    },
                },
            }).then((confirmed) => {
                if (confirmed) {
                    service
                        .delete(id)
                        .then(() => {
                            setFichaFamiliar(
                                listFichaFamiliar.filter((contra) => contra.idFichaFamiliar !== id)
                            );
                            swal(
                                "Eliminado",
                                "El registro ha sido eliminado correctamente",
                                "error"
                            );
                        })
                        .catch((error) => {
                            console.error("Error al eliminar el registro:", error);
                            swal(
                                "Error",
                                "Ha ocurrido un error al eliminar el registro",
                                "error"
                            );
                        });
                }
            });
        }
    };

    const handleEdit = (id: number | undefined) => {

        if (id !== undefined) {
            const editItem = listFichaFamiliar.find((contra) => contra.idFichaFamiliar === id);
            if (editItem) {

                const editedItem = { ...editItem };

                if (typeof editedItem.fechaRegistro === 'string') {
                    const registro = new Date(editedItem.fechaRegistro);
                    registro.setDate(registro.getDate() + 1);
                    const formattedDate = registro
                        ? registro.toISOString().split('T')[0]
                        : '';
                    editedItem.fechaRegistro = formattedDate;
                }

                setFormData(editedItem);
                setEditMode(true);
                setEditItemId(id);

                setBusqueda(editItem.fichaPersonal?.ciPasaporte ?? "");
                setFoto(editItem.fichaPersonal?.foto ?? '')


                if (editItem.fichaPersonal !== null) {

                    const editItemWithLabel = {
                        ...editItem,
                        fichaPersonal: {
                            ...editItem.fichaPersonal,
                            label: `${editItem.fichaPersonal.ciPasaporte} || ${editItem.fichaPersonal.apellidos} ${editItem.fichaPersonal.nombres}`,
                        },
                    };
                    setListFperonales([editItemWithLabel.fichaPersonal]);
                }


            }
        }
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();


        if (editItemId !== undefined) {
            if (validaciones()) {
                service
                    .update(Number(editItemId), formData as IFichaFamiliar)
                    .then((response) => {
                        swal({
                            title: "Ficha Personal",
                            text: "Datos actualizados correctamente",
                            icon: "success",
                        });
                        resetForm()
                        loadDataID(response.fichaPersonal?.idFichaPersonal);
                        resetFiltro()
                        setEditMode(false);
                        setEditItemId(undefined);
                    })
                    .catch((error) => {
                        console.error("Error al actualizar el formulario:", error);
                    });
            }
        }
        console.log('Datos enviados:', { formData });

    };

    const resetForm = () => {
        setFormData({
            idFichaFamiliar: 0,
            visitaDomiciliaria: false,
            jefaturaFamiliar: '',
            numIntegrantes: 0,
            numAdultos: 0,
            numNNA: 0,
            numAdultosMayores: 0,
            beneficioAdicional: '',
            organizacionBeneficio: '',
            discapacidadIntegrantes: false,
            beneficio: false,
            detalleDiscapacidad: '',
            otrasSituaciones: '',
            tipoFamilia: null,
            fichaPersonal: null,
            fechaRegistro: new Date

        });

    };


    const loadRelacion = () => {

        fichaPersonalService
            .getBusquedaRelacion(true, busqueda)
            .then((data: IFichaPersonal[]) => {
                const dataWithLabel = data.map((object) => ({
                    ...object,
                    label: `${object.ciPasaporte} || ${object.apellidos} ${object.nombres}`,
                }));

                setListFperonales(dataWithLabel); // Establecer los datos procesados en el estado
                // setDataLoaded(true); // Puedes marcar los datos como cargados si es necesario
            })
            .catch((error) => {
                console.error("Error al obtener los datos:", error);
            });


        console.log('Datos enviados:', { listFperonales });

    };

    const cargarFoto = (id: number) => {
        const Foto = listFperonales.find((persona) => persona.idFichaPersonal === id);

        if (Foto) {
            // Actualiza formData con la foto correspondiente
            setFoto(Foto.foto);
            if (Foto) {
                console.log("Foto cargada")
            }

        }

    }

    const loadDataID = (id: number) => {
        setFichaFamiliar([]);
        service
            .getBusquedaID(id)
            .then((data) => {
                setFichaFamiliar(data);
                loadExcelReportData(data);
                setDataLoaded(true); // Marcar los datos como cargados
            })
            .catch((error) => {
                console.error("Error al obtener los datos:", error);
            });
    };

    const resetFiltro = () => {
        setBusqueda('')
        setFoto('https://cdn-icons-png.flaticon.com/128/666/666201.png')
        setListFperonales([])


    };


    function loadExcelReportData(data: IFichaFamiliar[]) {
        const reportName = "Ficha Familiar"
        const logo = 'G1:I1'

        const rowData = data.map((item) => (
            {
                idFicha: item.idFichaFamiliar,
                tipoIdent: item.fichaPersonal?.tipoIdentificacion,
                cedula: item.fichaPersonal?.ciPasaporte,
                nombres: item.fichaPersonal?.nombres,
                apellidos: item.fichaPersonal?.apellidos,
                numIntegrantes: item.numIntegrantes,
                numNNA: item.numNNA,
                numAdultos: item.numAdultos,
                numAdultosMayores: item.numAdultosMayores,
                visita: item.visitaDomiciliaria ? 'SI' : 'NO',
                jefaturaFamiliar: item.jefaturaFamiliar,
                tipoFamilia: item.tipoFamilia?.nombreTipo,
                beneficio: item.beneficio ? 'SI' : 'NO', // Establecer 'N/A' si es una cadena vacía
                beneficioAdicional: item.beneficioAdicional || 'N/A', // Establecer 'N/A' si es una cadena vacía
                organizacionBenefica: item.organizacionBeneficio || 'N/A',
                personasDiscapacidad: item.discapacidadIntegrantes ? 'SI' : 'NO', // Corrección aquí
                detallesSituacion: item.detalleDiscapacidad || 'N/A',
                otrasSituaciones: item.otrasSituaciones || 'Ninguna',
            }
        ));
        const headerItems: IHeaderItem[] = [
            { header: "№ FICHA" },
            { header: "TIPO IDENTIFICACIÓN" },
            { header: "CI/PASAPORTE" },
            { header: "NOMBRES" },
            { header: "APELLIDOS" },
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

        ]
        setExcelReportData({
            reportName,
            headerItems,
            rowData,
            logo
        }
        )
    }


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
                    style={{ marginBottom: "35px", maxWidth: "1100px" }}
                >
                    <div
                        className="h1-rem"
                        style={{ display: 'flex', justifyContent: 'center' }}
                    >
                        <h1 className="text-5xl font-smibold lg:md-2 h-full max-w-full max-h-full min-w-min">
                            Ficha Familiar
                        </h1>
                    </div>

                    <div className="" style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "right" }}>
                        <label className="font-medium w-auto min-w-min" htmlFor="fichaPersonal" style={{ marginRight: "10px" }}>Fecha de Registro:</label>
                        <Calendar
                            disabled
                            dateFormat="dd-mm-yy" // Cambiar el formato a ISO 8601

                            style={{ width: "95px", marginRight: "25px", fontWeight: "bold" }}
                            onChange={(e: CalendarChangeEvent) => {
                                if (e.value !== undefined) {
                                    setFormData({
                                        ...formData,
                                        fechaRegistro: e.value,
                                    });
                                }
                            }}

                            value={typeof formData.fechaRegistro === 'string' ? new Date(formData.fechaRegistro) : new Date()}

                        />
                    </div>

                    <section className="flex justify-content-center flex-wrap container">
                        <Divider align="left">
                            <div className="inline-flex align-items-center">
                                <i className="pi pi-filter-fill mr-2"></i>
                                <b>Filtro</b>
                            </div>
                        </Divider>
                        <Fieldset legend="Filtros de busqueda" style={{ width: "1000px", position: "relative" }}>
                            <div style={{ position: "absolute", top: "0", right: "5px", marginTop: "-15px" }}>
                                <label className="font-medium w-auto min-w-min" htmlFor="rangoEdad" style={{ marginRight: "10px" }}>Limpiar filtros:</label>

                                <Button icon="pi pi-times" rounded severity="danger" aria-label="Cancel" onClick={() => { resetFiltro(); loadData() }} />
                            </div>



                            <section className="layout">
                                <div className="">
                                    <div input-box>
                                        <label className="font-medium w-auto min-w-min" htmlFor='genero'>Cedula o Nombre:</label>

                                        <div className="flex-1">
                                            <InputText
                                                placeholder="Cedula de identidad"
                                                id="integer"
                                                // keyfilter="int"
                                                style={{ width: "75%" }}

                                                onChange={(e) => {
                                                    // Actualizar el estado usando setFormData
                                                    setListFperonales([]); // Asignar un arreglo vacío para vaciar el estado listFperonales

                                                    setBusqueda(e.currentTarget.value);

                                                    // Luego, llamar a loadRelacion después de que se actualice el estado
                                                    loadRelacion();
                                                }}

                                                // onKeyUp={(e) => {
                                                //     setListFperonales([]); // Asignar un arreglo vacío para vaciar el estado listFperonales

                                                //     setBusqueda(e.currentTarget.value);

                                                //     // Luego, llamar a loadRelacion después de que se actualice el estado
                                                //     loadRelacion(); // Llama a tu método aquí o realiza las acciones necesarias.
                                                // }}

                                                value={busqueda}
                                            />

                                            <Button icon="pi pi-search" className="p-button-warning" />
                                        </div>
                                    </div>
                                </div>
                                <div className="">
                                    <div>
                                        <label className="font-medium w-auto min-w-min" htmlFor="fichaPersonal">Resultados de la busqueda:</label>
                                        <Dropdown
                                            className="text-2xl"
                                            id="tiempo_dedicacion"
                                            name="tiempo_dedicacion"
                                            style={{ width: "100%" }}
                                            options={listFperonales}
                                            onChange={(e) => {
                                                setFormData({
                                                    ...formData,
                                                    fichaPersonal: {
                                                        idFichaPersonal: parseInt(e.value), foto: '',
                                                        apellidos: '',
                                                        nombres: '',
                                                        ciPasaporte: '',
                                                        tipoIdentificacion: '',
                                                        actTrabInfantil: false,
                                                        detalleActTrabInfantil: '',
                                                        nacionalidad: '',
                                                        fechaNacimiento: '',
                                                        rangoEdad: null,
                                                        genero: '',
                                                        etnia: null,
                                                        parroquia: null,
                                                        zona: '',
                                                        barrioSector: '',
                                                        direccion: '',
                                                        referencia: '',
                                                        coordenadaX: 0,
                                                        coordenadaY: 0,
                                                        estVinculacion: true,
                                                        fechaRegistro: new Date(),
                                                        anexosCedula: "",
                                                        anexosDocumentosLegales: "",
                                                    }
                                                });
                                                cargarFoto(parseInt(e.value))
                                                loadDataID(parseInt(e.value))
                                            }}
                                            value={formData.fichaPersonal?.idFichaPersonal}

                                            optionLabel="label"
                                            optionValue="idFichaPersonal"
                                            placeholder="Seleccione una persona"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: "grid", placeItems: "center" }}>
                                        <img
                                            src={foto}
                                            alt="FotoNNA"
                                            style={{
                                                // width: "80px",
                                                height: "80px",
                                                borderRadius: "50%", // Borde redondeado
                                                border: "2px solid gray", // Borde gris
                                            }}
                                        />
                                    </div>
                                </div>
                            </section>
                        </Fieldset>


                        <form onSubmit={editMode ? handleUpdate : handleSubmit} className='form' encType="multipart/form-data">

                            <Divider align="left">
                                <div className="inline-flex align-items-center">
                                    <i className="pi pi-book mr-2"></i>
                                    <b>Formulario </b>
                                </div>
                            </Divider>

                            <div className='column'>
                                <div className='input-box'>
                                    <label className="font-medium w-auto min-w-min" htmlFor="numIntegrantes">Numero de integrantes:</label>

                                    <InputNumber
                                        className="input"
                                        id="numIntegrantes"
                                        inputId="minmax-buttons"
                                        value={formData.numIntegrantes}
                                        onValueChange={(e: InputNumberValueChangeEvent) => setFormData({ ...formData, numIntegrantes: e.value || 0 })}
                                        mode="decimal"
                                        placeholder='Ingrese el numero de integrantes del hogar'
                                        style={{ width: "100%", height: "35px" }}
                                        showButtons
                                        min={0}
                                    // max={100}
                                    />

                                    <span className="input-border"></span>

                                </div>
                                <div className='input-box'>
                                    <label className="font-medium w-auto min-w-min" htmlFor="numNNA">
                                        Numero de NNA:</label>
                                    <InputNumber
                                        className="input"
                                        id="numNNA"
                                        inputId="minmax-buttons"
                                        value={formData.numNNA}
                                        onValueChange={(e: InputNumberValueChangeEvent) => setFormData({ ...formData, numNNA: e.value || 0 })}
                                        mode="decimal"
                                        placeholder='Ingrese el numero de NNA del hogar'
                                        style={{ width: "100%", height: "35px" }}
                                        showButtons
                                        min={0}
                                    // max={100}
                                    />

                                    <span className="input-border"></span>

                                </div>


                                <div className='input-box'>
                                    <label className="font-medium w-auto min-w-min" htmlFor="numAdultos">Numero de adultos:</label>
                                    <InputNumber
                                        className="input"
                                        id="numAdultos"
                                        inputId="minmax-buttons"
                                        value={formData.numAdultos}
                                        onValueChange={(e: InputNumberValueChangeEvent) => setFormData({ ...formData, numAdultos: e.value || 0 })}
                                        mode="decimal"
                                        placeholder='Ingrese el numero de adultos del hogar'
                                        style={{ width: "100%", height: "35px" }}
                                        showButtons
                                        min={0}
                                    // max={100}
                                    />

                                    <span className="input-border"></span>

                                </div>


                                <div className='input-box'>
                                    <label className="font-medium w-auto min-w-min" htmlFor="numAdultosMayores">Numero adultos mayores:</label>
                                    <InputNumber
                                        className="input"
                                        id="numAdultosMayores"
                                        inputId="minmax-buttons"
                                        value={formData.numAdultosMayores}
                                        onValueChange={(e: InputNumberValueChangeEvent) => setFormData({ ...formData, numAdultosMayores: e.value || 0 })}
                                        mode="decimal"
                                        placeholder='Ingrese el numero de adultos mayores del hogar'
                                        style={{ width: "100%", height: "35px" }}
                                        showButtons
                                        min={0}
                                    // max={100}
                                    />

                                    <span className="input-border"></span>

                                </div>
                            </div>


                            <div className="column">
                                <div className="input-box">
                                    <label className="font-medium w-auto min-w-min" htmlFor='genero'>Visita Domiciliar:</label>

                                    <div className="mydict">
                                        <div>
                                            <label className="radioLabel">
                                                <input
                                                    className="input"
                                                    type="radio"
                                                    id="genSI"
                                                    name="genSI"
                                                    value="true"
                                                    checked={formData.visitaDomiciliaria === true}
                                                    onChange={(e) => setFormData({ ...formData, visitaDomiciliaria: true })}
                                                />
                                                <span>SI</span>
                                            </label>
                                            <label className="radioLabel">
                                                <input
                                                    className="input"
                                                    type="radio"
                                                    id="genNO"
                                                    name="genNO"
                                                    value="false"
                                                    checked={formData.visitaDomiciliaria === false}
                                                    onChange={(e) => setFormData({ ...formData, visitaDomiciliaria: false })}

                                                />
                                                <span>NO</span>
                                            </label>


                                        </div>
                                    </div>
                                </div>

                                <div className='input-box'>
                                    <label className="font-medium w-auto min-w-min" htmlFor="jefaturaFamiliar">Jefatura familiar:</label>

                                    <InputText
                                        className="input"
                                        id="jefaturaFamiliar"
                                        name="jefaturaFamiliar"
                                        keyfilter={/^[A-Za-z\s]*$/} // Solo permitir caracteres 
                                        placeholder='Ingrese el nombre del jefe del hogar'
                                        required
                                        onChange={(e) => setFormData({ ...formData, jefaturaFamiliar: e.target.value })}

                                        value={formData.jefaturaFamiliar}
                                    />
                                    <span className="input-border"></span>

                                </div>

                                <div className='input-box'>
                                    <label className="font-medium w-auto min-w-min" htmlFor="etnia">Tipo de familia:</label>
                                    <Dropdown
                                        className="text-2xl"
                                        id="parroquia"
                                        name="parroquia"
                                        style={{ width: "100%", height: "35px", alignItems: "center" }}
                                        options={listTipoFamilia}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                tipoFamilia: { idTipoFamilia: parseInt(e.value), nombreTipo: '' },
                                            })
                                        }
                                        value={formData.tipoFamilia?.idTipoFamilia}
                                        optionLabel="nombreTipo"
                                        optionValue="idTipoFamilia"
                                        placeholder="Seleccione el tipo de familia"
                                    />

                                </div>

                            </div>

                            <div className="column">

                                <div className='input-box' style={{}}>
                                    <label className="font-medium w-auto min-w-min" htmlFor="tipoDocumento">
                                        ¿Cuenta con algun beneficio adicional?:
                                    </label>

                                    <div className="mydict" >
                                        <div>
                                            <label className="radioLabel">
                                                <input
                                                    className="input"
                                                    type="radio"
                                                    id="discapacidadTrue"
                                                    name="discapacidad"
                                                    value="true"
                                                    checked={formData.beneficio === true}
                                                    onChange={() =>
                                                        setFormData({
                                                            ...formData,
                                                            beneficio: true,
                                                        })
                                                    }
                                                />
                                                <span>SI</span>
                                            </label>
                                            <label className="radioLabel">
                                                <input
                                                    className="input"
                                                    type="radio"
                                                    id="discapacidadFalse"
                                                    name="discapacidad"
                                                    value="false"
                                                    checked={formData.beneficio === false}
                                                    onChange={() =>
                                                        setFormData({
                                                            ...formData,
                                                            beneficio: false, beneficioAdicional: '', organizacionBeneficio: ''
                                                        })
                                                    }
                                                />
                                                <span>NO</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className='input-box'>
                                    <label className="font-medium w-auto min-w-min" htmlFor="beneficioAdicional">Beneficio adicional:</label>
                                    <InputText
                                        className="text-2xl"
                                        id="beneficioAdicional"
                                        name="beneficioAdicional"
                                        disabled={!formData.beneficio}
                                        placeholder='En caso de contar con ayuda adicional'
                                        required
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                beneficioAdicional: e.currentTarget.value,
                                            })
                                        }
                                        value={formData.beneficioAdicional}
                                    />

                                    <span className="input-border"></span>

                                </div>

                                <div className='input-box'>
                                    <label className="font-medium w-auto min-w-min" htmlFor="organizacionBeneficio">Organizacion benefica:</label>
                                    <InputText
                                        className="text-2xl"
                                        id="organizacionBeneficio"
                                        name="organizacionBeneficio"
                                        disabled={!formData.beneficio}
                                        placeholder='Nombre de la organizacion que brinda el beneficio'
                                        required
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                organizacionBeneficio: e.currentTarget.value,
                                            })
                                        }
                                        value={formData.organizacionBeneficio}
                                    />
                                    <span className="input-border"></span>
                                </div>
                            </div>

                            <div className="column">

                                <div className="input-box">
                                    <label className="font-medium w-auto min-w-min" htmlFor='discapacidadIntegrantes'>¿Convive alguna persona con discapacidad?:</label>

                                    <div className="mydict">
                                        <div>
                                            <label className="radioLabel">
                                                <input
                                                    className="input"
                                                    type="radio"
                                                    id="genSiDis"
                                                    name="genSiDis"
                                                    value="true"
                                                    checked={formData.discapacidadIntegrantes === true}
                                                    onChange={(e) => setFormData({ ...formData, discapacidadIntegrantes: true })}
                                                />
                                                <span>SI</span>
                                            </label>
                                            <label className="radioLabel">
                                                <input
                                                    className="input"
                                                    type="radio"
                                                    id="genNoDis"
                                                    name="genNoDis"
                                                    value="false"
                                                    checked={formData.discapacidadIntegrantes === false}
                                                    onChange={(e) => setFormData({ ...formData, discapacidadIntegrantes: false, detalleDiscapacidad: '' })}

                                                />
                                                <span>NO</span>
                                            </label>
                                        </div>
                                    </div>

                                </div >

                                <div className='input-box' style={{}}>
                                    <label className="font-medium w-auto min-w-min" htmlFor="nacionalidad">
                                        Brinde mas detalles acerca de la situacion:
                                    </label>

                                    <InputTextarea
                                        className="text-2xl"
                                        disabled={!formData.discapacidadIntegrantes}
                                        placeholder='Proporcione mas detalles acerca de la situacion de su familiar'
                                        id="nacionalidad"
                                        style={{ width: "100%" }}
                                        onChange={(e) => setFormData({ ...formData, detalleDiscapacidad: e.target.value })}
                                        title="Proporcionar detalles de su situacion"
                                        value={formData.detalleDiscapacidad}
                                    />
                                    <span className="input-border"></span>

                                </div>


                                <div className='input-box'>
                                    {/* <label className="font-medium w-auto min-w-min" htmlFor="otrasSituaciones">Otras situaciones familiares:</label> */}
                                    <label className="font-medium w-auto min-w-min" htmlFor="otrasSituaciones">
                                        Otras situaciones:
                                    </label>
                                    <InputTextarea
                                        className="text-2xl"
                                        placeholder='Otras situaciones familiares relacionadas'
                                        id="otrasSituaciones"
                                        style={{ width: "100%" }}
                                        onChange={(e) => setFormData({ ...formData, otrasSituaciones: e.target.value })}
                                        title="Ingresar la nacionalidad del NNA"
                                        value={formData.otrasSituaciones}
                                    />
                                    <span className="input-border"></span>

                                </div>


                            </div>

                            <div className='btnSend' style={{ marginTop: "25px" }}>
                                <div className="flex align-items-center justify-content-center w-auto min-w-min"
                                    style={{ gap: "25px" }}>
                                    <Button
                                        type="submit"
                                        label={editMode ? "Actualizar" : "Guardar"}
                                        className="btn"
                                        rounded
                                        style={{
                                            width: "100px",
                                        }}
                                        onClick={editMode ? handleUpdate : handleSubmit}
                                    />
                                    <Button
                                        type="button"
                                        label="Cancelar"
                                        className="btn"
                                        style={{
                                            width: "100px",
                                        }}
                                        rounded
                                        onClick={() => {
                                            resetForm();
                                            resetFiltro();
                                            setEditMode(false);
                                        }} />
                                </div>
                            </div>

                        </form>
                    </section >

                    <Divider align="left" style={{ marginBottom: "0px" }}>
                        <div className="inline-flex align-items-center">
                            <i className="pi pi-list mr-2"></i>
                            <b>Lista</b>
                        </div>
                    </Divider>

                    <div className="opcTblLayout" >
                        <div className="" style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>

                            <div className="opcTbl" style={{ justifyContent: "right" }} >
                                <label className="font-medium w-auto min-w-min" htmlFor='estado'>Cargar todo:</label>

                                <Button className="buttonIcon" // Agrega una clase CSS personalizada
                                    icon="pi pi-refresh" style={{ width: "120px", height: "39px" }}
                                    severity="danger" aria-label="Cancel" onClick={() => { loadData(); resetFiltro(); }}
                                />

                            </div>
                            <ReportBar
                                reportName={excelReportData?.reportName!}
                                headerItems={excelReportData?.headerItems!}
                                rowData={excelReportData?.rowData!}
                                logo={excelReportData?.logo!}
                            />
                        </div>
                    </div>


                    <div className="tblContainer" >
                        <table className="tableFichas">
                            <thead className="theadTab" >
                                <tr style={{ backgroundColor: "#871b1b", color: "white" }}>
                                    <th className="trFichas">Nº Ficha</th>
                                    <th className="trFichas">Cedula/Pasaporte</th>
                                    <th className="trFichas">Nombres</th>
                                    <th className="trFichas">Apellidos</th>
                                    <th className="trFichas">Integrantes</th>
                                    {/* <th className="trFichas"># Adultos</th>
                                    <th className="trFichas"># NNA</th>
                                    <th className="trFichas"># Adultos Mayores</th> */}
                                    <th className="trFichas">Visita Domiciliar</th>
                                    <th className="trFichas">Jefatira Familiar</th>
                                    <th className="trFichas">Tipo de Familia</th>
                                    <th className="trFichas">Beneficio Adicional</th>
                                    <th className="trFichas">Detalles del beneficio</th>
                                    <th className="trFichas">Org. Benefica</th>
                                    <th className="trFichas">Discapacidad en la familia</th>
                                    <th className="trFichas">Editar</th>
                                    <th className="trFichas">Eliminar</th>
                                </tr>
                            </thead>
                            <tbody>

                                {listFichaFamiliar.map((ficha) => (
                                    <tr
                                        className="text-center"
                                        key={ficha.idFichaFamiliar?.toString()}
                                    >
                                        <td className="tdFichas">{ficha.idFichaFamiliar}</td>
                                        <td className="tdFichas">{ficha.fichaPersonal?.ciPasaporte}</td>
                                        <td className="tdFichas">{ficha.fichaPersonal?.nombres}</td>
                                        <td className="tdFichas">{ficha.fichaPersonal?.apellidos} </td>
                                        <td className="tdFichas">{ficha.numIntegrantes}</td>
                                        {/* <td className="tdFichas">{ficha.numAdultos}</td>
                                        <td className="tdFichas">{ficha.numNNA}</td>
                                        <td className="tdFichas">{ficha.numAdultosMayores}</td> */}
                                        <td className="tdFichas">{ficha.visitaDomiciliaria ? "SI" : "NO"}</td>
                                        <td className="tdFichas">{ficha.jefaturaFamiliar}</td>
                                        <td className="tdFichas">{ficha.tipoFamilia?.nombreTipo}</td>
                                        <td className="tdFichas">{ficha.beneficio ? "SI" : "NO"}</td>
                                        <td className="tdFichas">{ficha.beneficioAdicional || 'N/A'}</td>
                                        <td className="tdFichas">{ficha.organizacionBeneficio || 'N/A'}</td>
                                        <td className="tdFichas">{ficha.discapacidadIntegrantes ? "SI" : "NO"}</td>
                                        {/* <td className="tdFichas">{ficha.organizacionBeneficio}</td> */}
                                        <td className="tdFichas">
                                            <Button className="buttonIcon"
                                                type="button"
                                                icon="pi pi-file-edit"
                                                style={{
                                                    background: "#ff9800",
                                                    borderRadius: "5%",
                                                    fontSize: "25px",
                                                    width: "50px",
                                                    color: "black",
                                                    justifyContent: "center",
                                                }}
                                                onClick={() =>
                                                    handleEdit(ficha.idFichaFamiliar?.valueOf())
                                                }
                                            // Agrega el evento onClick para la operación de editar
                                            />

                                        </td>

                                        <td className="tdFichas">
                                            <Button className="buttonIcon"
                                                type="button"
                                                icon="pi pi-trash"
                                                style={{
                                                    background: "#ff0000",
                                                    borderRadius: "10%",
                                                    fontSize: "25px",
                                                    width: "50px",
                                                    color: "black",
                                                    justifyContent: "center",
                                                }}
                                                onClick={() =>
                                                    handleDelete(ficha.idFichaFamiliar?.valueOf())
                                                }
                                            // Agrega el evento onClick para la operación de eliminar
                                            />
                                        </td>
                                    </tr>



                                ))}

                            </tbody>
                        </table>
                    </div>
                </Card>
            </Fieldset >
        </>
    );
};

export default FichaPersonal;
