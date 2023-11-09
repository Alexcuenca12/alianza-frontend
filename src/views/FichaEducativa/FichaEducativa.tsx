import React, { useEffect, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import cardHeader from "../../shared/CardHeader";
import { IFichaEducativa } from "../../interfaces/IFichaEducativa";
import { IFichaPersonal } from "../../interfaces/IFichaPersonal";
import { FichaEducativaService } from "../../services/FichaEducativaService";
import { FichaPersonalService } from "../../services/FichaPersonalService";
import swal from "sweetalert";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Calendar, CalendarChangeEvent } from "primereact/calendar";
import {
  IExcelReportParams,
  IHeaderItem,
} from "../../interfaces/IExcelReportParams";
import { ReportBar } from "../../common/ReportBar";
import { Divider } from "primereact/divider";
import "../../styles/FiltroFichas.css";
import toast, { Toaster } from "react-hot-toast";
import { PiFilePdfFill } from "react-icons/pi";
import { ButtonPDF } from "../../common/ButtonPDF";

function FichaInscripcionContext() {
  const fichaPersonalService = new FichaPersonalService();

  const [excelReportData, setExcelReportData] =
    useState<IExcelReportParams | null>(null);

  const [busqueda, setBusqueda] = useState<string>("");
  const [foto, setFoto] = useState<string>(
    "https://cdn-icons-png.flaticon.com/128/666/666201.png"
  );
  const [listFperonales, setListFperonales] = useState<IFichaPersonal[]>([]);

  const [listJornadas, setListJornadas] = useState<string[]>([
    "Matutina",
    "Vespertina",
    "Nocturna",
  ]);

  const [contra1, setcontra1] = useState<IFichaEducativa[]>([]);
  const [formData, setFormData] = useState<IFichaEducativa>({
    idFichaEducativa: 0,
    centroEducativo: "",
    direccionEducativa: "",
    referenciaEducativa: "",
    jornadaEducativa: "",
    observacionesEducativa: "",
    gradoEducativo: "",
    detalleRepitente: "",
    repitente: false,
    situacionPsicopedagogica: "",
    fichaPersonal: null,
    fechaRegistro: new Date(),
    anexosMatricula: "",
    anexosCalificaciones1: "",
    anexosCalificaciones2: "",
    anexosCalificaciones3: "",
  });

  const fileUploadRef = useRef<FileUpload>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<number | undefined>(undefined);
  const educaService = new FichaEducativaService();

  const loadData = () => {
    educaService
      .getAll()
      .then((data) => {
        setcontra1(data);
        loadExcelReportData(data);
        setDataLoaded(true); // Marcar los datos como cargados
      })
      .catch((error) => {
        swal("Error", "Ha ocurrido un error al cargar la información", "error");
      });
  };
  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validaciones()) {
      educaService
        .save(formData)
        .then((response) => {
          swal("Ficha Educativa", "Datos Guardados Correctamente", "success");
          loadDataID(response.fichaPersonal?.idFichaPersonal);

          resetForm();
          resetFiltro();
          if (fileUploadRef.current) {
            fileUploadRef.current.clear();
          }
        })
        .catch((error) => {
          console.error("Error al enviar el formulario:", error);
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
          educaService
            .delete(id)
            .then(() => {
              setcontra1(
                contra1.filter((contra) => contra.idFichaEducativa !== id)
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
      const editItem = contra1.find((contra) => contra.idFichaEducativa === id);
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
        educaService
          .update(Number(editItemId), formData as IFichaEducativa)
          .then((response) => {
            swal({
              title: "Ficha Educativa",
              text: "Datos actualizados correctamente",
              icon: "success",
            });
            resetForm();
            resetFiltro();
            loadDataID(response.fichaPersonal?.idFichaPersonal);

            setEditMode(false);
            setEditItemId(undefined);
          })
          .catch((error) => {
            swal(
              "Error",
              "Ha ocurrido un error al actualizar este registro",
              "error"
            );
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

    if (!formData.centroEducativo) {
      toast.error("Ingrese el centro educativo", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.direccionEducativa) {
      toast.error("Por favor, ingrese la direccion del centro educativo", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.jornadaEducativa) {
      toast.error("Seleccione la jornada en la que estudia", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.gradoEducativo) {
      toast.error("Ingrese el grado por el que esta cursando", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (formData.repitente) {
      if (!formData.detalleRepitente) {
        toast.error("Por favor, proporcione detalles acerca del repitente", {
          style: {
            fontSize: "15px",
          },
          duration: 3000,
        });
        return false;
      }
    }

    if (!formData.referenciaEducativa) {
      toast("No olvides proporcionar una referencia del centro educativo", {
        icon: "⚠️",
        style: {
          fontSize: "15px",
        },
        duration: 4000,
      });
    }

    if (!formData.situacionPsicopedagogica) {
      toast("No ha ingresado ninguna situación psicopedagogíca", {
        icon: "⚠️",
        style: {
          fontSize: "15px",
        },
        duration: 4000,
      });
    }

    if (!formData.observacionesEducativa) {
      toast("No ha ingresado ninguna ob servacion", {
        icon: "⚠️",
        style: {
          fontSize: "15px",
        },
        duration: 4000,
      });
    }

    return true;
  }

  const resetForm = () => {
    setFormData({
      centroEducativo: "",
      direccionEducativa: "",
      referenciaEducativa: "",
      jornadaEducativa: "",
      observacionesEducativa: "",
      gradoEducativo: "",
      detalleRepitente: "",
      repitente: false,
      situacionPsicopedagogica: "",
      fichaPersonal: null,
      fechaRegistro: new Date(),
      anexosMatricula: "",
      anexosCalificaciones1: "",
      anexosCalificaciones2: "",
      anexosCalificaciones3: "",
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
    fichaPersonalService
      .getBusquedaRelacion(true, busqueda)
      .then((data: IFichaPersonal[]) => {
        const dataWithLabel = data.map((object) => ({
          ...object,
          label: `${object.ciPasaporte} || ${object.apellidos} ${object.nombres}`,
        }));

        setListFperonales(dataWithLabel); // Establecer los datos procesados en el estado
      })
      .catch((error) => {
        swal("Error", "Ha ocurrido un error al cargar ", "error");
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

  function loadExcelReportData(data: IFichaEducativa[]) {
    const reportName = "Ficha de Educativa";
    const logo = "G1:I1";
    const rowData = data.map((item) => ({
      idFicha: item.idFichaEducativa,
      cedula: item.fichaPersonal?.ciPasaporte,
      nombres: item.fichaPersonal?.nombres,
      apellidos: item.fichaPersonal?.apellidos,
      grado: item.gradoEducativo,
      jornada: item.jornadaEducativa,
      centro: item.centroEducativo,
      direccion: item.direccionEducativa,
      referencia: item.referenciaEducativa,

      situacionPsico: item.situacionPsicopedagogica || "Ningula",
      repitente: item.repitente ? "SI" : "NO",

      detallePsico: item.detalleRepitente || "N/A",

      observacion: item.observacionesEducativa,
      registro: item.fechaRegistro || "Ningula",
    }));
    const headerItems: IHeaderItem[] = [
      { header: "№ FICHA" },
      { header: "CEDULA" },
      { header: "NOMBRES" },
      { header: "APELLIDOS" },
      { header: "GRADO" },
      { header: "JORNADA" },
      { header: "CENTRO EDUCATIVO" },
      { header: "DIRECCION" },
      { header: "REFERENCIA" },
      { header: "SITUACIÓN PSICOPEDAGOGICA:" },
      { header: "¿ES REPITENTE?" },
      { header: "DETALLES DEL REPITENTE" },
      { header: "OBSERVACION" },
      { header: "FECHA DE REGISTRO" },
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
    educaService
      .getBusquedaID(id)
      .then((data) => {
        setcontra1(data);
        loadExcelReportData(data);
        setDataLoaded(true); // Marcar los datos como cargados
      })
      .catch((error) => {
        swal("Error", "Ha ocurrido un error al cargar", "error");
      });
  };

  const resetFiltro = () => {
    setBusqueda("");
    setFoto("https://cdn-icons-png.flaticon.com/128/666/666201.png");
    setListFperonales([]);
  };

  const customBytesUploaderMatricula = (event: FileUploadSelectEvent) => {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      const reader = new FileReader();

      reader.onloadend = function () {
        const base64data = reader.result as string;
        setFormData({ ...formData, anexosMatricula: base64data });
      };

      reader.onerror = (error) => {
        console.error("Error al leer el archivo:", error);
      };

      reader.readAsDataURL(file);

      if (fileUploadRef.current) {
        fileUploadRef.current.clear();
      }
    }
  };

  const customBytesUploaderCalf = (event: FileUploadSelectEvent) => {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      const reader = new FileReader();

      reader.onloadend = function () {
        const base64data = reader.result as string;
        setFormData({ ...formData, anexosCalificaciones1: base64data });
      };

      reader.onerror = (error) => {
        console.error("Error al leer el archivo:", error);
      };

      reader.readAsDataURL(file);

      if (fileUploadRef.current) {
        fileUploadRef.current.clear();
      }
    }
  };

  const customBytesUploaderCalf2 = (event: FileUploadSelectEvent) => {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      const reader = new FileReader();

      reader.onloadend = function () {
        const base64data = reader.result as string;
        setFormData({ ...formData, anexosCalificaciones2: base64data });
      };

      reader.onerror = (error) => {
        console.error("Error al leer el archivo:", error);
      };

      reader.readAsDataURL(file);

      if (fileUploadRef.current) {
        fileUploadRef.current.clear();
      }
    }
  };

  const customBytesUploaderCalf3 = (event: FileUploadSelectEvent) => {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      const reader = new FileReader();

      reader.onloadend = function () {
        const base64data = reader.result as string;
        setFormData({ ...formData, anexosCalificaciones3: base64data });
      };

      reader.onerror = (error) => {
        console.error("Error al leer el archivo:", error);
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
      link.download = "Anexo Educativo.pdf";
      link.click();
      swal({
        title: "Anexo",
        text: "Descargando pdf....",
        icon: "success",
        timer: 1000,
      });
      console.log("pdf descargado...");

      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("Error al decodificar la cadena base64:", error);
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
          style={{ marginBottom: "35px", maxWidth: "1200px" }}
        >
          <div
            className="h1-rem"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <h1 className="text-5xl font-smibold lg:md-2 h-full max-w-full max-h-full min-w-min">
              Ficha Educativa
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
                  <div input-box>
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
                          setListFperonales([]); // Asignar un arreglo vacío para vaciar el estado listFperonales
                          setBusqueda(e.currentTarget.value);
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
                <div className="">
                  <div>
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
                      style={{ width: "100%" }}
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
                <div className="column" style={{ width: "33.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Centro Educativo:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="inicio"
                      name="centro"
                      placeholder="Ingrese el Centro Educativo"
                      required
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          centroEducativo: e.currentTarget.value,
                        })
                      }
                      value={formData.centroEducativo}
                    />
                  </div>
                </div>
                <div className="column" style={{ width: "33.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Dirección del Centro:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="inicio"
                      name="inicio"
                      required
                      placeholder="Ingrese la Dirección del Centro"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          direccionEducativa: e.currentTarget.value,
                        })
                      }
                      value={formData.direccionEducativa}
                    />
                  </div>
                </div>
                <div className="column" style={{ width: "33.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Referencia de la Ubicación:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="inicio"
                      name="inicio"
                      required
                      placeholder="Ingrese la Referencia de la Ubicación"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          referenciaEducativa: e.currentTarget.value,
                        })
                      }
                      value={formData.referenciaEducativa}
                    />
                  </div>
                </div>
              </div>

              <div className="column" style={{}}>
                <div className="column" style={{ width: "33.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Jornada:
                    </label>
                    <Dropdown
                      className="text-2xl"
                      id="doi"
                      name="doi"
                      style={{
                        width: "100%",
                        height: "36px",
                        alignItems: "center",
                      }}
                      options={listJornadas.map((jornada) => ({
                        label: jornada,
                        value: jornada,
                      }))}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          jornadaEducativa: e.value,
                        })
                      }
                      value={formData.jornadaEducativa}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Ingrese la Jornada de Estudio"
                    />
                  </div>
                </div>
                <div className="column" style={{ width: "33.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Grado Actual:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese el Grado"
                      id="doi"
                      name="doi"
                      style={{ width: "100%" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gradoEducativo: e.currentTarget.value,
                        })
                      }
                      value={formData.gradoEducativo}
                    />
                  </div>
                </div>
                <div className="column" style={{ width: "33.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Situación Psicopedagogica:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese la situación psicopedagogía"
                      id="situacionPsicopedagogica"
                      name="situacionPsicopedagogica"
                      style={{ width: "100%", height: "40px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          situacionPsicopedagogica: e.currentTarget.value,
                        })
                      }
                      value={formData.situacionPsicopedagogica}
                    />
                  </div>
                </div>
              </div>

              <div className="column" style={{}}>
                <div className="column" style={{ width: "12%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="repitente"
                    >
                      ¿Es repitente?:
                    </label>

                    <div className="mydict">
                      <div>
                        <label className="radioLabel">
                          <input
                            className="input"
                            type="radio"
                            id="repitenteTrue"
                            name="repitente"
                            value="true"
                            checked={formData.repitente === true}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                repitente: true,
                              })
                            }
                          />
                          <span>Si</span>
                        </label>
                        <label className="radioLabel">
                          <input
                            className="input"
                            type="radio"
                            id="repitenteFalse"
                            name="repitente"
                            value="false"
                            checked={formData.repitente === false}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                repitente: false,
                                detalleRepitente: "",
                              })
                            }
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="column" style={{ width: "44%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Detalles del repitente:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Describa las causas, razones o detalles de la repetición de año"
                      id="repitente"
                      disabled={!formData.repitente}
                      name="repitente"
                      style={{ width: "100%", height: "40px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          detalleRepitente: e.currentTarget.value,
                        })
                      }
                      value={formData.detalleRepitente}
                    />
                  </div>
                </div>
                <div className="column" style={{ width: "44%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Observaciones:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese las Observaciones"
                      id="filiacion"
                      name="filiacion"
                      style={{ width: "100%", height: "40px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          observacionesEducativa: e.currentTarget.value,
                        })
                      }
                      value={formData.observacionesEducativa}
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
                    Subir Matricula:
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
                    onSelect={customBytesUploaderMatricula}
                    accept="application/pdf"
                  />
                </div>

              </div>
              <div className="column">
                <div className="input-box">
                  <label htmlFor="pdf" className="font-medium w-auto min-w-min">
                    Subir Calificaciones 1er Trimestre:
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
                    onSelect={customBytesUploaderCalf}
                    accept="application/pdf"
                  />
                </div>
                <div className="input-box">
                  <label htmlFor="pdf" className="font-medium w-auto min-w-min">
                    Subir Calificaciones 2do Trimestre:
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
                    onSelect={customBytesUploaderCalf2}
                    accept="application/pdf"
                  />
                </div>
                <div className="input-box">
                  <label htmlFor="pdf" className="font-medium w-auto min-w-min">
                    Subir Calificaciones 3er Trimestre:
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
                    onSelect={customBytesUploaderCalf3}
                    accept="application/pdf"
                  />
                </div>
              </div>

              <div className="btnSend" style={{ marginTop: "25px" }}>
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
                  className="buttonIcon"
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
                  <th className="trFichas">Nº de Registro</th>
                  <th className="trFichas">Cedula/Pasaporte</th>
                  <th className="trFichas">Nombres</th>
                  <th className="trFichas">Apellidos</th>
                  <th className="trFichas">Centro Educativo</th>
                  <th className="trFichas">Dirección </th>
                  <th className="trFichas">Jornada de Asistencia</th>
                  <th className="trFichas">Grado</th>
                  <th className="trFichas">Repitente</th>
                  <th className="trFichas">Observaciones</th>
                  <th className="trFichas">Matrícula</th>
                  <th className="trFichas">N. 1er Trimestre</th>
                  <th className="trFichas">N. 2do Trimestre</th>
                  <th className="trFichas">N. 3er Trimestre</th>
                  <th className="trFichas">Editar</th>
                  <th className="trFichas">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {contra1.map((contrato) => (
                  <tr
                    className="text-center"
                    key={contrato.idFichaEducativa?.toString()}
                  >
                    <td className="tdFichas">{contrato.idFichaEducativa}</td>
                    <td className="tdFichas">
                      {contrato.fichaPersonal?.ciPasaporte}
                    </td>
                    <td className="tdFichas">
                      {contrato.fichaPersonal?.nombres}
                    </td>
                    <td className="tdFichas">
                      {contrato.fichaPersonal?.apellidos}{" "}
                    </td>
                    <td className="tdFichas">{contrato.centroEducativo}</td>
                    <td className="tdFichas">{contrato.direccionEducativa}</td>
                    <td className="tdFichas">{contrato.jornadaEducativa}</td>
                    <td className="tdFichas">{contrato.gradoEducativo}</td>
                    <td className="tdFichas">
                      {contrato.repitente ? "Si" : "No"}
                    </td>
                    <td className="tdFichas">
                      {contrato.observacionesEducativa || 'S/N'}
                    </td>
                    <td className="tdFichas">
                      <ButtonPDF
                        base64={contrato.anexosMatricula}
                        filename={`Matricula_${contrato.fichaPersonal?.apellidos}_${contrato.fichaPersonal?.nombres}`}
                        tipo={`Matricula: ${contrato.fichaPersonal?.apellidos} ${contrato.fichaPersonal?.nombres}`}
                      />

                    </td>
                    <td className="tdFichas">
                      <ButtonPDF
                        base64={contrato.anexosCalificaciones1}
                        filename={`Calificaciones_1er_Trimestre_${contrato.fichaPersonal?.apellidos}_${contrato.fichaPersonal?.nombres}`}
                        tipo={`Calificaciones 1er Trimestre: ${contrato.fichaPersonal?.apellidos} ${contrato.fichaPersonal?.nombres}`}
                      />
                    </td>
                    <td className="tdFichas">
                      <ButtonPDF
                        base64={contrato.anexosCalificaciones2}
                        filename={`Calificaciones_2do_Trimestre_${contrato.fichaPersonal?.apellidos}_${contrato.fichaPersonal?.nombres}`}
                        tipo={`Calificaciones 2do Trimestre: ${contrato.fichaPersonal?.apellidos} ${contrato.fichaPersonal?.nombres}`}
                      />

                    </td>
                    <td className="tdFichas">
                      <ButtonPDF
                        base64={contrato.anexosCalificaciones3}
                        filename={`Calificaciones_3er_Trimestre_${contrato.fichaPersonal?.apellidos}_${contrato.fichaPersonal?.nombres}`}
                        tipo={`Calificaciones 3er Trimestre: ${contrato.fichaPersonal?.apellidos} ${contrato.fichaPersonal?.nombres}`}
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
                          handleEdit(contrato.idFichaEducativa?.valueOf())
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
                          handleDelete(contrato.idFichaEducativa?.valueOf())
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
