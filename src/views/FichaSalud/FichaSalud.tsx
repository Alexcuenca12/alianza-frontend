import React, { useEffect, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar, CalendarChangeEvent } from "primereact/calendar";
import cardHeader from "../../shared/CardHeader";
import { IFichaSalud } from "../../interfaces/IFichaSalud";
import { IFichaPersonal } from "../../interfaces/IFichaPersonal";
import { FichaPersonalService } from "../../services/FichaPersonalService";
import { FichaSaludService } from "../../services/FichaSaludService";
import swal from "sweetalert";
import { Dropdown } from "primereact/dropdown";
import "../../styles/FiltroFichas.css";
import { Divider } from "primereact/divider";
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from "primereact/inputnumber";
import toast, { Toaster } from "react-hot-toast";
import {
  IExcelReportParams,
  IHeaderItem,
} from "../../interfaces/IExcelReportParams";
import { ReportBar } from "../../common/ReportBar";
import { PiFilePdfFill } from "react-icons/pi";
import { ButtonPDF } from "../../common/ButtonPDF";

function FichaSaludContext() {
  const fichaPersonalService = new FichaPersonalService();
  const [busqueda, setBusqueda] = useState<string>("");
  const [foto, setFoto] = useState<string>(
    "https://cdn-icons-png.flaticon.com/128/666/666201.png"
  );
  const [listFperonales, setListFperonales] = useState<IFichaPersonal[]>([]);

  const [excelReportData, setExcelReportData] =
    useState<IExcelReportParams | null>(null);

  const [contra1, setcontra1] = useState<IFichaSalud[]>([]);
  const [formData, setFormData] = useState<IFichaSalud>({
    idFichaSalud: 0,
    condicionesMedicas: "",
    condicionesMedicas2: "",
    condicionesMedicas3: "",
    condicionesMedicas4: "",
    condicionesMedicas5: "",
    condicionesMedicasAdd: "",
    carnetDiscapacidad: false,
    masaCorporal: 0,
    situacionPsicoemocional: "",
    pesoFichaSalud: 0,
    tallaFichaSalud: 0,
    discapacidadNNAFichaSalud: false,
    tipoDiscapacidadFichaSalud: "",
    porcentajeDiscapacidadFichaSalud: 0,
    enfermedadesPrevalentesFichaSalud: "",
    fichaPersonal: null,
    fechaRegistro: new Date(),
    anexosCertificadoSalud: "",
    anexosCertificadoSalud2: "",
    anexosDiscapacidad: "",
  });

  const [tempTalla, setTempTalla] = useState<string>();
  const [tempPeso, setTempPeso] = useState<string>();

  const fileUploadRef = useRef<FileUpload>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<number | undefined>(undefined);
  const saludService = new FichaSaludService();

  const loadData = () => {
    saludService
      .getAll()
      .then((data) => {
        setcontra1(data);
        setDataLoaded(true); // Marcar los datos como cargados
        loadExcelReportData(data);
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
    if (validaciones()) {
      saludService
        .save(formData)
        .then((response) => {
          resetForm();
          swal("Ficha Salud", "Datos Guardados Correctamente", "success");
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
          saludService
            .delete(id)
            .then(() => {
              setcontra1(
                contra1.filter((contra) => contra.idFichaSalud !== id)
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
      const editItem = contra1.find((contra) => contra.idFichaSalud === id);
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
        setBusqueda(editItem.fichaPersonal?.ciPasaporte || "");
        setFoto(editItem.fichaPersonal?.foto || "");
        setTempPeso(editItem.pesoFichaSalud.toString() as string);
        setTempTalla(editItem.tallaFichaSalud.toString() as string);
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
        saludService
          .update(Number(editItemId), formData as IFichaSalud)
          .then((response) => {
            swal({
              title: "Ficha Médica",
              text: "Datos actualizados correctamente",
              icon: "success",
            });
            resetForm();
            setTempPeso("");
            setTempTalla("");
            loadDataID(response.fichaPersonal?.idFichaPersonal);
            setEditMode(false);
            setEditItemId(undefined);
            resetFiltro();
          })
          .catch((error) => {
            console.error("Error al actualizar el formulario:", error);
          });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      condicionesMedicas: "",
      condicionesMedicas2: "",
      condicionesMedicas3: "",
      condicionesMedicas4: "",
      condicionesMedicas5: "",
      condicionesMedicasAdd: "",
      carnetDiscapacidad: false,
      masaCorporal: 0,
      situacionPsicoemocional: "",
      pesoFichaSalud: 0,
      tallaFichaSalud: 0,
      discapacidadNNAFichaSalud: false,
      tipoDiscapacidadFichaSalud: "",
      porcentajeDiscapacidadFichaSalud: 0,
      enfermedadesPrevalentesFichaSalud: "",
      fichaPersonal: null,
      fechaRegistro: new Date(),
      anexosCertificadoSalud: "",
      anexosCertificadoSalud2: "",
      anexosDiscapacidad: "",
    });
    setEditMode(false);
    setEditItemId(undefined);
    setTempPeso("");
    setTempTalla("");
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  };

  if (!dataLoaded) {
    return <div style={{ marginLeft: "50%" }}>Cargando datos...</div>;
  }

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

    if (!formData.tallaFichaSalud) {
      toast("No olvides ingresar la talla más tarde", {
        icon: "⚠️",
        style: {
          fontSize: "15px",
        },
        duration: 4000,
      });
    }

    if (!formData.pesoFichaSalud) {
      toast("No olvides ingresar el peso más tarde", {
        icon: "⚠️",
        style: {
          fontSize: "15px",
        },
        duration: 4000,
      });
    }

    if (!formData.masaCorporal) {
      toast(
        "No olvides ingresar el indice de masa corporal mas tarde más tarde",
        {
          icon: "⚠️",
          style: {
            fontSize: "15px",
          },
          duration: 4000,
        }
      );
    }

    if (formData.discapacidadNNAFichaSalud) {
      if (!formData.tipoDiscapacidadFichaSalud) {
        toast.error(
          "Por favor, proporcione informacion acerca de la discapacidad",
          {
            style: {
              fontSize: "15px",
            },
            duration: 3000,
          }
        );
        return false;
      }
      if (!formData.porcentajeDiscapacidadFichaSalud) {
        toast(
          "No olvides ingresar el porcentaje de discapacidad mas tarde más tarde",
          {
            icon: "⚠️",
            style: {
              fontSize: "15px",
            },
            duration: 4000,
          }
        );
      }
    }

    if (!formData.situacionPsicoemocional) {
      toast("No ingresaste ninguna situacion psicoemocional", {
        icon: "⚠️",
        style: {
          fontSize: "15px",
        },
        duration: 4000,
      });
    }
    if (!formData.enfermedadesPrevalentesFichaSalud) {
      toast("No ingresaste ninguna enfermedad prevalente", {
        icon: "⚠️",
        style: {
          fontSize: "15px",
        },
        duration: 4000,
      });
    }
    if (
      !formData.condicionesMedicas &&
      !formData.condicionesMedicas2 &&
      !formData.condicionesMedicas3 &&
      !formData.condicionesMedicas4 &&
      !formData.condicionesMedicas5 &&
      !formData.condicionesMedicasAdd
    ) {
      toast("No ingresaste ninguna condicion medica", {
        icon: "⚠️",
        style: {
          fontSize: "15px",
        },
        duration: 4000,
      });
    }
    return true;
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
        console.error("Error al obtener los datos:", error);
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

  function loadExcelReportData(data: IFichaSalud[]) {
    const reportName = "Ficha Medica";
    const logo = "G1:I1";

    const rowData = data.map((item) => ({
      idFichaPersonal: item.idFichaSalud,
      tipoIdentificacion: item.fichaPersonal?.tipoIdentificacion || "",
      ciPasaporte: item.fichaPersonal?.ciPasaporte || "",
      apellidos: item.fichaPersonal?.apellidos || "",
      nombres: item.fichaPersonal?.nombres || "",
      talla: item.tallaFichaSalud + " m" || 0.0 + " m",
      peso: item.pesoFichaSalud + " kg" || 0.0 + " kg",
      masa: item.masaCorporal + " %" || 0.0 + " %",
      discapacidad: item.discapacidadNNAFichaSalud ? "SI" : "NO",
      carnet: item.carnetDiscapacidad ? "SI" : "NO",
      tipoDisc: item.tipoDiscapacidadFichaSalud || "N/A",
      porcDisca: item.porcentajeDiscapacidadFichaSalud + " %" || 0.0 + " %",
      psicoemocional: item.situacionPsicoemocional || "Ninguna",
      prevalentes: item.enfermedadesPrevalentesFichaSalud || "Niunguna",
      condicion1: item.condicionesMedicas || "Niunguna",
      condicion2: item.condicionesMedicas2 || "Niunguna",
      condicion3: item.condicionesMedicas3 || "Niunguna",
      condicion4: item.condicionesMedicas4 || "Niunguna",
      condicion5: item.condicionesMedicas5 || "Niunguna",
      condicionAdd: item.condicionesMedicasAdd || "Niunguna",
      fechaRegistro: item.fechaRegistro || "",
    }));
    const headerItems: IHeaderItem[] = [
      { header: "№ FICHA" },
      { header: "TIPO IDENTIFICACIÓN" },
      { header: "CI/PASAPORTE" },
      { header: "NOMBRES" },
      { header: "APELLIDOS" },
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
      { header: "FECHA REGISTRO" },
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
    saludService
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

  const customBytesUploaderCertificadoSalud1 = (
    event: FileUploadSelectEvent
  ) => {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      const reader = new FileReader();

      reader.onloadend = function () {
        const base64data = reader.result as string;
        setFormData({ ...formData, anexosCertificadoSalud: base64data });
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

  const customBytesUploaderCertificadoSalud2 = (
    event: FileUploadSelectEvent
  ) => {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      const reader = new FileReader();

      reader.onloadend = function () {
        const base64data = reader.result as string;
        setFormData({ ...formData, anexosCertificadoSalud2: base64data });
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

  const customBytesUploaderCarnet = (event: FileUploadSelectEvent) => {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      const reader = new FileReader();

      reader.onloadend = function () {
        const base64data = reader.result as string;
        setFormData({ ...formData, anexosDiscapacidad: base64data });
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
      // Eliminar encabezados o metadatos de la cadena base64
      const base64WithoutHeader = base64Data.replace(/^data:.*,/, "");

      const decodedData = atob(base64WithoutHeader); // Decodificar la cadena base64
      const byteCharacters = new Uint8Array(decodedData.length);

      for (let i = 0; i < decodedData.length; i++) {
        byteCharacters[i] = decodedData.charCodeAt(i);
      }

      const byteArray = new Blob([byteCharacters], { type: "application/pdf" });
      const fileUrl = URL.createObjectURL(byteArray);

      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = "AnexoMedico.pdf";
      link.click();
      swal({
        title: "Anexo Medico",
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
              Ficha Médica
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
                          setListFperonales([]);
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
                <div className="column" style={{ width: "30.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Talla:
                    </label>

                    <InputNumber
                      id="talla"
                      name="talla"
                      className="text-2xl"
                      inputId="percent"
                      value={formData.tallaFichaSalud || 0}
                      onValueChange={(e: InputNumberValueChangeEvent) =>
                        setFormData({
                          ...formData,
                          tallaFichaSalud: e.value || 0,
                        })
                      }
                      suffix=" m"
                      min={0}
                      minFractionDigits={2}
                      maxFractionDigits={2}
                      placeholder="Ingrese la talla"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
                <div className="column" style={{ width: "30.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Peso:
                    </label>
                    <InputNumber
                      id="peso"
                      name="peso"
                      className="text-2xl"
                      inputId="percent"
                      value={formData.pesoFichaSalud || 0}
                      onValueChange={(e: InputNumberValueChangeEvent) =>
                        setFormData({
                          ...formData,
                          pesoFichaSalud: e.value || 0,
                        })
                      }
                      suffix=" kg"
                      min={0}
                      minFractionDigits={2}
                      maxFractionDigits={2}
                      placeholder="Ingrese el peso"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
                <div className="column" style={{ width: "30.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Indice de masa corporal:
                    </label>

                    <InputNumber
                      id="filiacion"
                      name="filiacion"
                      className="text-2xl"
                      inputId="percent"
                      value={formData.masaCorporal || 0}
                      onValueChange={(e: InputNumberValueChangeEvent) =>
                        setFormData({
                          ...formData,
                          masaCorporal: e.value || 0,
                        })
                      }
                      suffix=" %"
                      min={0}
                      minFractionDigits={2}
                      maxFractionDigits={2}
                      placeholder="Ingrese el porcentaje de discapacidad"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              </div>

              <div className="column" style={{}}>
                <div className="column" style={{ width: "30.3%" }}>
                  <div className="column" style={{ width: "30%" }}>
                    <div className="input-box" style={{}}>
                      <label
                        className="font-medium w-auto min-w-min"
                        htmlFor="tipoDocumento"
                      >
                        Discapacidad:
                      </label>

                      <div className="mydict">
                        <div>
                          <label className="radioLabel">
                            <input
                              className="input"
                              type="radio"
                              id="discapacidadTrue"
                              name="discapacidad"
                              value="true"
                              checked={
                                formData.discapacidadNNAFichaSalud === true
                              }
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  discapacidadNNAFichaSalud: true,
                                })
                              }
                            />
                            <span>Si</span>
                          </label>
                          <label className="radioLabel">
                            <input
                              className="input"
                              type="radio"
                              id="discapacidadFalse"
                              name="discapacidad"
                              value="false"
                              checked={
                                formData.discapacidadNNAFichaSalud === false
                              }
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  discapacidadNNAFichaSalud: false,
                                  carnetDiscapacidad: false,
                                  tipoDiscapacidadFichaSalud: "",
                                  porcentajeDiscapacidadFichaSalud: 0,
                                })
                              }
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="column" style={{ width: "70%" }}>
                    <div className="input-box" style={{}}>
                      <label
                        className="font-medium w-auto min-w-min"
                        htmlFor="carner"
                      >
                        Carnet de discapacidad:
                      </label>

                      <div
                        className="mydict"
                        style={{
                          opacity: !formData.discapacidadNNAFichaSalud
                            ? 0.5
                            : 1,
                        }}
                      >
                        <div>
                          <label className="radioLabel">
                            <input
                              className="input"
                              disabled={!formData.discapacidadNNAFichaSalud}
                              type="radio"
                              id="carnerTrue"
                              name="carner"
                              value="true"
                              checked={formData.carnetDiscapacidad === true}
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  carnetDiscapacidad: true,
                                })
                              }
                            />
                            <span>Si</span>
                          </label>
                          <label className="radioLabel">
                            <input
                              className="input"
                              disabled={!formData.discapacidadNNAFichaSalud}
                              type="radio"
                              id="carnerFalse"
                              name="carner"
                              value="false"
                              checked={formData.carnetDiscapacidad === false}
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  carnetDiscapacidad: false,
                                })
                              }
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="column" style={{ width: "30.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Tipo de Discapacidad:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese el Tipo de Discapacidad"
                      id="tipoDiscapacidad"
                      name="tipoDiscapacidad"
                      style={{ width: "100%" }}
                      disabled={!formData.discapacidadNNAFichaSalud}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipoDiscapacidadFichaSalud: e.currentTarget.value,
                        })
                      }
                      value={formData.tipoDiscapacidadFichaSalud}
                    />
                  </div>
                </div>
                <div className="column" style={{ width: "30.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Porcentaje de Discapacidad:
                    </label>

                    <InputNumber
                      id="filiacion"
                      name="filiacion"
                      className="text-2xl"
                      inputId="percent"
                      disabled={!formData.discapacidadNNAFichaSalud}
                      value={formData.porcentajeDiscapacidadFichaSalud || 0}
                      onValueChange={(e: InputNumberValueChangeEvent) =>
                        setFormData({
                          ...formData,
                          porcentajeDiscapacidadFichaSalud: e.value || 0,
                        })
                      }
                      suffix=" %"
                      min={0}
                      minFractionDigits={2}
                      maxFractionDigits={2}
                      placeholder="Ingrese el porcentaje de discapacidad"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              </div>

              <div className="column" style={{}}>
                <div className="column" style={{ width: "50%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Situación psicoemocional:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese la situación psicoemocional"
                      id="psicoemocional"
                      name="psicoemocional"
                      style={{ width: "100%" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          situacionPsicoemocional: e.currentTarget.value,
                        })
                      }
                      value={formData.situacionPsicoemocional}
                    />
                  </div>
                </div>
                <div className="column" style={{ width: "50%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Enfermedades Prevalentes:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese las Enfermedades"
                      id="enfermedades"
                      name="enfermedades"
                      style={{ width: "100%" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enfermedadesPrevalentesFichaSalud:
                            e.currentTarget.value,
                        })
                      }
                      value={formData.enfermedadesPrevalentesFichaSalud}
                    />
                  </div>
                </div>
              </div>
              <Divider />

              <div className="column" style={{}}>
                <div className="column" style={{ width: "30.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Condicion médica 1:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese las Condiciones Médicas"
                      id="condiciones"
                      name="condiciones"
                      style={{ width: "100%" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condicionesMedicas: e.currentTarget.value,
                        })
                      }
                      value={formData.condicionesMedicas}
                    />
                  </div>
                </div>

                <div className="column" style={{ width: "30.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Condicione médica 2:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese las Condiciones Médicas"
                      id="condiciones2"
                      name="condiciones2"
                      style={{ width: "100%" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condicionesMedicas2: e.currentTarget.value,
                        })
                      }
                      value={formData.condicionesMedicas2}
                    />
                  </div>
                </div>
                <div className="column" style={{ width: "30.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Condicion médica 3:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese las Condiciones Médicas"
                      id="condiciones3"
                      name="condiciones3"
                      style={{ width: "100%" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condicionesMedicas3: e.currentTarget.value,
                        })
                      }
                      value={formData.condicionesMedicas3}
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
                      Condicion médica 4:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese las Condiciones Médicas"
                      id="condiciones4"
                      name="condiciones4"
                      style={{ width: "100%" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condicionesMedicas4: e.currentTarget.value,
                        })
                      }
                      value={formData.condicionesMedicas4}
                    />
                  </div>
                </div>
                <div className="column" style={{ width: "30.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Condicion médica 5:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese las Condiciones Médicas"
                      id="condiciones5"
                      name="condiciones5"
                      style={{ width: "100%" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condicionesMedicas5: e.currentTarget.value,
                        })
                      }
                      value={formData.condicionesMedicas5}
                    />
                  </div>
                </div>
                <div className="column" style={{ width: "30.3%" }}>
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Condicione médica adicional:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese las Condiciones Médicas"
                      id="condicionesadd"
                      name="condicionesadd"
                      style={{ width: "100%" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condicionesMedicasAdd: e.currentTarget.value,
                        })
                      }
                      value={formData.condicionesMedicasAdd}
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
                    Subir Certificado Salud:
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
                    onSelect={customBytesUploaderCertificadoSalud1}
                    accept="application/pdf"
                  />
                </div>
                <div className="input-box">
                  <label htmlFor="pdf" className="font-medium w-auto min-w-min">
                    Subir Certificado Salud 2:
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
                    onSelect={customBytesUploaderCertificadoSalud2}
                    accept="application/pdf"
                  />
                </div>

                <div className="input-box">
                  <label htmlFor="pdf" className="font-medium w-auto min-w-min">
                    Subir Certificado Discapacidad:
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
                    onSelect={customBytesUploaderCarnet}
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
                  <th className="trFichas">Nº de Ficha</th>
                  <th className="trFichas">Cedula/Pasaporte</th>
                  <th className="trFichas">Nombres</th>
                  <th className="trFichas">Apellidos</th>
                  <th className="trFichas">Peso</th>
                  <th className="trFichas">Talla</th>
                  <th className="trFichas">Masa corporal</th>
                  <th className="trFichas">Discapacidad</th>
                  <th className="trFichas">Tipo de Discapacidad</th>
                  <th className="trFichas">Porcentaje de Discapacidad</th>
                  <th className="trFichas">Enfermedades Prevalentes</th>
                  <th className="trFichas">Condiciones Médicas</th>
                  <th className="trFichas">Cert. Medico 1</th>
                  <th className="trFichas">Cert. Medico 2</th>
                  <th className="trFichas">Carnet Discapacidad</th>
                  <th className="trFichas">Editar</th>
                  <th className="trFichas">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {contra1.map((contrato) => (
                  <tr
                    className="text-center"
                    key={contrato.idFichaSalud?.toString()}
                  >
                    <td className="tdFichas">{contrato.idFichaSalud}</td>
                    <td className="tdFichas">
                      {contrato.fichaPersonal?.ciPasaporte}
                    </td>
                    <td className="tdFichas">
                      {contrato.fichaPersonal?.nombres}
                    </td>
                    <td className="tdFichas">
                      {contrato.fichaPersonal?.apellidos}{" "}
                    </td>
                    <td className="tdFichas">
                      {contrato.pesoFichaSalud + " kg" || "0.00 kg"}
                    </td>
                    <td className="tdFichas">
                      {contrato.tallaFichaSalud + " cm" || "0.00 cm"}
                    </td>
                    <td className="tdFichas">
                      {contrato.masaCorporal + " %" || "0.00 %"}
                    </td>
                    <td className="tdFichas">
                      {contrato.discapacidadNNAFichaSalud ? "Si" : "No"}
                    </td>
                    <td className="tdFichas">
                      {contrato.tipoDiscapacidadFichaSalud || "Ninguna"}
                    </td>
                    <td className="tdFichas">
                      {contrato.porcentajeDiscapacidadFichaSalud + " %" ||
                        "0.00 %"}
                    </td>
                    <td className="tdFichas">
                      {contrato.enfermedadesPrevalentesFichaSalud || "Ninguna"}
                    </td>
                    <td className="tdFichas">
                      {contrato.condicionesMedicas ||
                        contrato.condicionesMedicas2 ||
                        contrato.condicionesMedicas3 ||
                        contrato.condicionesMedicas4 ||
                        contrato.condicionesMedicas5 ||
                        contrato.condicionesMedicasAdd ||
                        "Ninguna"}
                    </td>
                    <td className="tdFichas">
                      <ButtonPDF
                        base64={contrato.anexosCertificadoSalud}
                        filename={`CertificadoMedico_${contrato.fichaPersonal?.apellidos}_${contrato.fichaPersonal?.nombres}`}
                        tipo={`Certificado Medico: ${contrato.fichaPersonal?.apellidos} ${contrato.fichaPersonal?.nombres}`}
                      />

                    </td>
                    <td className="tdFichas">
                      <ButtonPDF
                        base64={contrato.anexosCertificadoSalud2}
                        filename={`CertificadoMedico2_${contrato.fichaPersonal?.apellidos}_${contrato.fichaPersonal?.nombres}`}
                        tipo={`Certificado Medico 2: ${contrato.fichaPersonal?.apellidos} ${contrato.fichaPersonal?.nombres}`}
                      />

                    </td>
                    <td className="tdFichas">
                      <ButtonPDF
                        base64={contrato.anexosDiscapacidad}
                        filename={`CertificadoDiscapacidad_${contrato.fichaPersonal?.apellidos}_${contrato.fichaPersonal?.nombres}`}
                        tipo={`Certificado de Discapacidad: ${contrato.fichaPersonal?.apellidos} ${contrato.fichaPersonal?.nombres}`}
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
                          handleEdit(contrato.idFichaSalud?.valueOf())
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
                          handleDelete(contrato.idFichaSalud?.valueOf())
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

export default FichaSaludContext;
