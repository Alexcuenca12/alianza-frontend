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



import { IFichaPersonal } from "../../interfaces/IFichaPersonal";
import { FichaPersonalService } from "../../services/FichaPersonalService";
import { IBusquedaReporte } from "../../interfaces/IBusquedaReporte";
import '../../styles/Reporte.css'
import * as XLSX from 'xlsx';

function Reporte() {

    const fichaPersonalService = new FichaPersonalService();


    const [listRangoEdades, setListRangoEdades] = useState<IRangoEdad[]>([]);

    // const [busquedaCI, setBusquedaCI] = useState<string>('');
    // const [busquedaSex, setBusquedaSex] = useState<string>('');
    // const [busquedaEdad, setBusquedaEdad] = useState<number>(3);
    // const [busquedaVinc, setBusquedaVinc] = useState<boolean>(true);

    const [formData, setFormData] = useState<IBusquedaReporte>({
        cedula: '',
        genero: '',
        rangoEdad: 0,
        estado: true
    });

    const rangoEdadService = new RangoEdadService();

    const [listFichaPersonal, setListFichaPersonal] = useState<IFichaPersonal[]>([]);



    useEffect(() => {

        loadComboEdades();
        loadData();

    }, [formData.cedula, formData.genero, formData.rangoEdad, formData.estado]);


    const loadData = () => {


        if (formData.rangoEdad === 0) {
            // console.log("4 SIN EDAD")
            fichaPersonalService
                .getBusqueda(formData.cedula, formData.genero, formData.estado)
                .then((data) => {
                    setListFichaPersonal(data);
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
                    // setDataLoaded(true); // Marcar los datos como cargados
                })
                .catch((error) => {
                    console.error("Error al obtener los datos:", error);
                });
        }

        console.log('Datos enviados:', { formData });

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

    const generarExcel = () => {
        const wb = XLSX.utils.book_new();

        // Crear una copia de la lista excluyendo el campo 'foto'
        const listSinFoto = listFichaPersonal.map(({ foto, ...rest }) => rest);

        const ws = XLSX.utils.json_to_sheet(listSinFoto);

        // Resto del código para aplicar estilos y encabezados (como se mostró en tu código original) ...

        XLSX.utils.book_append_sheet(wb, ws, 'FichaPersonal');

        // Descargar el archivo Excel
        XLSX.writeFile(wb, 'fichapersonal.xlsx');
    };


    const resetForm = () => {
        setFormData({
            cedula: '',
            genero: '',
            estado: true,
            rangoEdad: 0
        })
    };

    return (
        <Fieldset className="" style={{ display: 'flex', justifyContent: 'center' }}>
            <Card
                header={cardHeader}
                className="border-solid border-red-800 border-3 "
                style={{ width: "1200px", marginLeft: "90px", height: "688px" }}
            >
                <div
                    className="h1-rem"
                    style={{ display: 'flex', justifyContent: 'center' }}
                >
                    <h1 className="text-5xl font-smibold lg:md-2   h-full max-w-full max-h-full min-w-min">
                        Reporte
                    </h1>
                </div>



                {/* <div > */}
                {/* <div className="card"> */}
                <Fieldset legend="Filtros de busqueda" >
                    <section className="layout">


                        <div></div>
                        <div></div>
                        <div>
                            <button onClick={generarExcel}>Generar Excel</button>

                        </div>
                        <div style={{ textAlign: 'right', marginRight: "" }}>
                            <label className="font-medium w-auto min-w-min" htmlFor="rangoEdad" style={{ marginRight: "15px" }}>Limpiar filtros:</label>

                            <Button icon="pi pi-times" rounded severity="danger" aria-label="Cancel" onClick={() => resetForm()} />
                        </div>
                        <div className="filter">
                            <div>
                                <label className="font-medium w-auto min-w-min" htmlFor='genero'>Cedula:</label>

                                <div className="flex-1">
                                    <InputText
                                        placeholder="Cedula de identidad"
                                        id="integer"
                                        keyfilter="int"
                                        onChange={(e) => {
                                            // Actualizar el estado usando setFormData
                                            setFormData({
                                                ...formData,
                                                cedula: e.currentTarget.value,
                                            });

                                            // Luego, llamar a loadData después de que se actualice el estado
                                            loadData();
                                        }}
                                        value={formData.cedula}
                                    />

                                    <Button icon="pi pi-search" className="p-button-warning" />
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
                                                <label>
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
                                                        }}

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
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, genero: e.target.value })
                                                            loadData()
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
                                                <label>
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
                                                        }}
                                                    />
                                                    <span>Vinculado</span>
                                                </label>
                                                <label>
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


                <div style={{ marginTop: "50px" }}>
                    <table
                        style={{ minWidth: "40rem" }}
                        className="mt-4  w-full h-full text-3xl font-large"
                    >
                        <thead>
                            <tr style={{ backgroundColor: "#871b1b", color: "white" }}>
                                <th>Nº de Registro</th>
                                <th>Centro Educativo</th>
                                <th>Dirección </th>
                                <th>Referencia</th>
                                <th>Jornada de Asistencia</th>
                                <th>Observaciones</th>
                                <th>Grado</th>
                                <th>Operaciones</th>
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


                                </tr>



                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </Fieldset>
    );
}
export default Reporte;