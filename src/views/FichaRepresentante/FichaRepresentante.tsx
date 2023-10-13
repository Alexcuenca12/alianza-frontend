import React, { useEffect, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import cardHeader from "../../shared/CardHeader";
import { Divider } from "primereact/divider";
import { IFichaRepresentante } from "../../interfaces/IFichaRepresentante";
import { FichaRepresentanteService } from "../../services/FichaRepresentanteService";
import swal from "sweetalert";
import { InputTextarea } from "primereact/inputtextarea";
import '../../styles/FiltroFichas.css'
import { FichaPersonalService } from "../../services/FichaPersonalService";
import { IFichaPersonal } from "../../interfaces/IFichaPersonal";
import { IExcelReportParams, IHeaderItem } from "../../interfaces/IExcelReportParams";
import { ReportBar } from "../../common/ReportBar";
import { Calendar, CalendarChangeEvent } from 'primereact/calendar';



function FichaInscripcionContext() {
  //Session Storage
  /*const userData = sessionStorage.getItem("user");
  const userObj = JSON.parse(userData || "{}");
  const idPersona = userObj.id;*/
  const fichaPersonalService = new FichaPersonalService();

  const [busqueda, setBusqueda] = useState<string>('');
  const [foto, setFoto] = useState<string>('https://cdn-icons-png.flaticon.com/128/666/666201.png');
  const [listFperonales, setListFperonales] = useState<IFichaPersonal[]>([]);
  const [excelReportData, setExcelReportData] = useState<IExcelReportParams | null>(null);




  const [contra1, setcontra1] = useState<IFichaRepresentante[]>([]);
  const [formData, setFormData] = useState<IFichaRepresentante>({
    idFichaRepresentante: 0,
    nombresRepre: "",
    apellidosRepre: "",
    cedulaRepre: "",
    contactoRepre: "",
    contactoEmergenciaRepre: "",
    fechaNacimientoRepre: "",
    ocupacionPrimariaRepre: "",
    ocupacionSecundariaRepre: "",
    lugarTrabajoRepre: "",
    observacionesRepre: "",
    nivelInstruccionRepre: "",
    parentescoRepre: "",
    fichaInscripcion: null,
    fichaPersonal: null,
    fechaRegistro: new Date

  });

  const fileUploadRef = useRef<FileUpload>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<number | undefined>(undefined);
  const repreService = new FichaRepresentanteService();

  const loadData = () => {
    repreService
      .getAll()
      .then((data) => {
        setcontra1(data);
        loadExcelReportData(data);
        setDataLoaded(true); // Marcar los datos como cargados
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };
  useEffect(() => {
    loadData();
  }, []);

  const validarCampos = () => {
    if (
      !formData.nombresRepre ||
      !formData.apellidosRepre ||
      !formData.cedulaRepre ||
      !formData.contactoRepre ||
      !formData.contactoEmergenciaRepre ||
      !formData.ocupacionPrimariaRepre ||
      !formData.lugarTrabajoRepre ||
      !formData.observacionesRepre ||
      !formData.nivelInstruccionRepre ||
      !formData.parentescoRepre ||
      !formData.fechaNacimientoRepre
    ) {
      swal("Advertencia", "Por favor, complete todos los campos", "warning");
      return false;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();


    repreService
      .save(formData)
      .then((response) => {
        resetForm();
        swal("Publicacion", "Datos Guardados Correctamente", "success");
        if (fileUploadRef.current) {
          fileUploadRef.current.clear();
        }
        loadData();
      })
      .catch((error) => {
        console.error("Error al enviar el formulario:", error);
      });
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
          repreService
            .delete(id)
            .then(() => {
              setcontra1(
                contra1.filter((contra) => contra.idFichaRepresentante !== id)
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
      const editItem = contra1.find(
        (contra) => contra.idFichaRepresentante === id
      );
      if (editItem) {
        setFormData(editItem);

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
      repreService
        .update(Number(editItemId), formData as IFichaRepresentante)
        .then((response) => {
          swal({
            title: "Publicaciones",
            text: "Datos actualizados correctamente",
            icon: "success",
          });
          setFormData({
            nombresRepre: "",
            apellidosRepre: "",
            cedulaRepre: "",
            contactoRepre: "",
            contactoEmergenciaRepre: "",
            fechaNacimientoRepre: "",
            ocupacionPrimariaRepre: "",
            ocupacionSecundariaRepre: "",
            lugarTrabajoRepre: "",
            observacionesRepre: "",
            nivelInstruccionRepre: "",
            parentescoRepre: "",
            fichaInscripcion: null,
            fichaPersonal: null,
            fechaRegistro: new Date

          });
          loadData();
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
      nombresRepre: "",
      apellidosRepre: "",
      cedulaRepre: "",
      contactoRepre: "",
      contactoEmergenciaRepre: "",
      fechaNacimientoRepre: "",
      ocupacionPrimariaRepre: "",
      ocupacionSecundariaRepre: "",
      lugarTrabajoRepre: "",
      observacionesRepre: "",
      nivelInstruccionRepre: "",
      parentescoRepre: "",
      fichaInscripcion: null,
      fichaPersonal: null,
      fechaRegistro: new Date

    });
    setEditMode(false);
    setEditItemId(undefined);
    if (fileUploadRef.current) {
      fileUploadRef.current.clear(); // Limpiar el campo FileUpload
    }
  };
  if (!dataLoaded) {
    return <div style={{ marginLeft: "50%" }}>Cargando datos...</div>;
  }


  const loadRelacion = () => {

    // console.log("4 SIN EDAD")
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

  const resetFiltro = () => {
    setBusqueda('')
    setFoto('https://cdn-icons-png.flaticon.com/128/666/666201.png')
    setListFperonales([])


  };

  function loadExcelReportData(data: IFichaRepresentante[]) {
    const reportName = "Ficha del Representante"
    const logo = 'G1:K1'
    const rowData = data.map((item) => (
      {
        idFicha: item.idFichaRepresentante,
        cedula: item.fichaPersonal?.ciPasaporte,
        nombres: item.fichaPersonal?.nombres,
        apellidos: item.fichaPersonal?.apellidos,

      }
    ));
    const headerItems: IHeaderItem[] = [
      { header: "№ FICHA" },
      { header: "CEDULA" },
      { header: "NOMBRES" },
      { header: "APELLIDOS" },
      { header: "FECHA DE DESVINCULACIÓN" },
      { header: "MOTIVO" },


    ]
    console.log(reportName, '  //  ',
      headerItems, '  //  ',
      rowData)

    setExcelReportData({
      reportName,
      headerItems,
      rowData,
      logo
    }
    )
  }

  const loadDataID = (id: number) => {
    setcontra1([]);
    repreService
      .getBusquedaID(id)
      .then((data) => {
        setcontra1(data);
        loadExcelReportData(data);
        setDataLoaded(true); // Marcar los datos como cargados
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };



  return (
    <Fieldset className="fgrid col-fixed ">
      <Card
        header={cardHeader}
        className="border-solid border-red-800 border-3 flex-1 flex-wrap"
        style={{ width: "95%", marginLeft: "5%", height: "100%" }}
      >
        <div
          className="h1-rem"
          style={{ marginLeft: "40%", marginBottom: "20px" }}
        >
          <h1 className="text-5xl font-smibold lg:md-2  w-full h-full max-w-full max-h-full min-w-min">
            Ficha del Representante
          </h1>
        </div>


        <div className="" style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "right" }}>
          <label className="font-medium w-auto min-w-min" htmlFor="fichaPersonal" style={{ marginRight: "10px" }}>Fecha de Registro:</label>
          <Calendar
            disabled
            style={{ width: "95px", marginRight: "25px", fontWeight: "bold" }}
            value={formData.fechaRegistro}
            onChange={(e: CalendarChangeEvent) => {
              if (e.value !== undefined) {
                setFormData({
                  ...formData,
                  fechaRegistro: e.value,
                });
              }
            }} />
        </div>

        <div className="flex justify-content-center flex-wrap container">
          <Fieldset legend="Filtros de busqueda" style={{ width: "1000px", marginBottom: "35px", position: "relative" }}>
            <div style={{ position: "absolute", top: "0", right: "5px", marginTop: "-15px" }}>
              <label className="font-medium w-auto min-w-min" htmlFor="rangoEdad" style={{ marginRight: "10px" }}>Limpiar filtros:</label>

              <Button icon="pi pi-times" rounded severity="danger" aria-label="Cancel" onClick={() => resetFiltro()} />
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

                      onKeyUp={(e) => {
                        setListFperonales([]); // Asignar un arreglo vacío para vaciar el estado listFperonales

                        setBusqueda(e.currentTarget.value);

                        // Luego, llamar a loadRelacion después de que se actualice el estado
                        loadRelacion();
                        loadRelacion(); // Llama a tu método aquí o realiza las acciones necesarias.
                      }}

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
                          fechaRegistro: null
                        }
                      });
                      cargarFoto(parseInt(e.value))
                      loadDataID(parseInt(e.value))
                      console.log(formData)
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

          <Divider />

          <form
            onSubmit={editMode ? handleUpdate : handleSubmit}
            encType="multipart/form-data"
          >
            <div className="flex flex-wrap flex-row" style={{ justifyContent: "center" }}>
              <div className="flex align-items-center justify-content-center" style={{ margin: "10px" }}>
                <div className="flex flex-column flex-wrap gap-4" style={{ marginRight: "35px" }}>
                  <div className="flex flex-wrap w-full h-full " style={{ justifyContent: "right" }}>
                    <label
                      htmlFor="cedulaRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "10px" }}
                    >
                      Cédula del representate:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="cedulaRepre"
                      name="cedulaRepre"
                      maxLength={10} // Establecer el máximo de 10 caracteres
                      keyfilter="pint" // Solo permitir dígitos enteros positivos
                      required
                      placeholder="Ingrese la Cédula"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cedulaRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.cedulaRepre}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full " style={{ justifyContent: "right" }}>
                    <label
                      htmlFor="centro"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "10px" }}
                    >
                      Nombres Representante:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="inicio"
                      name="centro"
                      keyfilter={/^[A-Za-z\s]*$/} // Solo permitir caracteres 
                      placeholder="Ingrese los Nombres del Representate"
                      required
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nombresRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.nombresRepre}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full " style={{ justifyContent: "right" }}>
                    <label
                      htmlFor="apellidosRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "10px" }}
                    >
                      Apellidos Representante:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="apellidosRepre"
                      name="apellidosRepre"
                      keyfilter={/^[A-Za-z\s]*$/} // Solo permitir caracteres 
                      required
                      placeholder="Ingrese los Apellidos del Representante"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          apellidosRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.apellidosRepre}
                    />
                  </div>

                  <div className="flex flex-wrap w-full h-full " style={{ justifyContent: "right" }}>
                    <label
                      htmlFor="parentescoRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "10px" }}
                    >
                      Parentesco:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="parentescoRepre"
                      name="parentescoRepre"
                      keyfilter={/^[A-Za-z\s]*$/} // Solo permitir caracteres 
                      placeholder="Ingrese el Parentesco"
                      required
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          parentescoRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.parentescoRepre}
                    />
                  </div>
                </div>
                <div
                  className="flex flex-column flex-wrap gap-4" style={{ marginRight: "35px" }}>
                  <div className="flex flex-wrap w-full h-full " style={{ justifyContent: "right" }}>
                    <label
                      htmlFor="contactoRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "10px" }}
                    >
                      Nº de Contacto:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese el nº de Contacto"
                      id="contactoRepre"
                      name="contactoRepre"
                      keyfilter={/^[\d\s+]*$/}
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactoRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.contactoRepre}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full " style={{ justifyContent: "right" }}>
                    <label
                      htmlFor="contactoEmergenciaRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "10px" }}
                    >
                      Nº de Emergencia:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese el nº de emergencia"
                      id="contactoEmergenciaRepre"
                      name="contactoEmergenciaRepre"
                      keyfilter={/^[\d\s+]*$/}
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactoEmergenciaRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.contactoEmergenciaRepre}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full " style={{ justifyContent: "right" }}>
                    <label
                      htmlFor="tiempo_dedicacion"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "10px" }}
                    >
                      Fecha de Nacimiento:
                    </label>
                    <Calendar
                      className="text-2xl"
                      id="fechaNacimientoRepre"
                      name="fechaNacimientoRepre"
                      placeholder="Ingrese la fecha de nacimiento"
                      required
                      dateFormat="yy-mm-dd"
                      showIcon
                      maxDate={new Date()}
                      onChange={(e) => {
                        const selectedDate =
                          e.value instanceof Date ? e.value : null;
                        const formattedDate = selectedDate
                          ? selectedDate.toISOString().split("T")[0]
                          : "";
                        setFormData({
                          ...formData,
                          fechaNacimientoRepre: formattedDate,
                        });
                      }}
                      value={
                        formData.fechaNacimientoRepre
                          ? new Date(formData.fechaNacimientoRepre)
                          : null
                      }
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full " style={{ justifyContent: "right" }}>
                    <label
                      htmlFor="nivelInstruccionRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "10px" }}
                    >
                      Nivel de Instrucción:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="nivelInstruccionRepre"
                      style={{ width: "221px" }}
                      name="nivelInstruccionRepre"
                      placeholder="Ingrese el Nivel de Instrucción"
                      required
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nivelInstruccionRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.nivelInstruccionRepre}
                    />
                  </div>
                </div>
                <div className="flex flex-column flex-wrap gap-4">
                  <div className="flex flex-wrap w-full h-full " style={{ justifyContent: "right" }}>

                    <label
                      htmlFor="ocupacionPrimariaRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "10px" }}

                    >
                      Ocupación Representante:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="ocupacionPrimariaRepre"
                      name="ocupacionPrimariaRepre"
                      placeholder="Ingrese la Ocupación del Representante"
                      required
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ocupacionPrimariaRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.ocupacionPrimariaRepre}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full " style={{ justifyContent: "right" }}>
                    <label
                      htmlFor="ocupacionSecundariaRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "10px" }}
                    >
                      Ocupación Secundaria:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="ocupacionSecundariaRepre"
                      name="ocupacionSecundariaRepre"
                      required
                      placeholder="Ingrese la Ocupación Secundaria del Representante"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ocupacionSecundariaRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.ocupacionSecundariaRepre}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full " style={{ justifyContent: "right" }}>
                    <label
                      htmlFor="lugarTrabajoRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "10px" }}
                    >
                      Lugar de Trabajo:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="lugarTrabajoRepre"
                      name="lugarTrabajoRepre"
                      required
                      placeholder="Ingrese el Lugar de Trabajo"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lugarTrabajoRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.lugarTrabajoRepre}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full " style={{ justifyContent: "right" }}>
                    <label
                      htmlFor="observacionesRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "10px" }}
                    >
                      Observaciones:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      id="observacionesRepre"
                      name="observacionesRepre"
                      style={{ width: "193px" }}
                      required
                      placeholder="Observaciones"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          observacionesRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.observacionesRepre}
                    />
                  </div>
                </div>
              </div>
              <div
                className="flex flex-column flex-wrap gap-4"
                style={{ marginTop: "5px", marginLeft: "25px" }}
              ></div>
              <div
                className="flex flex-row  w-full h-full justify-content-center  flex-grow-1  row-gap-8 gap-8 flex-wrap mt-6"
                style={{ marginLeft: "-45px" }}
              >
                <div className="flex align-items-center justify-content-center w-auto min-w-min">
                  <Button
                    type="submit"
                    label={editMode ? "Actualizar" : "Guardar"}
                    className="w-full text-3xl min-w-min "
                    rounded
                    onClick={editMode ? handleUpdate : handleSubmit}
                  />
                </div>
                <div className="flex align-items-center justify-content-center w-auto min-w-min">
                  <Button
                    type="button"
                    label="Cancelar"
                    className="w-full text-3xl min-w-min"
                    rounded
                    onClick={() => {
                      resetForm();
                      resetFiltro();
                      setEditMode(false);
                    }} />
                </div>
              </div>
            </div>
          </form>
        </div>
        <div style={{ marginTop: "50px" }}>
          <table
            style={{ minWidth: "40rem" }}
            className="mt-4  w-full h-full text-3xl font-large"
          >
            <thead>
              <tr >

                <td colSpan={12} className="tdBtn">
                  <ReportBar
                    reportName={excelReportData?.reportName!}
                    headerItems={excelReportData?.headerItems!}
                    rowData={excelReportData?.rowData!}
                    logo={excelReportData?.logo!}
                  />
                </td>

              </tr>
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
              {contra1.map((contrato) => (
                <tr
                  className="text-center"
                  key={contrato.idFichaRepresentante?.toString()}
                >
                  <td>{contrato.idFichaRepresentante}</td>
                  <td>{contrato.nombresRepre}</td>
                  <td>{contrato.apellidosRepre}</td>
                  <td>{contrato.cedulaRepre}</td>
                  <td>{contrato.contactoRepre}</td>
                  <td>{contrato.contactoEmergenciaRepre}</td>
                  <td>{contrato.fechaNacimientoRepre}</td>
                  <td>
                    <Button
                      type="button"
                      className=""
                      label="✎"
                      style={{
                        background: "#ff9800",
                        borderRadius: "5%",
                        fontSize: "25px",
                        width: "50px",
                        color: "black",
                        justifyContent: "center",
                      }}
                      onClick={() =>
                        handleEdit(contrato.idFichaRepresentante?.valueOf())
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
                        handleDelete(contrato.idFichaRepresentante?.valueOf())
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Fieldset>
  );
}

export default FichaInscripcionContext;
