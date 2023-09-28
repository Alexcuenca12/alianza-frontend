import React, { useEffect, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { Calendar } from "primereact/calendar";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import cardHeader from "../../shared/CardHeader";
import { IFichaInscripcion } from "../../interfaces/IFichaInscripcion";
import { IFichaPersonal } from "../../interfaces/IFichaPersonal";
import { ICurso } from "../../interfaces/ICurso";
import { FichaInscripcionService } from "../../services/FichaInscripcionService";
import { FichaPersonalService } from "../../services/FichaPersonalService";
import { CursoService } from "../../services/CursoService";
import swal from "sweetalert";
import { ReportBar } from "../../common/ReportBar";
import { IExcelReportParams, IHeaderItem } from "../../interfaces/IExcelReportParams";
import '../../styles/FiltroFichas.css'


function FichaInscripcionContext() {
  const fichaPersonalService = new FichaPersonalService();
  const [busqueda, setBusqueda] = useState<string>('');
  const [foto, setFoto] = useState<string>('https://cdn-icons-png.flaticon.com/128/666/666201.png');
  const [listFperonales, setListFperonales] = useState<IFichaPersonal[]>([]);

  const [excelReportData, setExcelReportData] = useState<IExcelReportParams | null>(null);


  const forceUpdate = React.useReducer((state) => !state, false)[1];



  const fileUploadRef = useRef<FileUpload>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<number | undefined>(undefined);
  const [selectedCurso, setSelectedCurso] = useState<string | null>(null);

  const personalService = new FichaPersonalService();
  const cursoService = new CursoService();
  const inscripService = new FichaInscripcionService();

  const [cedula, setCedula] = useState<string>("");
  const [busquedaCedulaCompleta, setBusquedaCedulaCompleta] = useState(false);

  const tipoProyectoOptions = [
    { label: "MIES", value: "MIES" },
    { label: "MUNICIPIO", value: "MUNICIPIO" },
    { label: "EMAC", value: "EMAC" },
  ];
  const jornadaOptions = [
    { label: "Matutina", value: "Matutina" },
    { label: "Vespertina", value: "Vespertina" },
  ];
  const diasOptions = [
    { label: "Lunes a Viernes", value: "Lunes a Viernes" },
    { label: "Lunes a Sábado", value: "Lunes a Sábado" },
  ];

  const [contra1, setcontra1] = useState<IFichaInscripcion[]>([]);
  const [cursos, setCursos] = useState<ICurso[]>([]);

  const [formData, setFormData] = useState<IFichaInscripcion>({
    idFichaInscripcion: 0,
    fechaIngresoInscrip: "",
    proyectoInscrip: "",
    situacionIngresoInscrip: "",
    asistenciaInscrip: "",
    jornadaAsistenciaInscrip: "",
    fichaPersonal: null,
    curso: null,
  });

  useEffect(() => {

    loadCurso();
  }, []);

  const loadCurso = () => {
    cursoService
      .getAll()
      .then((data) => {
        setCursos(data);
        setSelectedCurso(null);
        setDataLoaded(true); // Marcar los datos como cargados
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };

  const loadData = () => {
    inscripService
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ formData })
    if (
      !formData.asistenciaInscrip ||
      !formData.jornadaAsistenciaInscrip ||
      !formData.proyectoInscrip ||
      !formData.situacionIngresoInscrip ||
      !formData.fechaIngresoInscrip
    ) {
      swal("Advertencia", "Por favor, complete todos los campos", "warning");
      return;
    }
    inscripService
      .save(formData)
      .then((response) => {
        resetForm();
        swal("Ficha Inscripción", "Datos Guardados Correctamente", "success");
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
          inscripService
            .delete(id)
            .then(() => {
              setcontra1(
                contra1.filter((contra) => contra.idFichaInscripcion !== id)
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
        (contra) => contra.idFichaInscripcion === id
      );
      if (editItem) {
        setFormData(editItem);

        setEditMode(true);
        setEditItemId(id);

        setBusqueda(editItem.fichaPersonal?.ciIdentidad ?? "");
        setFoto(editItem.fichaPersonal?.foto ?? '')


        if (editItem.fichaPersonal !== null) {

          const editItemWithLabel = {
            ...editItem,
            fichaPersonal: {
              ...editItem.fichaPersonal,
              label: `${editItem.fichaPersonal.ciIdentidad} || ${editItem.fichaPersonal.apellidos} ${editItem.fichaPersonal.nombres}`,
            },
          };
          setListFperonales([editItemWithLabel.fichaPersonal]);
        }

      }
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación: Verificar que la fecha de ingreso sea menor que la fecha de egreso


    if (editItemId !== undefined) {
      inscripService
        .update(Number(editItemId), formData as IFichaInscripcion)
        .then((response) => {
          swal({
            title: "Publicaciones",
            text: "Datos actualizados correctamente",
            icon: "success",
          });
          setFormData({
            fechaIngresoInscrip: "",
            proyectoInscrip: "",
            situacionIngresoInscrip: "",
            asistenciaInscrip: "",
            jornadaAsistenciaInscrip: "",
            fichaPersonal: null,
            curso: null,
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
      fechaIngresoInscrip: "",
      proyectoInscrip: "",
      situacionIngresoInscrip: "",
      asistenciaInscrip: "",
      jornadaAsistenciaInscrip: "",
      fichaPersonal: null,
      curso: null,
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
          label: `${object.ciIdentidad} || ${object.apellidos} ${object.nombres}`,
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

  function loadExcelReportData(data: IFichaInscripcion[]) {
    const reportName = "Ficha de Inscripción"
    const logo = 'G1:I1'
    const rowData = data.map((item) => (
      {
        idFicha: item.idFichaInscripcion,
        cedula: item.fichaPersonal?.ciIdentidad,
        nombres: item.fichaPersonal?.nombres,
        apellidos: item.fichaPersonal?.apellidos,
        fechaInscripcion: new Date(item.fechaIngresoInscrip!).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        curso: item.curso?.nombreCurso,
        profe: `${item.curso?.docente?.persona?.nombresPersona} ${item.curso?.docente?.persona?.apellidosPersona}`,
        jornadaAsistenciaInscrip: item.jornadaAsistenciaInscrip,
        asistenciaInscrip: item.asistenciaInscrip,
        proyecto: item.proyectoInscrip,
        situacion: item.situacionIngresoInscrip,
      }
    ));
    const headerItems: IHeaderItem[] = [
      { header: "№ FICHA" },
      { header: "CEDULA" },
      { header: "NOMBRES" },
      { header: "APELLIDOS" },
      { header: "FECHA DE INSCRIPCION" },
      { header: "CURSO" },
      { header: "DOCENTE DE CURSO" },
      { header: "JORNADA" },
      { header: "ASISTENCIA" },
      { header: "PROYECTO" },
      { header: "SITUACION" },


    ]


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
    inscripService
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
        style={{ width: "90%", marginLeft: "7%", height: "100%" }}
      >
        <div
          className="h1-rem"
          style={{ marginLeft: "40%", marginBottom: "20px" }}
        >
          <h1 className="text-5xl font-smibold lg:md-2  w-full h-full max-w-full max-h-full min-w-min">
            Ficha de Inscripción
          </h1>
        </div>

        <div className="flex justify-content-center flex-wrap">
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
                          coordenadaY: 0,
                          estVinculacion: true
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
          <form
            onSubmit={editMode ? handleUpdate : handleSubmit}
            encType="multipart/form-data"
          >
            <div className="flex flex-wrap flex-row" style={{ justifyContent: "center" }}>
              <div className="flex align-items-center justify-content-center">
                <div className="flex flex-column flex-wrap gap-4">

                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="evento"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Fecha de Ingreso:
                    </label>
                    <Calendar
                      className="text-2xl"
                      id="inicio"
                      name="inicio"
                      placeholder="Ingrese la Fecha de Ingreso"
                      required
                      dateFormat="yy-mm-dd" // Cambiar el formato a ISO 8601
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
                          fechaIngresoInscrip: formattedDate,
                        });
                      }}
                      value={
                        formData.fechaIngresoInscrip
                          ? new Date(formData.fechaIngresoInscrip)
                          : null
                      }
                    />
                  </div>

                  <div className="flex flex-wrap w-full h-full justify-content-between">


                    <label
                      htmlFor="inicio"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Curso:
                    </label>

                    <Dropdown
                      id="curso"
                      name="curso"
                      style={{ width: "220px", marginLeft: "15px" }}
                      options={cursos}
                      onChange={(e) =>
                        setFormData({ ...formData, curso: { idCurso: parseInt(e.value), docente: null, estadoCurso: true, fechaInicio: "0000-00-00", nombreCurso: '', rangoEdad: null } })
                      }
                      value={formData.curso} // Make sure this is correctly bound
                      optionLabel="nombreCurso"
                      optionValue="idCurso"
                      placeholder="Seleccione el Curso"
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="tiempo_dedicacion"
                      className="text-3xl font-medium w-auto min-w-min"
                    >
                      Tipo de Proyecto:
                    </label>
                    <Dropdown
                      className="text-2xl"
                      id="tiempo_dedicacion"
                      name="tiempo_dedicacion"
                      style={{ width: "220px" }}
                      options={tipoProyectoOptions}
                      onChange={(e) =>
                        setFormData({ ...formData, proyectoInscrip: e.value })
                      }
                      value={formData.proyectoInscrip}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Seleccione el Proyecto"
                    />
                  </div>
                </div>


                <div
                  className="flex flex-column flex-wrap gap-4"
                  style={{ marginTop: "5px", marginLeft: "50px" }}
                >

                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="doi"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
                    >
                      Situación de Ingreso:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese la Situacion de Ingreso"
                      id="doi"
                      name="doi"
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          situacionIngresoInscrip: e.currentTarget.value,
                        })
                      }
                      value={formData.situacionIngresoInscrip}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="asistencia"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
                    >
                      Asistencia:
                    </label>
                    <Dropdown
                      className="text-2xl"
                      id="asistencia"
                      name="asistencia"
                      style={{ width: "220px" }}
                      options={diasOptions}
                      onChange={(e) =>
                        setFormData({ ...formData, asistenciaInscrip: e.value })
                      }
                      value={formData.asistenciaInscrip}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Seleccione la Asistencia"
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="tiempo_dedicacion"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
                    >
                      Jornada de Asistencia:
                    </label>
                    <Dropdown
                      className="text-2xl"
                      id="tiempo_dedicacion"
                      name="tiempo_dedicacion"
                      style={{ width: "220px", marginLeft: "15px" }}
                      options={jornadaOptions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          jornadaAsistenciaInscrip: e.value,
                        })
                      }
                      value={formData.jornadaAsistenciaInscrip}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Seleccione la Jornada"
                    />
                  </div>
                </div>

              </div>
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
                <th>Nº de Publicacion</th>
                <th>Fecha de Ingreso</th>
                <th>Proyecto </th>
                <th>Situación de Ingreso</th>
                <th>Asistencia</th>
                <th>Jornada de Asistencia</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {contra1.map((contrato) => (
                <tr
                  className="text-center"
                  key={contrato.idFichaInscripcion?.toString()}
                >
                  <td>{contrato.idFichaInscripcion}</td>
                  <td>
                    {contrato.fechaIngresoInscrip
                      ? new Date(
                        contrato.fechaIngresoInscrip
                      ).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                      : ""}
                  </td>
                  <td>{contrato.proyectoInscrip}</td>
                  <td>{contrato.situacionIngresoInscrip}</td>
                  <td>{contrato.asistenciaInscrip}</td>
                  <td>{contrato.jornadaAsistenciaInscrip}</td>
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
                        handleEdit(contrato.idFichaInscripcion?.valueOf())
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
                        handleDelete(contrato.idFichaInscripcion?.valueOf())
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
