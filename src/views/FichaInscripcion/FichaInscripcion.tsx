import React, { useEffect, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Calendar, CalendarChangeEvent } from "primereact/calendar";
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
import {
  IExcelReportParams,
  IHeaderItem,
} from "../../interfaces/IExcelReportParams";
import "../../styles/FiltroFichas.css";
import { Divider } from "primereact/divider";
import toast, { Toaster } from "react-hot-toast";
import { InputTextarea } from "primereact/inputtextarea";
import { PiFilePdfFill } from "react-icons/pi";
import { ButtonPDF } from "../../common/ButtonPDF";

function FichaInscripcionContext() {
  const fichaPersonalService = new FichaPersonalService();
  const [busqueda, setBusqueda] = useState<string>("");
  const [foto, setFoto] = useState<string>(
    "https://cdn-icons-png.flaticon.com/128/666/666201.png"
  );
  const [listFperonales, setListFperonales] = useState<IFichaPersonal[]>([]);

  const [excelReportData, setExcelReportData] =
    useState<IExcelReportParams | null>(null);

  const fileUploadRef = useRef<FileUpload>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<number | undefined>(undefined);
  const cursoService = new CursoService();
  const inscripService = new FichaInscripcionService();

  const tipoProyectoOptions = [
    { label: "APIA", value: "APIA" },
    { label: "EMAC", value: "EMAC" },
    { label: "MIES", value: "MIES" },
    { label: "MUNICIPIO", value: "MUNICIPIO" },
  ];
  const jornadaOptions = [
    { label: "Matutina", value: "Matutina" },
    { label: "Vespertina", value: "Vespertina" },
  ];
  const diasOptions = [
    { label: "Lun - Mie - Vie", value: "Lun - Mie - Vie" },
    { label: "Lun a Vie", value: "Lun a Vie" },
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
    fechaRegistro: new Date(),
    anexosFichaSocioEconomica: "",
  });

  useEffect(() => {
    loadCurso();
  }, []);

  const loadCurso = () => {
    cursoService
      .getAll()
      .then((data: ICurso[]) => {
        const dataWithLabel = data.map((object) => ({
          ...object,
          label: `${object.nombreCurso} || ${object.docente?.persona?.nombresPersona} ${object.docente?.persona?.apellidosPersona}`,
        }));
        setCursos(dataWithLabel);
        setDataLoaded(true);
      })
      .catch((error) => {
        swal({
          title: "Error",
          text: "Error al obtener los datos.",
          icon: "error",
          timer: 1000,
        });
      });
  };

  const loadData = () => {
    inscripService
      .getAll()
      .then((data) => {
        setcontra1(data);
        loadExcelReportData(data);
        setDataLoaded(true);
      })
      .catch((error) => {
        swal({
          title: "Error",
          text: "Error al obtener los datos.",
          icon: "error",
          timer: 1000,
        });
      });
  };
  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validaciones()) {
      inscripService
        .save(formData)
        .then((response) => {
          resetForm();
          resetFiltro();
          swal("Ficha Inscripción", "Datos Guardados Correctamente", "success");
          loadDataID(response.fichaPersonal?.idFichaPersonal);
        })
        .catch((error) => {
          swal({
            title: "Error",
            text: "Error al enviar el formulario.",
            icon: "error",
            timer: 1000,
          });
        });
    }
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
        const editedItem = { ...editItem };

        if (typeof editedItem.fechaRegistro === "string") {
          const registro = new Date(editedItem.fechaRegistro);
          registro.setDate(registro.getDate() + 1);
          const formattedDate = registro
            ? registro.toISOString().split("T")[0]
            : "";
          editedItem.fechaRegistro = formattedDate;
        }

        if (typeof editedItem.fechaIngresoInscrip === "string") {
          const nacimiento = new Date(editedItem.fechaIngresoInscrip);
          nacimiento.setDate(nacimiento.getDate() + 1);
          const formattedDate = nacimiento
            ? nacimiento.toISOString().split("T")[0]
            : "";
          editedItem.fechaIngresoInscrip = formattedDate;
        }

        setFormData(editedItem);

        setEditMode(true);
        setEditItemId(id);

        setBusqueda(editItem.fichaPersonal?.ciPasaporte ?? "");
        setFoto(editItem.fichaPersonal?.foto ?? "");

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
        inscripService
          .update(Number(editItemId), formData as IFichaInscripcion)
          .then((response) => {
            swal({
              title: "Ficha de Inscripcion",
              text: "Datos actualizados correctamente",
              icon: "success",
            });

            loadDataID(response.fichaPersonal?.idFichaPersonal);
            setEditMode(false);
            setEditItemId(undefined);
            resetForm();
            resetFiltro();
          })
          .catch((error) => {
            swal({
              title: "Error",
              text: "Error al actualizar el formulario",
              icon: "error",
              timer: 1000,
            });
          });
      }
    }
  };

  function validaciones(): boolean {
    if (!formData.fichaPersonal?.idFichaPersonal) {
      toast.error("Seleccione al propietario de la ficha", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.fechaIngresoInscrip) {
      toast.error("Ingrese un nombre para identificar el aula", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.curso) {
      toast.error("Seleccione la fecha de inicio", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.proyectoInscrip) {
      toast.error("Seleccione el docente que estara acargo del aula", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.asistenciaInscrip) {
      toast.error("Seleccione en que rango de edad estan los niños del aula", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.jornadaAsistenciaInscrip) {
      toast.error("Seleccione en que rango de edad estan los niños del aula", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.situacionIngresoInscrip) {
      toast.error("Seleccione en que rango de edad estan los niños del aula", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    return true;
  }

  const resetForm = () => {
    setFormData({
      fechaIngresoInscrip: "",
      proyectoInscrip: "",
      situacionIngresoInscrip: "",
      asistenciaInscrip: "",
      jornadaAsistenciaInscrip: "",
      fichaPersonal: null,
      curso: null,
      fechaRegistro: new Date(),
      anexosFichaSocioEconomica: "",
    });
    setEditMode(false);
    setEditItemId(undefined);
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  };
  if (!dataLoaded) {
    return <div style={{ marginLeft: "50%" }}>Cargando datos...</div>;
  }
  const loadRelacion = () => {
    fichaPersonalService
      .getBusquedaRelacion(true, busqueda)
      .then((data: IFichaPersonal[]) => {
        const dataWithLabel = data.map((object) => ({
          ...object,
          label: `${object.ciPasaporte} || ${object.apellidos} ${object.nombres}`,
        }));
        setListFperonales(dataWithLabel);
      })
      .catch((error) => {
        swal({
          title: "Error",
          text: "Error al obtener los datos.",
          icon: "error",
          timer: 1000,
        });
      });
  };

  const cargarFoto = (id: number) => {
    const Foto = listFperonales.find(
      (persona) => persona.idFichaPersonal === id
    );

    if (Foto) {
      setFoto(Foto.foto);
    }
  };

  const resetFiltro = () => {
    setBusqueda("");
    setFoto("https://cdn-icons-png.flaticon.com/128/666/666201.png");
    setListFperonales([]);
  };

  function loadExcelReportData(data: IFichaInscripcion[]) {
    const reportName = "Ficha de Inscripción";
    const logo = "G1:I1";
    const rowData = data.map((item) => ({
      idFicha: item.idFichaInscripcion,
      cedula: item.fichaPersonal?.ciPasaporte,
      nombres: item.fichaPersonal?.nombres,
      apellidos: item.fichaPersonal?.apellidos,
      fechaInscripcion:
        typeof item.fechaIngresoInscrip === "string" &&
        `${item.fechaIngresoInscrip.split("-")[2]}/${item.fechaIngresoInscrip.split("-")[1]
        }/${item.fechaIngresoInscrip.split("-")[0]}`,
      curso: item.curso?.nombreCurso,
      profe: `${item.curso?.docente?.persona?.nombresPersona} ${item.curso?.docente?.persona?.apellidosPersona}`,
      jornadaAsistenciaInscrip: item.jornadaAsistenciaInscrip,
      asistenciaInscrip: item.asistenciaInscrip,
      proyecto: item.proyectoInscrip,
      situacion: item.situacionIngresoInscrip,
    }));
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
    ];

    setExcelReportData({
      reportName,
      headerItems,
      rowData,
      logo,
    });
  }

  const loadDataID = (id: number) => {
    setcontra1([]);
    inscripService
      .getBusquedaID(id)
      .then((data) => {
        setcontra1(data);
        loadExcelReportData(data);
        setDataLoaded(true);
      })
      .catch((error) => {
        swal({
          title: "Error",
          text: "Error al obtener los datos.",
          icon: "error",
          timer: 1000,
        });
      });
  };
  const customBytesUploader = (event: FileUploadSelectEvent) => {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      const reader = new FileReader();

      reader.onloadend = function () {
        const base64data = reader.result as string;
        setFormData({ ...formData, anexosFichaSocioEconomica: base64data });
      };

      reader.onerror = (error) => {
        swal({
          title: "Error",
          text: "Error al leer los datos.",
          icon: "error",
          timer: 1000,
        });
      };
      reader.readAsDataURL(file);
      if (fileUploadRef.current) {
        fileUploadRef.current.clear();
      }
    }
  };

  const decodeBase64 = (base64Data: string) => {
    try {
      const base64WithoutHeader = base64Data.replace(/^data:.*,/, "");

      const decodedData = atob(base64WithoutHeader);
      const byteCharacters = new Uint8Array(decodedData.length);

      for (let i = 0; i < decodedData.length; i++) {
        byteCharacters[i] = decodedData.charCodeAt(i);
      }

      const byteArray = new Blob([byteCharacters], { type: "application/pdf" });
      const fileUrl = URL.createObjectURL(byteArray);

      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = "Informe Socio Economico.pdf";
      link.click();
      swal({
        title: "Anexo",
        text: "Descargando pdf....",
        icon: "success",
        timer: 1000,
      });

      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      swal({
        title: "Anexo",
        text: "Error al decodificar el PDF.",
        icon: "error",
        timer: 1000,
      });
    }
  };
  return (
    <>
      <div>
        <Toaster position="top-right" reverseOrder={true} />
      </div>
      <Fieldset
        className="fgrid col-fixed "
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Card
          header={cardHeader}
          className="border-solid border-red-800 border-3 flex-1 flex-wrap"
          style={{
            marginBottom: "35px",
            minWidth: "700px ",
            maxWidth: "1000px",
          }}
        >
          <div
            className="h1-rem"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <h1 className="text-5xl font-smibold lg:md-2 h-full max-w-full max-h-full min-w-min">
              Ficha de Inscripción
            </h1>
          </div>

          <div
            className=""
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "right",
            }}
          >
            <label
              className="font-medium w-auto min-w-min"
              htmlFor="fichaPersonal"
              style={{ marginRight: "10px" }}
            >
              Fecha de Registro:
            </label>
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
              value={
                typeof formData.fechaRegistro === "string"
                  ? new Date(formData.fechaRegistro)
                  : new Date()
              }
            />
          </div>

          <section className="flex justify-content-center flex-wrap container">
            <Divider align="left">
              <div className="inline-flex align-items-center">
                <i className="pi pi-filter-fill mr-2"></i>
                <b>Filtro</b>
              </div>
            </Divider>
            <Fieldset
              legend="Filtros de busqueda"
              style={{ width: "1000px", position: "relative" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  right: "5px",
                  marginTop: "-15px",
                }}
              >
                <label
                  className="font-medium w-auto min-w-min"
                  htmlFor="rangoEdad"
                  style={{ marginRight: "10px" }}
                >
                  Limpiar filtros:
                </label>

                <Button
                  icon="pi pi-times"
                  rounded
                  severity="danger"
                  aria-label="Cancel"
                  onClick={() => resetFiltro()}
                />
              </div>

              <section className="layout">
                <div className="">
                  <div className="input-box">
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="genero"
                    >
                      Cedula o Nombre:
                    </label>

                    <div className="flex-1">
                      <InputText
                        placeholder="Cedula de identidad"
                        id="integer"
                        style={{ width: "75%" }}
                        onChange={(e) => {
                          setListFperonales([]);
                          setBusqueda(e.currentTarget.value);
                          loadRelacion();
                        }}
                        onKeyUp={(e) => {
                          setListFperonales([]);
                          setBusqueda(e.currentTarget.value);
                          loadRelacion();
                          loadRelacion();
                        }}
                        value={busqueda}
                      />

                      <Button
                        icon="pi pi-search"
                        className="p-button-warning"
                      />
                    </div>
                  </div>
                </div>
                <div className="grow1 shrink0">
                  <div className="input-box">
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="fichaPersonal"
                    >
                      Resultados de la busqueda:
                    </label>
                    <Dropdown
                      className="text-2xl"
                      id="tiempo_dedicacion"
                      name="tiempo_dedicacion"
                      style={{
                        width: "100%",
                        height: "36px",
                        alignItems: "center",
                      }}
                      options={listFperonales}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          fichaPersonal: {
                            idFichaPersonal: parseInt(e.value),
                            foto: "",
                            apellidos: "",
                            nombres: "",
                            ciPasaporte: "",
                            tipoIdentificacion: "",
                            actTrabInfantil: false,
                            detalleActTrabInfantil: "",
                            nacionalidad: "",
                            fechaNacimiento: "",
                            rangoEdad: null,
                            genero: "",
                            etnia: null,
                            parroquia: null,
                            zona: "",
                            barrioSector: "",
                            direccion: "",
                            referencia: "",
                            coordenadaX: 0,
                            coordenadaY: 0,
                            estVinculacion: true,
                            fechaRegistro: new Date(),
                            anexosCedula: "",
                            anexosDocumentosLegales: "",
                          },
                        });
                        cargarFoto(parseInt(e.value));
                        loadDataID(parseInt(e.value));
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
              className="form"
              encType="multipart/form-data"
            >
              <Divider align="left">
                <div className="inline-flex align-items-center">
                  <i className="pi pi-book mr-2"></i>
                  <b>Formulario </b>
                </div>
              </Divider>

              <div className="column" style={{}}>
                <div className="column" style={{ width: "30.3%" }}>
                  <div
                    className="input-box"
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <label
                      htmlFor="fechaIngreso"
                      className="font-medium w-auto min-w-min"
                    >
                      Fecha de Ingreso:
                    </label>
                    <Calendar
                      style={{ width: "100%" }}
                      className="text-2xl"
                      id="inicio"
                      name="inicio"
                      placeholder=" Ingresar la fecha de nacimiento"
                      dateFormat="dd-mm-yy" // Cambiar el formato a ISO 8601
                      showIcon
                      maxDate={new Date()}
                      onChange={(e) => {
                        const selectedDate =
                          e.value instanceof Date ? e.value : null;

                        if (selectedDate) {
                          selectedDate.setDate(selectedDate.getDate() + 1);
                          const formattedDate = selectedDate
                            ? selectedDate.toISOString().split("T")[0] // Formatear a ISO 8601
                            : "";

                          setFormData({
                            ...formData,
                            fechaIngresoInscrip: formattedDate,
                          });
                        }
                      }}
                      value={
                        formData.fechaIngresoInscrip
                          ? new Date(formData.fechaIngresoInscrip)
                          : null
                      }
                    />
                  </div>
                </div>
                <div className="column" style={{ width: "30.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Curso:
                    </label>
                    <Dropdown
                      id="curso"
                      name="curso"
                      style={{
                        width: "100%",
                        height: "36px",
                        alignItems: "center",
                      }}
                      options={cursos}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          curso: {
                            idCurso: parseInt(e.value),
                            docente: null,
                            fechaInicio: "0000-00-00",
                            nombreCurso: "",
                            rangoEdad: null,
                            fechaRegistro: "",
                          },
                        })
                      }
                      filter
                      value={formData.curso?.idCurso}
                      optionLabel="label"
                      optionValue="idCurso"
                      placeholder="Seleccione el Curso"
                    />
                  </div>
                </div>
                <div className="column" style={{ width: "30.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Tipo de Proyecto:
                    </label>
                    <Dropdown
                      className="text-2xl"
                      id="tiempo_dedicacion"
                      name="tiempo_dedicacion"
                      style={{
                        width: "100%",
                        height: "36px",
                        alignItems: "center",
                      }}
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
              </div>

              <div className="column" style={{}}>
                <div className="column" style={{ width: "30.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Asistencia:
                    </label>
                    <Dropdown
                      className="text-2xl"
                      id="asistencia"
                      name="asistencia"
                      style={{
                        width: "100%",
                        height: "36px",
                        alignItems: "center",
                      }}
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
                </div>
                <div className="column" style={{ width: "30.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Jornada de Asistencia:
                    </label>
                    <Dropdown
                      className="text-2xl"
                      id="tiempo_dedicacion"
                      name="tiempo_dedicacion"
                      style={{
                        width: "100%",
                        height: "36px",
                        alignItems: "center",
                      }}
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
                <div className="column" style={{ width: "30.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Situación de Ingreso:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese la Situacion de Ingreso"
                      id="doi"
                      name="doi"
                      style={{ width: "100%" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          situacionIngresoInscrip: e.currentTarget.value,
                        })
                      }
                      value={formData.situacionIngresoInscrip}
                    />
                  </div>
                </div>
              </div>
              <Divider align="left">
                <div className="inline-flex align-items-center">
                  <i className="pi pi-file-pdf mr-2"></i>
                  <b>Anexos</b>
                </div>
              </Divider>
              <div className="column">
                <div className="input-box">
                  <label htmlFor="pdf" className="font-medium w-auto min-w-min">
                    Subir Informe Socio-Económico:
                  </label>
                  <FileUpload
                    name="pdf"
                    chooseLabel="Escoger"
                    uploadLabel="Cargar"
                    cancelLabel="Cancelar"
                    emptyTemplate={
                      <p className="m-0 p-button-rounded">
                        Arrastre y suelte los archivos aquí para cargarlos.
                      </p>
                    }
                    customUpload
                    onSelect={customBytesUploader}
                    accept="application/pdf"
                  />
                </div>
              </div>

              <div className="btnSend">
                <div
                  className="flex align-items-center justify-content-center w-auto min-w-min"
                  style={{ gap: "25px" }}
                >
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
                    }}
                  />
                </div>
              </div>
            </form>
          </section>

          <Divider align="left" style={{ marginBottom: "0px" }}>
            <div className="inline-flex align-items-center">
              <i className="pi pi-list mr-2"></i>
              <b>Lista</b>
            </div>
          </Divider>

          <div className="opcTblLayout">
            <div
              className=""
              style={{
                flex: 1,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
              }}
            >
              <div className="opcTbl" style={{ justifyContent: "right" }}>
                <label
                  className="font-medium w-auto min-w-min"
                  htmlFor="estado"
                >
                  Cargar todo:
                </label>

                <Button
                  className="buttonIcon" // Agrega una clase CSS personalizada
                  icon="pi pi-refresh"
                  style={{ width: "120px", height: "39px" }}
                  severity="danger"
                  aria-label="Cancel"
                  onClick={() => {
                    loadData();
                    resetFiltro();
                  }}
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

          <div className="tblContainer">
            <table className="tableFichas">
              <thead className="theadTab">
                <tr style={{ backgroundColor: "#871b1b", color: "white" }}>
                  <th className="trFichas">Nro</th>
                  <th className="trFichas">Cedula/Pasaporte</th>
                  <th className="trFichas">Nombres</th>
                  <th className="trFichas">Apellidos</th>
                  <th className="trFichas">Fecha de Ingreso</th>
                  <th className="trFichas">Proyecto </th>
                  <th className="trFichas">Situación de Ingreso</th>
                  <th className="trFichas">Asistencia</th>
                  <th className="trFichas">Jornada de Asistencia</th>
                  <th className="trFichas">Informe Socio-Económico</th>
                  <th className="trFichas">Editar</th>
                  <th className="trFichas">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {contra1.map((contrato) => (
                  <tr
                    className="text-center"
                    key={contrato.idFichaInscripcion?.toString()}
                  >
                    <td className="tdFichas">{contrato.idFichaInscripcion}</td>
                    <td className="tdFichas">
                      {contrato.fichaPersonal?.ciPasaporte}
                    </td>
                    <td className="tdFichas">
                      {contrato.fichaPersonal?.nombres ||
                        " " ||
                        contrato.fichaPersonal?.apellidos}
                    </td>
                    <td className="tdFichas">
                      {contrato.fichaPersonal?.apellidos}
                    </td>
                    <td className="tdFichas">
                      {contrato.fechaIngresoInscrip && (
                        <span>
                          {contrato.fechaIngresoInscrip.split("-")[2]}-
                          {contrato.fechaIngresoInscrip.split("-")[1]}-
                          {contrato.fechaIngresoInscrip.split("-")[0]}
                        </span>
                      )}
                    </td>
                    <td className="tdFichas">{contrato.proyectoInscrip}</td>
                    <td className="tdFichas">
                      {contrato.situacionIngresoInscrip}
                    </td>
                    <td className="tdFichas">{contrato.asistenciaInscrip}</td>
                    <td className="tdFichas">
                      {contrato.jornadaAsistenciaInscrip}
                    </td>
                    <td className="tdFichas">
                      <ButtonPDF
                        base64={contrato.anexosFichaSocioEconomica}
                        filename={`FichaSocioEconomica_${contrato.fichaPersonal?.apellidos}_${contrato.fichaPersonal?.nombres}`}
                        tipo={`Ficha SocioEconomica: ${contrato.fichaPersonal?.apellidos} ${contrato.fichaPersonal?.nombres}`}
                      />

                    </td>
                    <td className="tdFichas">
                      <Button
                        className="buttonIcon"
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
                          handleEdit(contrato.idFichaInscripcion?.valueOf())
                        }
                      />
                    </td>

                    <td className="tdFichas">
                      <Button
                        className="buttonIcon"
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
    </>
  );
}

export default FichaInscripcionContext;
