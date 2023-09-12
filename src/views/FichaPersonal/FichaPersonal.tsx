// src/components/RegistroForm.tsx
import React, { useEffect, useState, useRef } from "react";
import '../../styles/Fichas.css'

import { IRangoEdad } from '../../interfaces/IRangoEdad';
import { IFichaPersonal } from '../../interfaces/IFichaPersonal';
import { FichaPersonalService } from '../../services/FichaPersonalService';
import { IEtnia } from '../../interfaces/IEtnia';
import { IParroquia } from '../../interfaces/IParroquia';
import swal from "sweetalert";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import cardHeader from "../../shared/CardHeader";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ICalcularEdad } from '../../interfaces/ICalcularEdad';
import CalcularEdad from "../../common/CalcularEdad";
import { CantonService } from "../../services/CantonService";
import { ICanton } from "../../interfaces/ICanton";


function FichaPersonal() {

    const fichaPersonalService = new FichaPersonalService();
    const cantonService = new CantonService();


    const fileUploadRef = useRef<FileUpload>(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [editItemId, setEditItemId] = useState<number | undefined>(undefined);
    const [editMode, setEditMode] = useState(false);
    const [listFichaPersonal, setFichaPersonal] = useState<IFichaPersonal[]>([]);
    const [formData, setFormData] = useState<IFichaPersonal>({
        idFichaPersonal: 0,
        foto: '',
        apellidos: '',
        nombres: '',
        ciIdentidad: '',
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
        coordenadaY: 0
    });

    //LISTA DE PARA CARGAR LOS OBJETOS TRAIDOS DEL BACK PARA LOS COMBOS
    const etnias: IEtnia[] = [{ idEtnia: 1, etniaNombre: 'Mestizo' }, { idEtnia: 2, etniaNombre: 'Montuvio' }]
    const parroquias: IParroquia[] = [{ idParroquia: 1, parroquiaNombre: 'Bellavista', canton: { idCanton: 1, cantonNombre: 'Cuenca', provincia: { idProvincia: 1, provinciaNombre: 'Azuay' } } }]
    const rangosEdad: IRangoEdad[] = [{ idRangoEdad: 1, limInferior: 12, limSuperior: 20 }, { idRangoEdad: 2, limInferior: 21, limSuperior: 40 }];



    // const rangosEdadOpc: { label: string, value: number }[] = [];
    const [rangosEdadOpc, setRangosEdadOpc] = useState<{ label: string, value: number }[]>([]);

    const [parroquiasOpc, setParroquiasOpc] = useState<{ label: string, value: number }[]>([]);

    const [cantonOpc, setCantonOpc] = useState<{ label: string, value: number }[]>([]);

    const [etniasOpc, setEtniasOpc] = useState<{ label: string, value: number }[]>([]);

    useEffect(() => {

        //METODOS PARA CARGAR LOS COMBOS DEL FORMILARIO
        const cargarComboRangos = () => {
            const opciones = rangosEdad.map((dato) => ({
                label: `${dato.limInferior} - ${dato.limSuperior}`,
                value: dato.idRangoEdad,
            }));
            setRangosEdadOpc(opciones);
        };


        const cargarComboCantones = () => {

            cantonService
                .getAll()
                .then((data: ICanton[]) => {
                    // Mapear los datos y crear un nuevo array en el formato deseado
                    const mappedData = data.map((canton: ICanton) => ({
                        label: canton.cantonNombre,
                        value: canton.idCanton,
                    }));

                    // Actualizar el estado con los datos mapeados
                    setCantonOpc(mappedData);
                })
                .catch((error) => {
                    console.error("Error al obtener los datos:", error);
                });

        };


        const cargarComboParroquias = () => {



            const opciones = parroquias.map((dato) => ({
                label: `${dato.parroquiaNombre}`,
                value: dato.idParroquia,
            }));
            setParroquiasOpc(opciones);
        };

        const cargarComboEtnias = () => {
            const opciones = etnias.map((dato) => ({
                label: `${dato.etniaNombre}`,
                value: dato.idEtnia,
            }));
            setEtniasOpc(opciones);
        };
        cargarComboRangos();
        cargarComboEtnias();
        cargarComboParroquias();


        cargarComboCantones();
        loadData();
    }, []);

    const loadData = () => {
        fichaPersonalService
            .getAll()
            .then((data) => {
                setFichaPersonal(data);
                setDataLoaded(true); // Marcar los datos como cargados
            })
            .catch((error) => {
                console.error("Error al obtener los datos:", error);
            });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fichaPersonalService
            .save(formData)
            .then((response) => {
                resetForm();
                swal("Publicacion", "Datos Guardados Correctamente", "success");

                fichaPersonalService
                    .getAll()
                    .then((data) => {
                        setFichaPersonal(data);
                        resetForm();
                        // if (fileUploadRef.current) {
                        //     fileUploadRef.current.clear();
                        // }
                    })
                    .catch((error) => {
                        console.error("Error al obtener los datos:", error);
                    });

            })
            .catch((error) => {
                console.error("Error al enviar el formulario:", error);
            });


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
                    fichaPersonalService
                        .delete(id)
                        .then(() => {
                            setFichaPersonal(
                                listFichaPersonal.filter((contra) => contra.idFichaPersonal !== id)
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
            const editItem = listFichaPersonal.find(
                (contra) => contra.idFichaPersonal === id
            );
            if (editItem) {
                setFormData(editItem);
                setEditMode(true);
                setEditItemId(id);
            }
        }
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();


        if (editItemId !== undefined) {
            fichaPersonalService
                .update(Number(editItemId), formData as IFichaPersonal)
                .then((response) => {
                    swal({
                        title: "Ficha Personal",
                        text: "Datos actualizados correctamente",
                        icon: "success",
                    });
                    setFormData({
                        idFichaPersonal: 0,
                        foto: '',
                        apellidos: '',
                        nombres: '',
                        ciIdentidad: '',
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
                        coordenadaY: 0
                    });
                    setFichaPersonal(
                        listFichaPersonal.map((contra) =>
                            contra.idFichaPersonal === editItemId ? response : contra
                        )
                    );
                    setEditMode(false);
                    setEditItemId(undefined);
                })
                .catch((error) => {
                    console.error("Error al actualizar el formulario:", error);
                });
        }
    };

    const resetForm = () => {
        setFormData({
            idFichaPersonal: 0,
            foto: '',
            apellidos: '',
            nombres: '',
            ciIdentidad: '',
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
            coordenadaY: 0
        });

    };



    return (

        <Fieldset className="fgrid col-fixed " style={{ display: 'flex', justifyContent: 'center' }}>

            <Card
                header={cardHeader}
                className="border-solid border-red-800 border-3 flex-1 flex-wrap"
                style={{ width: "1200px", marginLeft: "90px", marginTop: "15px", marginBottom: "35px", height: "1125px" }}
            >

                <div
                    className="h1-rem"
                    style={{ display: 'flex', justifyContent: 'center' }}
                >
                    <h1 className="text-5xl font-smibold lg:md-2 h-full max-w-full max-h-full min-w-min">
                        Ficha de Personal
                    </h1>
                </div>
                <section className='container'>

                    {/* <header className="title">
                        Ficha Personal
                    </header> */}
                    {/* <div className="form"> */}

                    <form onSubmit={editMode ? handleUpdate : handleSubmit} className='form' encType="multipart/form-data">
                        <div className='column'>
                            <div className='input-box'>

                                <label className="font-medium w-auto min-w-min" htmlFor="cedula;">Cedula:</label>
                                <input
                                    className="input"
                                    type="text"
                                    id="cedula"
                                    value={formData.ciIdentidad}
                                    placeholder='Ingrese la cedula de identidad'
                                    onChange={(e) => setFormData({ ...formData, ciIdentidad: e.target.value })}
                                    required
                                />
                                <span className="input-border"></span>

                            </div>


                            <div className="inputContainer">
                                <label className="font-medium w-auto min-w-min" htmlFor="foto;">Foto:</label>

                                <input type="file" accept="image/*" ></input>


                            </div>
                        </div>



                        <div className='column'>

                            <div className='input-box'>

                                <label className="font-medium w-auto min-w-min" htmlFor="nombres">Nombres:</label>
                                <input
                                    className="input"

                                    type="text"
                                    id="nombre"
                                    value={formData.nombres}
                                    placeholder='Ingrese los nombres'
                                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                    required
                                />
                                <span className="input-border"></span>

                            </div>

                            <div className='input-box'>
                                <label className="font-medium w-auto min-w-min" htmlFor="apellidos">Apellidos:</label>
                                <input
                                    className="input"
                                    type="text"
                                    id="nombre"
                                    value={formData.apellidos}
                                    placeholder='Ingrese los apellidos'

                                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                    required
                                />
                                <span className="input-border"></span>

                            </div>

                        </div>



                        <div className="column">

                            <div className='input-box'>
                                <label className="font-medium w-auto min-w-min" htmlFor="nacionalidad">Nacionalidad:</label>
                                <input
                                    className="input"
                                    type="text"
                                    id="nacionalidad"
                                    value={formData.nacionalidad}
                                    placeholder='Ingrese la nacionalidad'

                                    onChange={(e) => setFormData({ ...formData, nacionalidad: e.target.value })}
                                    required
                                />
                                <span className="input-border"></span>

                            </div>

                            <div className='input-box' style={{ display: 'flex', alignItems: 'center', marginTop: "40px" }}>
                                <label className="font-medium w-auto min-w-min" htmlFor="fechaNacimiento">Fecha de Nacimiento:</label>


                                <Calendar
                                    style={{ marginLeft: "20px", width: "60%" }}
                                    className="text-2xl"
                                    id="inicio"
                                    name="inicio"
                                    placeholder="Ingrese la fecha de nacimiento"
                                    required
                                    dateFormat="dd-mm-yy" // Cambiar el formato a ISO 8601
                                    showIcon
                                    maxDate={new Date()}
                                    onChange={(e) => {
                                        const selectedDate =
                                            e.value instanceof Date ? e.value : null;
                                        const formattedDate = selectedDate
                                            ? selectedDate.toISOString().split("T")[0] // Formatear a ISO 8601
                                            : "";
                                        setFormData({
                                            ...formData,
                                            fechaNacimiento: formattedDate,
                                        });
                                    }}
                                    value={
                                        formData.fechaNacimiento
                                            ? new Date(formData.fechaNacimiento)
                                            : null
                                    }
                                />


                                {/* <input
                                        className="input"

                                        type="date"
                                        id="fechaNacimiento"
                                        value={formData.fechaNacimiento ? formData.fechaNacimiento.toISOString().substr(0, 10) : ''}
                                        onChange={(e) => setFormData({ ...formData, fechaNacimiento: new Date(e.target.value) })}
                                        required
                                    /> */}
                                <span className="input-border"></span>

                            </div>
                        </div>
                        <div className="column">

                            <div className="gender-box">
                                <label className="font-medium w-auto min-w-min" htmlFor='genero'>Genero:</label>

                                <div className='gender-option'>
                                    <div className='gender'>
                                        <div className="mydict">
                                            <div>
                                                <label>
                                                    <input
                                                        className="input"
                                                        type="radio"
                                                        id="genMasculino"
                                                        name="masculino"
                                                        value="Masculino"
                                                        checked={formData.genero === 'Masculino'}
                                                        onChange={(e) => setFormData({ ...formData, genero: e.target.value })}

                                                    />
                                                    <span>Masculino</span>
                                                </label>
                                                <label>
                                                    <input
                                                        className="input"
                                                        type="radio"
                                                        id="genFemenino"
                                                        name="femenino"
                                                        value="Femenino"
                                                        checked={formData.genero === 'Femenino'}
                                                        onChange={(e) => setFormData({ ...formData, genero: e.target.value })}

                                                    />
                                                    <span>Femenino</span>
                                                </label>


                                            </div>
                                        </div>
                                        {/* <input
                                            className="input"
                                            type="radio"
                                            id="genMasculino"
                                            name="masculino"
                                            value="Masculino"
                                            checked={formData.genero === 'Masculino'}
                                            onChange={(e) => setFormData({ ...formData, genero: e.target.value })}

                                        />
                                        <label htmlFor="genMasculino">Masculino</label> */}
                                        {/* <span className="input-border"></span> */}


                                        {/* <input
                                            className="input"
                                            type="radio"
                                            id="genFemenino"
                                            name="femenino"
                                            value="Femenino"
                                            checked={formData.genero === 'Femenino'}
                                            onChange={(e) => setFormData({ ...formData, genero: e.target.value })}

                                        />
                                        <label htmlFor="genFemenino">Femenino</label> */}
                                        {/* <span className="input-border"></span> */}

                                    </div>
                                </div>

                            </div >


                            <div className='input-box'>
                                <label className="font-medium w-auto min-w-min" htmlFor="rangoEdad">Rango de Edad:</label>
                                <div className="">
                                    <Dropdown
                                        className="text-2xl"
                                        id="tiempo_dedicacion"
                                        name="tiempo_dedicacion"
                                        style={{ width: "100%" }}
                                        options={rangosEdadOpc}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                rangoEdad: { idRangoEdad: parseInt(e.value), limInferior: 0, limSuperior: 0 },
                                            })
                                        }
                                        value={formData.rangoEdad?.idRangoEdad}
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Seleccione el rango de edad"
                                    />
                                    {/* <select id="rangoEdad" value={formData.rangoEdad?.idRangoEdad} onChange={(e) => setFormData({ ...formData, rangoEdad: { idRangoEdad: parseInt(e.target.value), limInferior: 18, limSuperior: 30 } })}
                                        required>
                                        <option value={0} >Seleccione una opción</option>
                                        {rangosEdad.map((rango, index) => (
                                            <option key={index} value={rango.idRangoEdad}>{rango.limInferior} - {rango.limSuperior}</option>
                                        ))}

                                    </select> */}


                                </div>



                            </div>





                        </div>

                        <div className='input-box'>
                            <label className="font-medium w-auto min-w-min" htmlFor="etnia">Etnia:</label>
                            <div className="select-box" style={{ width: "47.1%" }}>
                                <Dropdown
                                    className="text-2xl"
                                    id="tiempo_dedicacion"
                                    name="tiempo_dedicacion"
                                    style={{ width: "100%" }}
                                    options={etniasOpc}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            etnia: { idEtnia: parseInt(e.value), etniaNombre: '' },
                                        })
                                    }
                                    value={formData.etnia?.idEtnia}
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Seleccione la etnia"
                                />
                                {/* <select id="etnia" value={formData.etnia?.idEtnia} onChange={(e) => setFormData({ ...formData, etnia: { idEtnia: parseInt(e.target.value), etniaNombre: '' } })}
                                    required>
                                    <option value={0} >Seleccione una opción</option>
                                    {etnias.map((etnia, index) => (
                                        <option key={index} value={etnia.idEtnia}>{etnia.etniaNombre} </option>
                                    ))}

                                </select> */}


                            </div>

                        </div>


                        <div className='input-box'>
                            <label className="font-medium w-auto min-w-min" htmlFor="direccion">Dirección:</label>
                            <input
                                className="input"
                                type="text"
                                id="direccion"
                                value={formData.direccion}
                                placeholder='Ingrese la direccion del domicilio'

                                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                required
                            />
                            <span className="input-border"></span>

                        </div>

                        <div className="column">
                            <div className='input-box'>
                                <label className="font-medium w-auto min-w-min" htmlFor="parroquia">Canton:</label>
                                <div className="select-box">

                                    <Dropdown
                                        className="text-2xl"
                                        id="tiempo_dedicacion"
                                        name="tiempo_dedicacion"
                                        style={{ width: "100%" }}
                                        options={parroquiasOpc}
                                        // onChange={
                                        // }
                                        value={formData.parroquia?.idParroquia}
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Seleccione la Parroquia"
                                    />
                                </div>

                            </div>

                        </div>

                        <div className="column">

                            <div className='input-box'>
                                <label className="font-medium w-auto min-w-min" htmlFor="parroquia">Parroquia:</label>
                                <div className="select-box">

                                    <Dropdown
                                        className="text-2xl"
                                        id="tiempo_dedicacion"
                                        name="tiempo_dedicacion"
                                        style={{ width: "100%" }}
                                        options={parroquiasOpc}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                parroquia: {
                                                    idParroquia: parseInt(e.value), parroquiaNombre: '',
                                                    canton: {
                                                        idCanton: 0, cantonNombre: '',
                                                        provincia: {
                                                            idProvincia: 0, provinciaNombre: ''
                                                        }
                                                    }
                                                }
                                            })
                                        }
                                        value={formData.parroquia?.idParroquia}
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Seleccione la Parroquia"
                                    />
                                </div>

                            </div>


                            <div className='input-box' >
                                <label className="font-medium w-auto min-w-min" htmlFor="barrio">Barrio/Sector:</label>
                                <input
                                    className="input"
                                    type="text"
                                    id="barrio"
                                    value={formData.barrioSector}
                                    placeholder='Ingrese nombre del barrio donde se ubica su hogar'
                                    onChange={(e) => setFormData({ ...formData, barrioSector: e.target.value })}
                                    required
                                />
                                <span className="input-border"></span>

                            </div>

                        </div>

                        <div className="column">

                            <div className="gender-box">
                                <label className="font-medium w-auto min-w-min" htmlFor='zona'>Zona:</label>

                                <div className='gender-option'>
                                    <div className='gender' style={{}}>

                                        <div className="mydict" >
                                            <div>
                                                <label>
                                                    <input
                                                        className="input"
                                                        type="radio"
                                                        id="zonaUrbana"
                                                        name="zona"
                                                        value="Urbana"
                                                        checked={formData.zona === 'Urbana'}
                                                        onChange={(e) => setFormData({ ...formData, zona: e.target.value })}

                                                    />
                                                    <span>Urbana</span>
                                                </label>
                                                <label>
                                                    <input
                                                        className="input"
                                                        type="radio"
                                                        id="zonaRural"
                                                        name="zona"
                                                        value="Rural"
                                                        checked={formData.zona === 'Rural'}
                                                        onChange={(e) => setFormData({ ...formData, zona: e.target.value })}

                                                    />
                                                    <span>Rural</span>
                                                </label>


                                            </div>
                                        </div>

                                        {/* <input
                                            type="radio"
                                            id="zonaUrbana"
                                            name="zona"
                                            value="Urbana"
                                            checked={formData.zona === 'Urbana'}
                                            onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                                            required
                                        />
                                        <label htmlFor="zonaUrbana">Urbana</label>
                                        <input
                                            type="radio"
                                            id="zonaRural"
                                            name="zona"
                                            value="Rural"
                                            checked={formData.zona === 'Rural'}
                                            onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                                            required
                                        />
                                        <label htmlFor="zonaRural">Rural</label> */}
                                    </div>
                                </div>

                            </div >



                            <div className='input-box'>
                                <label className="font-medium w-auto min-w-min" htmlFor="referencia">Referencia:</label>
                                <input
                                    className="input"
                                    type="text"
                                    id="referencia"
                                    value={formData.referencia}
                                    placeholder='Ingrese una referencia cercana al hogar'
                                    onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                                    required
                                />
                                <span className="input-border"></span>

                            </div>

                        </div>

                        <div className="column">

                            <div className='input-box'>
                                <label className="font-medium w-auto min-w-min" htmlFor="coordenadaX">Coordenadas en X (longitud) del la residencia:</label>
                                <input
                                    className="input"
                                    type="text"
                                    id="coordenadaX"
                                    value={formData.coordenadaX}
                                    placeholder='Ingrese las coordenadas en X (longitud) del la residencia '
                                    onChange={(e) => setFormData({ ...formData, coordenadaX: parseFloat(e.target.value) })}
                                    required
                                />
                                <span className="input-border"></span>

                            </div>

                            <div className='input-box'>
                                <label className="font-medium w-auto min-w-min" htmlFor="coordenadaY">Coordenadas en Y (latitud) del la residencia:</label>
                                <input
                                    className="input"
                                    type="text"
                                    id="coordenadaY"
                                    value={formData.coordenadaY}
                                    placeholder='Ingrese las coordenadas en Y (latitud) del la residencia '
                                    onChange={(e) => setFormData({ ...formData, coordenadaY: parseFloat(e.target.value) })}
                                    required
                                />
                                <span className="input-border"></span>

                            </div>
                        </div>

                        <div className='btnSend'>
                            {/* <button type="submit"
                                    className='btn' >Registrarse</button> */}
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
                                    onClick={resetForm}
                                />
                            </div>
                        </div>
                    </form>
                    {/* </div> */}
                </section >


                <div style={{ marginTop: "50px" }}>
                    <table
                        style={{ minWidth: "40rem" }}
                        className="mt-4  w-full h-full text-3xl font-large"
                    >
                        <thead>
                            <tr style={{ backgroundColor: "#871b1b", color: "white" }}>
                                <th>Nº Ficha</th>
                                <th>Cedula</th>
                                <th>Nombre</th>
                                <th>Nacionalidad</th>
                                <th>Fecha de Nacimiento</th>
                                {/* <th>Rango de edad</th> */}
                                <th>Genero</th>
                                <th>Etnia</th>
                                <th>Canton</th>
                                {/* <th>Zona</th> */}
                                {/* <th>Barrio/Sector</th> */}
                                <th>Direccion</th>
                                {/* <th>Referencia</th> */}
                                {/* <th>Longitud (X) Latitud (Y)</th> */}
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listFichaPersonal.map((ficha) => (
                                <tr
                                    className="text-center"
                                    key={ficha.idFichaPersonal?.toString()}
                                >

                                    <td>{ficha.idFichaPersonal}</td>
                                    <td>{ficha.ciIdentidad}</td>
                                    <td>{ficha.apellidos} {ficha.nombres}</td>
                                    <td>{ficha.nacionalidad}</td>
                                    {/* <td>{ficha.fechaNacimiento
                                        ? new Date(
                                            ficha.fechaNacimiento
                                        ).toLocaleDateString("es-ES", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                        })
                                        : ""}</td> */}

                                    <td>{ficha.fechaNacimiento}</td>
                                    {/* <td>{ficha.rangoEdad?.limInferior} - {ficha.rangoEdad?.limSuperior}</td> */}
                                    <td>{ficha.genero}</td>
                                    <td>{ficha.etnia?.etniaNombre}</td>
                                    <td>{ficha.parroquia?.canton.cantonNombre}</td>
                                    {/* <td>{ficha.zona}</td> */}
                                    {/* <td>{ficha.barrioSector}</td> */}
                                    <td>{ficha.direccion}</td>
                                    {/* <td>{ficha.referencia}</td> */}
                                    {/* <td>{ficha.coordenadaX}  {ficha.coordenadaY}</td> */}
                                    <td style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                                        <Button
                                            type="button"
                                            className=""
                                            label="✎"
                                            style={{
                                                background: "#ff0000",
                                                borderRadius: "10%",
                                                fontSize: "25px",
                                                width: "50px",
                                                color: "black",
                                                justifyContent: "center",
                                            }}
                                            onClick={() =>
                                                handleEdit(ficha.idFichaPersonal?.valueOf())
                                            }
                                        // Agrega el evento onClick para la operación de editar
                                        />
                                        <Button
                                            type="button"
                                            className=""
                                            label="✘"
                                            style={{
                                                background: "#ff0000",
                                                borderRadius: "10%",
                                                fontSize: "25px",
                                                width: "50px",
                                                color: "black",
                                                justifyContent: "center",
                                            }}
                                            onClick={() =>
                                                handleDelete(ficha.idFichaPersonal?.valueOf())
                                            }
                                        />
                                    </td>


                                </tr>



                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </Fieldset >

    );
};

export default FichaPersonal;
