import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import cardHeader from "../../shared/CardHeader";
import { IUsuario } from "../../interfaces/IUsuario";
import { IPersona } from "../../interfaces/IPersona";
import { IRol } from "../../interfaces/IRol";
import { UserService } from "../../services/UsuarioService";
import { PersonaService } from "../../services/PersonaService";
import { RolService } from "../../services/RolService";
import swal from "sweetalert";
import toast, { Toaster } from "react-hot-toast";
import { Calendar, CalendarChangeEvent } from "primereact/calendar";
import { Divider } from "primereact/divider";
import { ReportBar } from "../../common/ReportBar";
import { IExcelReportParams, IHeaderItem } from "../../interfaces/IExcelReportParams";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

import { Password } from 'primereact/password';


interface busqueda {
    ciNombre: string,
    rol: IRol,
}

function UsuarioContext() {

    const [listRoles, setListRoles] = useState<IRol[]>([]);
    const [listUsuarios, setListUsuarios] = useState<IUsuario[]>([]);

    const [busqueda, setBusqueda] = useState<busqueda>({
        ciNombre: '',
        rol: { idRol: 0, descripcionRol: '', nombreRol: '' },
    });

    const [formDataUsu, setFormDataUsu] = useState<IUsuario>({
        idUsuario: 0,
        username: '',
        password: '',
        fechaRegistro: new Date(),
        persona: null,
        rol: null,
    });
    const [confirmPass, setConfirmPass] = useState<string>();

    const [formDataPer, setFormDataPer] = useState<IPersona>({
        idPersona: 0,
        nombresPersona: '',
        apellidosPersona: '',
        ciPasaporte: '',
        tipoIdentificacion: '',
    });


    const tipoDocumentoOpc = [
        { label: "Cédula", value: "Cédula" },
        { label: "Pasaporte", value: "Pasaporte" },
    ];

    const loadRoles = () => {
        rolService
            .getAll()
            .then((data) => {
                setListRoles(data);
                // setDataLoaded(true); // Marcar los datos como cargados
            })
            .catch((error) => {
                console.error("Error al obtener los datos:", error);
            });
    };

    const personaService = new PersonaService();
    const usuarioService = new UserService();
    const rolService = new RolService();

    const [editMode, setEditMode] = useState(false);
    const [editItemId, setEditItemId] = useState<number | undefined>(undefined);
    const [dataLoaded, setDataLoaded] = useState(false);

    const [excelReportData, setExcelReportData] = useState<IExcelReportParams | null>(null);


    useEffect(() => {
        loadData();
        loadRoles();
    }, []);

    useEffect(() => {
        loadRelacion();
    }, [busqueda]); // Se ejecutará cuando busqueda cambie



    const loadData = () => {
        usuarioService
            .getAll()
            .then((data) => {
                setListUsuarios(data);
                setDataLoaded(true);
                loadExcelReportData(data);
            })
            .catch((error) => {
                console.error("Error al obtener los datos:", error);
            });

    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formDataPer.ciPasaporte) {
            toast.error("Ingrese el documento de identidad", {
                style: {
                    fontSize: '15px'
                },
                duration: 3000,
            })
        } else {

            if (!formDataUsu.username) {
                toast.error("Ingrese un nombre de usuario", {
                    style: {
                        fontSize: '15px'
                    },
                    duration: 3000,
                })
            } else {
                personaService
                    .existsDNI(formDataPer.ciPasaporte)
                    .then((resP) => {


                        if (resP) {
                            toast.error("El número de identificacion que ingreso ya se encuentra registrado", {
                                style: {
                                    fontSize: '15px'
                                },
                                duration: 3000,
                            })
                        } else {
                            usuarioService
                                .existsUsername(formDataUsu.username)
                                .then((res) => {

                                    if (res) {
                                        toast.error("El nombre de usuario ya existe, por favor ingrese uno nuevo", {
                                            style: {
                                                fontSize: '15px'
                                            },
                                            duration: 3000,
                                        })
                                    } else {
                                        if (validaciones()) {

                                            personaService
                                                .save(formDataPer)
                                                .then((personaResponse) => {
                                                    const userData = { ...formDataUsu, persona: { idPersona: personaResponse.idPersona } };


                                                    usuarioService
                                                        .save(userData)
                                                        .then((userResponse) => {
                                                            loadData();
                                                            resetForm();
                                                            swal("Usuario", "Registrado correctamente", "success");
                                                        })
                                                        .catch((userResponse) => {
                                                            console.error(
                                                                "Error al enviar el formulario del docente:",
                                                                userResponse
                                                            );
                                                        });
                                                })
                                                .catch((personaError) => {
                                                    console.error(
                                                        "Error al enviar el formulario de la persona:",
                                                        personaError
                                                    );
                                                });
                                        }
                                    }


                                })
                                .catch((personaError) => {
                                    console.error(
                                        "Error al enviar el formulario de la persona:",
                                        personaError
                                    );
                                });

                        }
                    })
                    .catch((personaError) => {
                        console.error(
                            "Error al enviar el formulario de la persona:",
                            personaError
                        );
                    });

            }



        }




    }

    const handleEdit = (id: number | undefined) => {
        if (id !== undefined) {
            const editItem = listUsuarios.find(
                (user) => user.idUsuario === id
            );

            if (editItem) {
                const editedItem = { ...editItem }

                if (typeof editedItem.fechaRegistro === 'string') {
                    const registro = new Date(editedItem.fechaRegistro);
                    registro.setDate(registro.getDate() + 1);
                    const formattedDate = registro
                        ? registro.toISOString().split('T')[0]
                        : '';
                    editedItem.fechaRegistro = formattedDate;
                }

                if (editedItem.persona) {
                    setFormDataPer(editedItem.persona);
                }
                setConfirmPass(editItem.password)
                setFormDataUsu(editedItem)
                setEditMode(true);
                setEditItemId(id);


            }



        }
    }

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editItemId !== undefined) {

            if (validaciones()) {
                usuarioService
                    .update(Number(editItemId), formDataUsu as IUsuario)
                    .then((response) => {
                        personaService
                            .update(Number(formDataPer.idPersona), formDataPer as IPersona)
                            .then((res) => {
                                loadData();
                                resetForm();
                                setEditMode(false);

                                swal({
                                    title: "Actualización exitosa",
                                    text: "Datos actualizados correctamente",
                                    icon: "success",
                                });
                            }).catch((error) => {
                                console.error("Error al actualizar el formulario:", error);
                            });



                    }).catch((error) => {
                        console.error("Error al actualizar el formulario:", error);
                    });
            }

        }

    }

    const handleDelete = (idPer: number | undefined) => {
        if (idPer !== undefined) {

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
                    personaService
                        .delete(idPer)
                        .then(() => {


                            loadData();
                            swal(
                                "Eliminado",
                                "El registro ha sido eliminado correctamente",
                                "error"
                            );




                        })
                        .catch((error) => {
                            console.error("Error al eliminar el PERSONA:", error);
                            swal(
                                "Error",
                                "Ha ocurrido un error al eliminar el registro",
                                "error"
                            );
                        });
                }
            });

        }
    }

    const loadRelacion = () => {

        usuarioService
            .filtroUser(busqueda.ciNombre, busqueda.rol.idRol)
            .then((data: IUsuario[]) => {


                loadExcelReportData(data);
                setListUsuarios(data); // Establecer los datos procesados en el estado
                // setDataLoaded(true); // Puedes marcar los datos como cargados si es necesario
            })
            .catch((error) => {
                console.error("Error al obtener los datos:", error);
            });
    };


    const resetBusqueda = () => {
        setBusqueda({
            ciNombre: '',
            rol: { idRol: 0, descripcionRol: '', nombreRol: '' },
        })
    }

    function validaciones(): boolean {

        if (!formDataPer.tipoIdentificacion) {
            toast.error("Seleccione el tipo de identificación del usuario", {
                style: {
                    fontSize: '15px'
                },
                duration: 3000,
            })
            return false
        }

        if (!formDataPer.ciPasaporte) {
            toast.error("Ingrese el numero de identificación del usuario", {
                style: {
                    fontSize: '15px'
                },
                duration: 3000,
            })
            return false
        }

        if (!formDataPer.nombresPersona) {
            toast.error("Ingrese los nombres del usuario", {
                style: {
                    fontSize: '15px'
                },
                duration: 3000,
            })
            return false
        }

        if (!formDataPer.apellidosPersona) {
            toast.error("Ingrese los apellidos del usuario", {
                style: {
                    fontSize: '15px'
                },
                duration: 3000,
            })
            return false
        }

        if (!formDataUsu.username) {
            toast.error("Ingrese un nombre de usuario", {
                style: {
                    fontSize: '15px'
                },
                duration: 3000,
            })
            return false
        }

        if (!formDataUsu.password) {
            toast.error("Ingrese la contraseña del usuario", {
                style: {
                    fontSize: '15px'
                },
                duration: 3000,
            })
            return false
        } else {
            if (formDataUsu.password.length < 4) {
                toast.error("La contraseña debe contener almenos 4 caracteres", {
                    style: {
                        fontSize: '15px'
                    },
                    duration: 3000,
                })
                return false
            } else {
                if (formDataUsu.password !== confirmPass) {
                    toast.error("Las contraseñas no coinciden", {
                        style: {
                            fontSize: '15px'
                        },
                        duration: 3000,
                    })
                    return false
                }
            }
        }

        if (!formDataUsu.rol) {
            toast.error("Seleccione el rol que desempeña el usuario", {
                style: {
                    fontSize: '15px'
                },
                duration: 3000,
            })
            return false
        }

        return true
    }

    const resetForm = () => {
        setFormDataUsu({
            fechaRegistro: new Date(),
            password: '',
            persona: null,
            rol: null,
            username: '',
            idUsuario: 0
        })

        setFormDataPer({
            apellidosPersona: '',
            ciPasaporte: '',
            idPersona: 0,
            nombresPersona: '',
            tipoIdentificacion: '',
        })

        setConfirmPass('')
        setEditMode(false);

    }

    function loadExcelReportData(data: IUsuario[]) {
        const reportName = "Usuarios"
        const logo = 'G1:I1'

        const rowData = data.map((item) => (
            {
                idUser: item.idUsuario,
                nombres: item.persona?.nombresPersona,
                apellidos: item.persona?.apellidosPersona,
                tipoIdenti: item.persona?.tipoIdentificacion,
                ident: item.persona?.ciPasaporte,
                username: item.username,
                rol: item.rol?.nombreRol,
                fechaRegistro: item.fechaRegistro,
            }
        ));
        const headerItems: IHeaderItem[] = [
            { header: "№ USUARIO" },
            { header: "NOMBRES" },
            { header: "APELLIDOS" },
            { header: "TIPO IDENTIFICACIÓN" },
            { header: "CI/PASAPORTE" },
            { header: "USUARIO" },
            { header: "ROL" },
            { header: "FECHA DE REGISTRO" },
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
                    style={{ marginBottom: "35px", maxWidth: "1150px" }}
                >

                    <div
                        className="h1-rem"
                        style={{ display: 'flex', justifyContent: 'center' }}
                    >
                        <h1 className="text-5xl font-smibold lg:md-2 h-full max-w-full max-h-full min-w-min">
                            Registro de Usuario
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
                                    setFormDataUsu({
                                        ...formDataUsu,
                                        fechaRegistro: e.value,
                                    });
                                }
                            }}

                            value={typeof formDataUsu.fechaRegistro === 'string' ? new Date(formDataUsu.fechaRegistro) : new Date()}

                        />
                    </div>

                    <section className='container' style={{}}>



                        <form onSubmit={editMode ? handleUpdate : handleSubmit} className='form' encType="multipart/form-data">
                            <Divider align="left">
                                <div className="inline-flex align-items-center">
                                    <i className="pi pi-book mr-2"></i>
                                    <b>Formulario </b>
                                </div>
                            </Divider>
                            <div className='column' style={{ width: "100%" }}>
                                <div className='input-box' style={{}}>
                                    <label className="font-medium w-auto min-w-min" htmlFor="tipoDocumento">Tipo de documento:</label>
                                    <div className=" " style={{ width: "100%" }}>
                                        <Dropdown
                                            className="text-2xl"
                                            id="tiempo_dedicacion"
                                            name="tiempo_dedicacion"
                                            style={{ width: "100%", height: "36px" }}
                                            options={tipoDocumentoOpc}
                                            onChange={(e) =>
                                                setFormDataPer({
                                                    ...formDataPer,
                                                    tipoIdentificacion: e.value, ciPasaporte: ''
                                                })
                                            }
                                            value={formDataPer.tipoIdentificacion}
                                            optionLabel="label"
                                            optionValue="value"
                                            placeholder="Seleccione el tipo de documento de identificación"
                                        />


                                    </div>

                                </div>




                                <div className='input-box' >
                                    <label className="font-medium w-auto min-w-min" htmlFor="cedula;">
                                        {!formDataPer.tipoIdentificacion
                                            ? 'Debe seleccionar el tipo de identificaicon'
                                            : formDataPer.tipoIdentificacion === 'Cédula'
                                                ? 'Cédula:'
                                                : 'Pasaporte:'}
                                    </label>

                                    <InputText
                                        placeholder={!formDataPer.tipoIdentificacion
                                            ? 'Se habilitara cuando seleccione el tipo de identificaicon'
                                            : formDataPer.tipoIdentificacion === 'Cédula'
                                                ? 'Ingrese el numero de cédula:'
                                                : 'Ingrese el numero de pasaporte:'}
                                        id="cedula"
                                        disabled={!formDataPer.tipoIdentificacion}
                                        maxLength={formDataPer.tipoIdentificacion === 'Cédula'
                                            ? 10
                                            : 1000} // Establecer el máximo de 10 caracteres
                                        keyfilter="pint" // Solo permitir dígitos enteros positivos
                                        onChange={(e) => setFormDataPer({ ...formDataPer, ciPasaporte: e.target.value })}
                                        title="Ingresar el documento de identidad del NNA"
                                        value={formDataPer.ciPasaporte}
                                    />
                                    <span className="input-border"></span>


                                </div>
                            </div>

                            <div className='column'>

                                <div className='input-box'>

                                    <label className="font-medium w-auto min-w-min" htmlFor="nombres">Nombres:</label>

                                    <InputText
                                        className="input"
                                        placeholder=' Ingresar los nombres'
                                        id="nombre"
                                        keyfilter={/^[A-Za-z\s]*$/} // Solo permitir caracteres alfabeticos
                                        onChange={(e) => setFormDataPer({ ...formDataPer, nombresPersona: e.target.value })}
                                        title="Ingresar los nombres del NNA"
                                        value={formDataPer.nombresPersona}
                                    />

                                    <span className="input-border"></span>

                                </div>

                                <div className='input-box'>
                                    <label className="font-medium w-auto min-w-min" htmlFor="apellidos">Apellidos:</label>

                                    <InputText
                                        className="input"
                                        placeholder=' Ingresar los apellidos'
                                        id="apellido"
                                        keyfilter={/^[A-Za-z\s]*$/} // Solo permitir caracteres alfabeticos
                                        onChange={(e) => setFormDataPer({ ...formDataPer, apellidosPersona: e.target.value })}
                                        title="Ingresar los apellidos del NNA"
                                        value={formDataPer.apellidosPersona}
                                    />
                                    <span className="input-border"></span>

                                </div>

                            </div>


                            <Divider />


                            <div className='column'>

                                <div className='input-box'>

                                    <label className="font-medium w-auto min-w-min" htmlFor="nombres">Nombres de Usuario:</label>

                                    <InputText
                                        className="input"
                                        placeholder=' Ingresar lel nombre de usuario'
                                        id="username"
                                        onChange={(e) => setFormDataUsu({ ...formDataUsu, username: e.target.value })}
                                        title="Ingresar los nombres del NNA"
                                        value={formDataUsu.username}
                                    />

                                    <span className="input-border"></span>

                                </div>

                                <div className='input-box'>
                                    <label className="font-medium w-auto min-w-min" htmlFor="apellidos">Contraseñá:</label>
                                    <Password
                                        className="input"
                                        // minLength={4}
                                        toggleMask
                                        style={{ width: "100%" }}
                                        placeholder='Ingrese una contraseña que contenga minimo 4 caracteres'
                                        id="apellido"
                                        value={formDataUsu.password}
                                        onChange={(e) => setFormDataUsu({ ...formDataUsu, password: e.target.value })}

                                    />

                                    <span className="input-border"></span>

                                </div>

                            </div>
                            <div className="column">

                                <div className='input-box'>
                                    <label className="font-medium w-auto min-w-min" htmlFor="provincia">Rol:</label>
                                    <div className=" ">

                                        <div className="flex justify-content-center">
                                            <Dropdown
                                                value={formDataUsu.rol?.idRol}
                                                onChange={(e: DropdownChangeEvent) => {
                                                    setFormDataUsu({ ...formDataUsu, rol: { idRol: parseInt(e.value), descripcionRol: '', nombreRol: '' } });

                                                }}
                                                options={listRoles}
                                                optionLabel="nombreRol"
                                                optionValue="idRol"
                                                placeholder="Seleccione el rol del usuario"
                                                style={{ width: "100%", height: "36px", alignItems: "center" }}
                                            />
                                        </div>

                                    </div>
                                </div>

                                <div className='input-box'>
                                    <label className="font-medium w-auto min-w-min" htmlFor="apellidos">Confirmar contraseñá:</label>
                                    <Password
                                        className="input"
                                        // minLength={4}
                                        toggleMask
                                        style={{ width: "100%" }}
                                        placeholder='Repita su contraseña'
                                        id="confirmPass"
                                        value={confirmPass}
                                        onChange={(e) => setConfirmPass(e.target.value)}

                                    />

                                    <span className="input-border"></span>

                                </div>
                            </div>


                            <div className='btnSend'>

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
                                        }}
                                    />
                                </div>
                            </div>
                        </form>
                    </section>
                    <div>
                        <Divider align="left">
                            <div className="inline-flex align-items-center">
                                <i className="pi pi-filter-fill mr-2"></i>
                                <b>Filtro</b>
                            </div>
                        </Divider>
                        <div className="opcTblLayout">

                            <div className="opcTbl" >
                                <label className="font-medium w-auto min-w-min" htmlFor='genero'>Cedula o Nombre:</label>

                                <div className="flex-1" >
                                    <InputText
                                        placeholder="Cedula de identidad"
                                        id="integer"
                                        // keyfilter="int"
                                        style={{ width: "75%" }}

                                        onChange={(e) => {
                                            // Actualizar el estado usando setFormData

                                            setBusqueda({ ...busqueda, ciNombre: e.currentTarget.value });

                                            // Luego, llamar a loadRelacion después de que se actualice el estado
                                            loadRelacion();
                                        }}

                                        value={busqueda.ciNombre}
                                    />

                                    <Button icon="pi pi-search" className="p-button-warning" />
                                </div>
                            </div>

                            <div className="opcTbl" >
                                <label className="font-medium w-auto min-w-min" htmlFor="provincia">Rol:</label>

                                <div className="" style={{ paddingRight: "25px" }}>
                                    <Dropdown
                                        value={busqueda.rol.idRol}
                                        onChange={(e: DropdownChangeEvent) => {
                                            setBusqueda({ ...busqueda, rol: { idRol: parseInt(e.value), descripcionRol: '', nombreRol: '' } });
                                            loadRelacion();

                                        }}
                                        options={listRoles}
                                        optionLabel="nombreRol"
                                        optionValue="idRol"
                                        placeholder="Rol del usuario"
                                        style={{ width: "100%", height: "36px", alignItems: "center" }}
                                    />
                                </div>
                            </div>

                            <div className="opcTbl">
                                <label className="font-medium w-auto min-w-min" htmlFor='estado'>Refrescar tabla:</label>

                                <Button className="buttonIcon" // Agrega una clase CSS personalizada
                                    icon="pi pi-refresh" style={{ width: "120px", height: "39px" }} severity="danger" aria-label="Cancel" onClick={resetBusqueda} />

                            </div>


                            <div className="" style={{ flex: 1, paddingTop: '24px' }}>
                                <ReportBar
                                    reportName={excelReportData?.reportName!}
                                    headerItems={excelReportData?.headerItems!}
                                    rowData={excelReportData?.rowData!}
                                    logo={excelReportData?.logo!}
                                />
                            </div>
                        </div>
                    </div>
                    <Divider align="left">
                        <div className="inline-flex align-items-center">
                            <i className="pi pi-list mr-2"></i>
                            <b>Lista  </b>
                        </div>
                    </Divider>

                    <div className="tblContainer" >

                        <table className="tableFichas">
                            <thead className="theadTab" >

                                <tr style={{ backgroundColor: "#871b1b", color: "white" }}>
                                    <th className="trFichas">Nº de Registro </th>
                                    <th className="trFichas">Indentificación</th>
                                    <th className="trFichas">Nombres</th>
                                    <th className="trFichas">Apellidos</th>
                                    <th className="trFichas">Usuario</th>
                                    <th className="trFichas">Rol</th>
                                    <th className="trFichas">Editar</th>
                                    <th className="trFichas">Eliminar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listUsuarios.map((user) => (
                                    <tr
                                        className="text-center"
                                        key={user.idUsuario?.toString()}
                                    >

                                        <td className="tdFichas">{user.idUsuario}</td>
                                        <td className="tdFichas">{user.persona?.ciPasaporte}</td>
                                        <td className="tdFichas">{user.persona?.nombresPersona}</td>
                                        <td className="tdFichas">{user.persona?.apellidosPersona}</td>
                                        <td className="tdFichas">{user.username}</td>
                                        <td className="tdFichas">{user.rol?.nombreRol}</td>

                                        <td className="tdFichas">
                                            <Button className="buttonIcon"
                                                type="button"
                                                icon="pi pi-file-edit"
                                                title="Editar"

                                                style={{
                                                    background: "#ff0000",
                                                    borderRadius: "10%",
                                                    fontSize: "25px",
                                                    width: "50px",
                                                    color: "black",
                                                    justifyContent: "center",
                                                }}
                                                onClick={() =>
                                                    handleEdit(user.idUsuario?.valueOf())
                                                }
                                            // Agrega el evento onClick para la operación de editar
                                            />

                                        </td>

                                        <td className="tdFichas">
                                            <Button className="buttonIcon"
                                                type="button"
                                                icon="pi pi-trash"
                                                title="Eliminar"

                                                style={{
                                                    background: "#ff0000",
                                                    borderRadius: "10%",
                                                    fontSize: "25px",
                                                    width: "50px",
                                                    color: "black",
                                                    justifyContent: "center",
                                                }}
                                                onClick={() =>
                                                    handleDelete(user.persona?.idPersona?.valueOf())
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
        </>
    );












}

export default UsuarioContext;