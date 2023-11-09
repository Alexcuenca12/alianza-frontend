import React, { useEffect, useState, useRef } from "react";
import "../../styles/Fichas.css";
import { IRangoEdad } from "../../interfaces/IRangoEdad";
import { IFichaPersonal } from "../../interfaces/IFichaPersonal";
import { FichaPersonalService } from "../../services/FichaPersonalService";
import { IEtnia } from "../../interfaces/IEtnia";
import { IParroquia } from "../../interfaces/IParroquia";
import swal from "sweetalert";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import cardHeader from "../../shared/CardHeader";
import { Calendar, CalendarChangeEvent } from "primereact/calendar";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { CantonService } from "../../services/CantonService";
import { Divider } from "primereact/divider";
import { ParroquiaService } from "../../services/ParroquiaService";
import { ICanton } from "../../interfaces/ICanton";
import { RangoEdadService } from "../../services/RangoEdadService";
import { EtniaService } from "../../services/EtniaService";
import { ProvinciaService } from "../../services/ProvinciaService";
import { IProvincia } from "../../interfaces/IProvincia";
import { InputText } from "primereact/inputtext";
import { calcularEdad } from "../../services/functions/calcularEdad";
import { ReportBar } from "../../common/ReportBar";
import {
  IExcelReportParams,
  IHeaderItem,
} from "../../interfaces/IExcelReportParams";
import toast, { Toaster } from "react-hot-toast";
import { InputTextarea } from "primereact/inputtextarea";
import { PiFilePdfFill } from "react-icons/pi";
import previewBase64PDF from "../../common/previewPDF";
import dowloadBase64 from "../../common/dowloadPDF";
import { ButtonPDF } from "../../common/ButtonPDF";


interface busqueda {
  ciNombre: string;
  estado: boolean;
}

function FichaPersonal() {
  const fichaPersonalService = new FichaPersonalService();
  const parroquiaService = new ParroquiaService();
  const cantonService = new CantonService();
  const provinciaService = new ProvinciaService();
  const rangoEdadService = new RangoEdadService();
  const etniaService = new EtniaService();

  const [excelReportData, setExcelReportData] =
    useState<IExcelReportParams | null>(null);

  const fileUploadRef = useRef<FileUpload>(null);

  const [dataLoaded, setDataLoaded] = useState(false);

  const [editItemId, setEditItemId] = useState<number | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);
  const [tempCY, setTempCY] = useState<string>();
  const [tempCX, setTempCX] = useState<string>();
  const [busqueda, setBusqueda] = useState<busqueda>({
    ciNombre: "",
    estado: true,
  });
  const [listFichaPersonal, setListFichaPersonal] = useState<IFichaPersonal[]>(
    []
  );
  const [listParroquias, setListParroquias] = useState<IParroquia[]>([]);
  const [listCantones, setListCantones] = useState<ICanton[]>([]);
  const [listProvincias, setListProvincias] = useState<IProvincia[]>([]);
  const [listRangoEdades, setListRangoEdades] = useState<IRangoEdad[]>([]);
  const [listEtnias, setListEtnias] = useState<IEtnia[]>([]);

  const [selectedProvincia, setSelectedProvincia] =
    useState<IProvincia | null>();
  const [selectedCanton, setSelectedCanton] = useState<ICanton | null>();

  const tipoDocumentoOpc = [
    { label: "Cédula", value: "Cédula" },
    { label: "Pasaporte", value: "Pasaporte" },
  ];

  const foto64 =
    "data:image/jpeg;base64,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";

  const [formData, setFormData] = useState<IFichaPersonal>({
    idFichaPersonal: 0,
    foto: foto64,
    apellidos: "",
    nombres: "",
    tipoIdentificacion: "",
    actTrabInfantil: false,
    detalleActTrabInfantil: "",
    ciPasaporte: "",
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
    estVinculacion: false,
    fechaRegistro: new Date(),
    anexosCedula: "",
    anexosDocumentosLegales: "",
  });

  useEffect(() => {
    //METODOS PARA CARGAR LOS COMBOS DEL FORMILARIO
    cargarComboEtnias();
    loadData();
    loadProvicias();
    loadComboEdades();
  }, []);

  useEffect(() => {
    loadBusqueda();
  }, [busqueda]); // Se ejecutará cuando busqueda cambie

  const loadData = () => {
    fichaPersonalService
      .gelAllByEst(true)
      .then((data) => {
        setListFichaPersonal(data);
        loadExcelReportData(data);
        setDataLoaded(true); // Marcar los datos como cargados
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };

  const cargarComboEtnias = () => {
    etniaService
      .getAll()
      .then((data) => {
        setListEtnias(data);
        setDataLoaded(true); // Marcar los datos como cargados
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };

  const loadProvicias = () => {
    provinciaService
      .getAll()
      .then((data) => {
        setListProvincias(data);
        setDataLoaded(true); // Marcar los datos como cargados
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };

  const loadCantones = (id: number) => {
    cantonService
      .getBusqueda(id)
      .then((data) => {
        setListCantones(data);
        setDataLoaded(true); // Marcar los datos como cargados
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };

  const loadParroquias = (id: number) => {
    parroquiaService
      .getBusqueda(id)
      .then((data) => {
        setListParroquias(data);
        setDataLoaded(true); // Marcar los datos como cargados
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };

  const loadComboEdades = () => {
    rangoEdadService
      .getAll()
      .then((data: IRangoEdad[]) => {
        // Proporciona un tipo explícito para "data"
        // Transforma los datos para agregar la propiedad "label"
        const dataWithLabel = data.map((rangoEdad) => ({
          ...rangoEdad,
          label: `${rangoEdad.limInferior} - ${rangoEdad.limSuperior}`,
        }));

        // Establece la lista de rango de edades en el estado
        setListRangoEdades(dataWithLabel);
        setDataLoaded(true); // Marcar los datos como cargados
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };

  const customBytesUploaderCedula = (event: FileUploadSelectEvent) => {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      const reader = new FileReader();

      reader.onloadend = function () {
        const base64data = reader.result as string;
        setFormData({ ...formData, anexosCedula: base64data });
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

  const customBytesUploaderDocLegales = (event: FileUploadSelectEvent) => {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      const reader = new FileReader();

      reader.onloadend = function () {
        const base64data = reader.result as string;
        setFormData({ ...formData, anexosDocumentosLegales: base64data });
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

  const handleSubmit = (e: React.FormEvent) => {
    formData.estVinculacion = true;
    e.preventDefault();
    if (!formData.ciPasaporte) {
      toast.error("Ingrese su documento de identidad", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
    } else {
      fichaPersonalService
        .cedulaUnicaFP(formData.ciPasaporte)
        .then((data: boolean) => {
          if (data) {
            toast.error(
              "El numero de identificación que ingreso ya se encuentra registrado",
              {
                style: {
                  fontSize: "17px",
                },
                duration: 4500,
              }
            );
          } else {
            if (validaciones()) {
              fichaPersonalService
                .save(formData)
                .then((response) => {
                  resetForm();
                  swal(
                    "Ficha Personal",
                    "Datos Guardados Correctamente",
                    "success"
                  );

                  fichaPersonalService
                    .getAll()
                    .then((data) => {
                      setListFichaPersonal(data);
                      resetForm();
                      if (fileUploadRef.current) {
                        fileUploadRef.current.clear();
                      }
                    })
                    .catch((error) => {
                      console.error("Error al obtener los datos:", error);
                    });
                })
                .catch((error) => {
                  console.error("Error al enviar el formulario:", error);
                });
            } else {
              console.log("error");
            }
          }
        })
        .catch((error) => {
          console.error("Error al obtener los datos:", error);
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
          fichaPersonalService
            .delete(id)
            .then(() => {
              setListFichaPersonal(
                listFichaPersonal.filter(
                  (contra) => contra.idFichaPersonal !== id
                )
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
        // Crear una copia independiente de editItem
        const editedItem = { ...editItem };
        if (typeof editedItem.fechaRegistro === "string") {
          const registro = new Date(editedItem.fechaRegistro);
          registro.setDate(registro.getDate() + 1);
          const formattedDate = registro
            ? registro.toISOString().split("T")[0]
            : "";
          editedItem.fechaRegistro = formattedDate;
        }
        if (typeof editedItem.fechaNacimiento === "string") {
          const nacimiento = new Date(editedItem.fechaNacimiento);
          nacimiento.setDate(nacimiento.getDate() + 1);
          const formattedDate = nacimiento
            ? nacimiento.toISOString().split("T")[0]
            : "";
          editedItem.fechaNacimiento = formattedDate;
        }
        setFormData(editedItem);
        setEditMode(true);
        setEditItemId(id);
        setTempCY(editedItem.coordenadaY.toString() as string);
        setTempCX(editedItem.coordenadaX.toString() as string);
        setSelectedCanton(editedItem.parroquia?.canton);
        setSelectedProvincia(editedItem.parroquia?.canton.provincia);
      }
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (editItemId !== undefined) {
      if (validaciones()) {
        fichaPersonalService
          .update(Number(editItemId), formData as IFichaPersonal)
          .then((response) => {
            swal({
              title: "Ficha Personal",
              text: "Datos actualizados correctamente",
              icon: "success",
            });
            resetForm();
            if (fileUploadRef.current) {
              fileUploadRef.current.clear();
            }
            setSelectedCanton(null);
            setSelectedProvincia(null);
            loadData();
            setTempCY("");
            setTempCX("");
            setEditMode(false);
            setEditItemId(undefined);
          })
          .catch((error) => {
            console.error("Error al actualizar el formulario:", error);
          });
      }
    }
  };

  const customBytesUploader = (event: FileUploadSelectEvent) => {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      const reader = new FileReader();

      reader.onloadend = function () {
        const base64data = reader.result as string;
        setFormData({ ...formData, foto: base64data });
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

  const decodeBase64Download = (base64Data: string) => {
    try {
      // Eliminar encabezados o metadatos de la cadena base64
      const base64WithoutHeader = base64Data.replace(/^data:.*,/, "");
      console.log(base64WithoutHeader);

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

  const loadBusqueda = () => {
    fichaPersonalService
      .getBusquedaFP(busqueda.estado, busqueda.ciNombre)
      .then((data: IFichaPersonal[]) => {
        loadExcelReportData(data);
        setListFichaPersonal(data); // Establecer los datos procesados en el estado
        // setDataLoaded(true); // Puedes marcar los datos como cargados si es necesario
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
    // console.log('Datos enviados:', { listFichaPersonal });
  };

  function loadExcelReportData(data: IFichaPersonal[]) {
    const reportName = "Ficha Personal";
    const logo = "G1:I1";

    const rowData = data.map((item) => ({
      idFichaPersonal: item.idFichaPersonal,
      foto: item.foto || "",
      apellidos: item.apellidos || "",
      nombres: item.nombres || "",
      tipoIdentificacion: item.tipoIdentificacion || "",
      ciPasaporte: item.ciPasaporte || "",
      nacionalidad: item.nacionalidad || "",
      actTrabInfantil: item.actTrabInfantil ? "SI" : "NO",
      detalleActTrabInfantil: item.detalleActTrabInfantil || "N/A",
      fechaNacimiento: item.fechaNacimiento || "",
      edad: `${calcularEdad(item.fechaNacimiento)} años`,
      rangoEdad: `${item.rangoEdad?.limInferior} - ${item.rangoEdad?.limSuperior}`,
      genero: item.genero || "",
      etnia: item.etnia?.etniaNombre,
      provincia: item.parroquia?.canton.provincia.provinciaNombre,
      canton: item.parroquia?.canton.cantonNombre,
      parroquia: item.parroquia?.parroquiaNombre,
      zona: item.zona || "",
      barrioSector: item.barrioSector || "",
      direccion: item.direccion || "",
      referencia: item.referencia || "",
      coordenadaX: item.coordenadaX || "Pendiente",
      coordenadaY: item.coordenadaY || "Pendiente",
      estVinculacion: item.estVinculacion ? "VINCULADO" : "DESVINCULADO",
      fechaRegistro: item.fechaRegistro || "",
    }));
    const headerItems: IHeaderItem[] = [
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
    ];
    setExcelReportData({
      reportName,
      headerItems,
      rowData,
      logo,
    });
  }

  function validaciones(): boolean {
    if (!formData.ciPasaporte) {
      toast.error("Ingrese su documento de identidad", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.nombres) {
      toast.error("Por favor, ingrese los nombres", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.apellidos) {
      toast.error("Por favor, ingrese los apellidos", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.fechaNacimiento) {
      toast.error("Por favor, ingrese la fecha de nacimiento", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.nacionalidad) {
      toast.error("Por favor, ingrese la nacionalidad", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.etnia) {
      toast.error("Por favor, seleccione la etnia ", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.genero) {
      toast.error("Por favor, seleccione el genero", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.rangoEdad) {
      toast.error("Por favor, seleccione el rango de edad ", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (formData.actTrabInfantil && !formData.detalleActTrabInfantil) {
      toast.error("Por favor, detalle la actividad o trabajo del NNA ", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!selectedProvincia) {
      toast.error("Por favor, seleccione una provincia ", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!selectedCanton) {
      toast.error("Por favor, seleccione un canton ", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.parroquia) {
      toast.error("Por favor, seleccione una parroquia ", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.direccion) {
      toast.error("Por favor, ingrese la direccion del domicilio", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.barrioSector) {
      toast.error("Por favor, ingrese el barrio o sector del domicilio", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.zona) {
      toast.error("Por favor, seleccione la zona", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.referencia) {
      toast.error("Por favor, ingrese una referencia del domicilio", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (formData.foto === foto64) {
      toast("No olvides subir la foto más tarde", {
        icon: "⚠️",
        style: {
          fontSize: "15px",
        },
        duration: 4000,
      });
    }

    if (!formData.coordenadaY || !formData.coordenadaX) {
      toast("No olvides ingresar las coordenadas del domicilio más tarde", {
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
      idFichaPersonal: 0,
      foto: foto64,
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
      estVinculacion: false,
      fechaRegistro: new Date(),
      anexosCedula: "",
      anexosDocumentosLegales: "",
    });
    setSelectedCanton(null);
    setSelectedProvincia(null);
    setTempCY("");
    setTempCX("");
    setEditMode(false);
  };

  const resetBusqueda = () => {
    setBusqueda({
      ciNombre: "",
      estado: true,
    });
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
          style={{ marginBottom: "35px", maxWidth: "1100px" }}
        >
          <div
            className="h1-rem"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <h1 className="text-5xl font-smibold lg:md-2 h-full max-w-full max-h-full min-w-min">
              Ficha de Personal
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
              style={{ width: "95px", marginRight: "25px", fontWeight: "bold" }}
              dateFormat="dd-mm-yy" // Cambiar el formato a ISO 8601
              onChange={(e) => {
                if (
                  e.value !== undefined &&
                  e.value !== null &&
                  !Array.isArray(e.value)
                ) {
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

          <section className="container" style={{}}>
            <Divider align="left">
              <div className="inline-flex align-items-center">
                <i className="pi pi-book mr-2"></i>
                <b>Formulario </b>
              </div>
            </Divider>
            <form
              onSubmit={editMode ? handleUpdate : handleSubmit}
              className="form"
              encType="multipart/form-data"
            >
              <div className="column" style={{}}>
                <div
                  className="column"
                  style={{ width: "50%", display: "grid" }}
                >
                  <div className="input-box" style={{}}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="tipoDocumento"
                    >
                      Tipo de documento:
                    </label>
                    <div className=" " style={{ width: "100%" }}>
                      <Dropdown
                        className="text-2xl"
                        id="tiempo_dedicacion"
                        name="tiempo_dedicacion"
                        style={{
                          width: "100%",
                          height: "36px",
                          alignItems: "center",
                        }}
                        options={tipoDocumentoOpc}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tipoIdentificacion: e.value,
                            ciPasaporte: "",
                          })
                        }
                        value={formData.tipoIdentificacion}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Seleccione el tipo de documento de identificación"
                      />
                    </div>
                  </div>

                  <div className="input-box">
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="cedula;"
                    >
                      {!formData.tipoIdentificacion
                        ? "Debe seleccionar el tipo de identificaicon"
                        : formData.tipoIdentificacion === "Cédula"
                          ? "Cédula:"
                          : "Pasaporte:"}
                    </label>

                    <InputText
                      placeholder={
                        !formData.tipoIdentificacion
                          ? "Se habilitara cuando seleccione el tipo de identificaicon"
                          : formData.tipoIdentificacion === "Cédula"
                            ? "Ingrese el numero de cédula:"
                            : "Ingrese el numero de pasaporte:"
                      }
                      id="cedula"
                      disabled={!formData.tipoIdentificacion}
                      maxLength={
                        formData.tipoIdentificacion === "Cédula" ? 10 : 1000
                      } // Establecer el máximo de 10 caracteres
                      keyfilter="pint" // Solo permitir dígitos enteros positivos
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ciPasaporte: e.target.value,
                        })
                      }
                      title="Ingresar el documento de identidad del NNA"
                      value={formData.ciPasaporte}
                    />
                    <span className="input-border"></span>
                  </div>
                </div>

                <div className="column" style={{ width: "50%" }}>
                  <div className="input-box">
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="foto;"
                    >
                      Foto:
                    </label>

                    <FileUpload
                      name="img"
                      style={{}}
                      chooseLabel="Escoger"
                      uploadLabel="Cargar"
                      cancelLabel="Cancelar"
                      emptyTemplate={
                        <p className="m-0 p-button-rounded">
                          Arrastre y suelte la foto aquí para cargarlos.
                        </p>
                      }
                      customUpload
                      onSelect={customBytesUploader}
                      accept="image/*"
                    />
                  </div>
                </div>
              </div>
              <Divider style={{ marginTop: "30px" }} />
              <div className="column">
                <div className="input-box">
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="nombres"
                  >
                    Nombres:
                  </label>

                  <InputText
                    className="input"
                    placeholder=" Ingresar los nombres"
                    id="nombre"
                    keyfilter={/^[A-Za-z\s]*$/} // Solo permitir caracteres alfabeticos
                    onChange={(e) =>
                      setFormData({ ...formData, nombres: e.target.value })
                    }
                    title="Ingresar los nombres del NNA"
                    value={formData.nombres}
                  />

                  <span className="input-border"></span>
                </div>

                <div className="input-box">
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="apellidos"
                  >
                    Apellidos:
                  </label>

                  <InputText
                    className="input"
                    placeholder=" Ingresar los apellidos"
                    id="apellido"
                    keyfilter={/^[A-Za-z\s]*$/} // Solo permitir caracteres alfabeticos
                    onChange={(e) =>
                      setFormData({ ...formData, apellidos: e.target.value })
                    }
                    title="Ingresar los apellidos del NNA"
                    value={formData.apellidos}
                  />
                  <span className="input-border"></span>
                </div>
              </div>
              <div className="column">
                <div className="column" style={{ width: "50%" }}>
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
                      htmlFor="fechaDesvinculacion"
                      className="font-medium w-auto min-w-min"
                    >
                      Fecha de Nacimiento:
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
                          if (calcularEdad(formattedDate) >= 17) {
                            setFormData({
                              ...formData,
                              fechaNacimiento: formattedDate,
                              rangoEdad: {
                                idRangoEdad: 2,
                                limInferior: 0,
                                limSuperior: 0,
                              },
                            });
                          } else {
                            setFormData({
                              ...formData,
                              fechaNacimiento: formattedDate,
                              rangoEdad: {
                                idRangoEdad: 1,
                                limInferior: 0,
                                limSuperior: 0,
                              },
                            });
                          }
                        }
                      }}
                      value={
                        formData.fechaNacimiento
                          ? new Date(formData.fechaNacimiento)
                          : null
                      }
                    />
                    <span className="input-border"></span>
                  </div>
                </div>
                <div className="column" style={{ width: "50%" }}>
                  <div className="input-box" style={{ width: "50%" }}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="nacionalidad"
                    >
                      Nacionalidad:
                    </label>

                    <InputText
                      className="input"
                      placeholder=" Ingresar la nacionalidad"
                      id="nacionalidad"
                      keyfilter="alpha" // Solo permitir caracteres alfabeticos
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nacionalidad: e.target.value,
                        })
                      }
                      title="Ingresar la nacionalidad del NNA"
                      value={formData.nacionalidad}
                    />
                    <span className="input-border"></span>
                  </div>

                  <div className="input-box" style={{ width: "50%" }}>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="etnia"
                    >
                      Etnia:
                    </label>
                    <div className=" " style={{ width: "100%" }}>
                      <Dropdown
                        className="text-2xl"
                        id="tiempo_dedicacion"
                        name="tiempo_dedicacion"
                        style={{
                          width: "100%",
                          height: "36px",
                          alignItems: "center",
                        }}
                        options={listEtnias}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            etnia: {
                              idEtnia: parseInt(e.value),
                              etniaNombre: "",
                            },
                          })
                        }
                        value={formData.etnia?.idEtnia}
                        optionLabel="etniaNombre"
                        optionValue="idEtnia"
                        placeholder="Seleccione la etnia"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="column">
                <div className="input-box">
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="genero"
                  >
                    Genero:
                  </label>
                  <div className="mydict">
                    <div>
                      <label className="radioLabel">
                        <input
                          className="input"
                          type="radio"
                          id="genMasculino"
                          name="masculino"
                          value="Masculino"
                          checked={formData.genero === "Masculino"}
                          onChange={(e) =>
                            setFormData({ ...formData, genero: e.target.value })
                          }
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
                          checked={formData.genero === "Femenino"}
                          onChange={(e) =>
                            setFormData({ ...formData, genero: e.target.value })
                          }
                        />
                        <span>Femenino</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="input-box">
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="rangoEdad"
                  >
                    Rango de Edad:
                  </label>
                  <div className="">
                    <Dropdown
                      className="text-2xl"
                      id="tiempo_dedicacion"
                      name="tiempo_dedicacion"
                      style={{
                        width: "100%",
                        height: "36px",
                        alignItems: "center",
                      }}
                      options={listRangoEdades}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rangoEdad: {
                            idRangoEdad: parseInt(e.value),
                            limInferior: 0,
                            limSuperior: 0,
                          },
                        })
                      }
                      value={formData.rangoEdad?.idRangoEdad}
                      optionLabel="label"
                      optionValue="idRangoEdad"
                      placeholder="Seleccione el rango de edad"
                    />
                  </div>
                </div>
              </div>
              <div className="column">
                <div className="column" style={{ width: "50%" }}>
                  <div className="input-box">
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="actInfantil"
                    >
                      Act/Trab Infantil:
                    </label>
                    <div className="actInf">
                      <div className="mydict">
                        <div>
                          <label className="radioLabel">
                            <input
                              className="input"
                              type="radio"
                              id="actSI"
                              name="actSI"
                              value="true"
                              checked={formData.actTrabInfantil === true}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  actTrabInfantil: true,
                                })
                              }
                            />
                            <span>SI</span>
                          </label>
                          <label className="radioLabel">
                            <input
                              className="input"
                              type="radio"
                              id="actNO"
                              name="actNO"
                              value="false"
                              checked={formData.actTrabInfantil === false}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  actTrabInfantil: false,
                                  detalleActTrabInfantil: "",
                                })
                              }
                            />
                            <span>NO</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="column" style={{ width: "50%" }}>
                  <div className="input-box">
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="direccion"
                    >
                      Detalle de la act/trab Infantil:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      style={{ width: "100%", height: "40px" }}
                      disabled={!formData.actTrabInfantil}
                      placeholder="Detalle la actividad/trabajo que realiza el NNA"
                      id="detActInf"
                      keyfilter={/^[A-Za-z\s]*$/} // Solo permitir caracteres alfabeticos
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          detalleActTrabInfantil: e.target.value,
                        })
                      }
                      title="Ingresar la dirección de residencia del NNA"
                      value={formData.detalleActTrabInfantil}
                    />
                    <span className="input-border"></span>
                  </div>
                </div>
              </div>
              <Divider style={{ marginTop: "30px" }} />
              <div className="column">
                <div className="input-box">
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="provincia"
                  >
                    Provincia:
                  </label>
                  <div className=" ">
                    <div className="flex justify-content-center">
                      <Dropdown
                        value={selectedProvincia?.idProvincia}
                        onChange={(e: DropdownChangeEvent) => {
                          setSelectedProvincia({
                            idProvincia: parseInt(e.value),
                            provinciaNombre: "",
                          });
                          loadCantones(parseInt(e.value));
                          setListParroquias([]);
                        }}
                        options={listProvincias}
                        optionLabel="provinciaNombre"
                        optionValue="idProvincia"
                        placeholder="Seleccione una Provincia"
                        filter
                        className=""
                        style={{
                          width: "100%",
                          height: "36px",
                          alignItems: "center",
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="input-box">
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="parroquia"
                  >
                    Canton:
                  </label>
                  <div className=" ">
                    <div className="flex justify-content-center">
                      <Dropdown
                        disabled={listCantones.length === 0}
                        value={selectedCanton?.idCanton}
                        onChange={(e: DropdownChangeEvent) => {
                          const Prov: IProvincia = {
                            idProvincia: 0,
                            provinciaNombre: "",
                          };
                          setSelectedCanton({
                            idCanton: parseInt(e.value),
                            cantonNombre: "",
                            provincia: Prov,
                          });
                          loadParroquias(parseInt(e.value));
                        }}
                        options={listCantones}
                        optionLabel="cantonNombre"
                        optionValue="idCanton"
                        placeholder="Seleccione un Canton"
                        filter
                        className=""
                        style={{
                          width: "100%",
                          height: "36px",
                          alignItems: "center",
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="input-box">
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="parroquia"
                  >
                    Parroquia:
                  </label>
                  <div className=" ">
                    <div className="flex justify-content-center">
                      <Dropdown
                        disabled={listParroquias.length === 0}
                        value={formData.parroquia?.idParroquia}
                        onChange={(e: DropdownChangeEvent) =>
                          setFormData({
                            ...formData,
                            parroquia: {
                              idParroquia: parseInt(e.value),
                              parroquiaNombre: "",
                              canton: {
                                idCanton: 0,
                                cantonNombre: "",
                                provincia: {
                                  idProvincia: 0,
                                  provinciaNombre: "",
                                },
                              },
                            },
                          })
                        }
                        options={listParroquias}
                        optionLabel="parroquiaNombre"
                        optionValue="idParroquia"
                        placeholder="Seleccione una Parroquia"
                        filter
                        className="text-2xl"
                        style={{
                          width: "100%",
                          height: "36px",
                          alignItems: "center",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="input-box">
                <label
                  className="font-medium w-auto min-w-min"
                  htmlFor="direccion"
                >
                  Dirección:
                </label>
                <InputText
                  className="input"
                  placeholder=" Ingresar la direccion"
                  id="direccion"
                  keyfilter={/^[A-Za-z\s]*$/} // Solo permitir caracteres alfabeticos
                  onChange={(e) =>
                    setFormData({ ...formData, direccion: e.target.value })
                  }
                  title="Ingresar la dirección de residencia del NNA"
                  value={formData.direccion}
                />
                <span className="input-border"></span>
              </div>
              <div className="column">
                <div className="column" style={{ width: "50%" }}>
                  <div className="input-box">
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="barrio"
                    >
                      Barrio/Sector:
                    </label>
                    <InputText
                      className="input"
                      placeholder=" Ingresar nombre del barrio donde se ubica el hogar"
                      id="barrio"
                      keyfilter={/^[A-Za-z\s]*$/} // Solo permitir caracteres alfabeticos
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          barrioSector: e.target.value,
                        })
                      }
                      title="Ingresar el barrio donde se ubica la residencia del NNA"
                      value={formData.barrioSector}
                    />
                    <span className="input-border"></span>
                  </div>

                  <div className="input-box">
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="zona"
                    >
                      Zona:
                    </label>

                    <div className="mydict">
                      <div>
                        <label className="radioLabel">
                          <input
                            className="input"
                            type="radio"
                            id="zonaUrbana"
                            name="zona"
                            value="Urbana"
                            checked={formData.zona === "Urbana"}
                            onChange={(e) =>
                              setFormData({ ...formData, zona: e.target.value })
                            }
                          />
                          <span>Urbana</span>
                        </label>
                        <label className="radioLabel">
                          <input
                            className="input"
                            type="radio"
                            id="zonaRural"
                            name="zona"
                            value="Rural"
                            checked={formData.zona === "Rural"}
                            onChange={(e) =>
                              setFormData({ ...formData, zona: e.target.value })
                            }
                          />
                          <span>Rural</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="column" style={{ width: "50%" }}>
                  <div className="input-box">
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="referencia"
                    >
                      Referencia:
                    </label>

                    <InputTextarea
                      className="text-2xl"
                      style={{ width: "100%", height: "40px" }}
                      placeholder=" Ingresar una referencia cercana al hogar"
                      id="referencia"
                      keyfilter={/^[A-Za-z\s]*$/} // Solo permitir caracteres alfabeticos
                      onChange={(e) =>
                        setFormData({ ...formData, referencia: e.target.value })
                      }
                      title="Ingresar una referencia de la residencia del NNA"
                      value={formData.referencia}
                    />

                    <span className="input-border"></span>
                  </div>
                </div>
              </div>
              <div className="column">
                <div className="input-box">
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="coordenadaY"
                  >
                    Coordenadas en Y (latitud) del la residencia:
                  </label>

                  <InputText
                    className="input"
                    placeholder=" Ingresar las coordenadas en Y (latitud) del la residencia "
                    id="coordenadaY"
                    keyfilter="num"
                    onChange={(e) => {
                      setTempCY(e.target.value);
                      setFormData({
                        ...formData,
                        coordenadaY: parseFloat(e.target.value),
                      });
                    }}
                    title="Ingresar las coordenadas en Y (latitud) del la residencia "
                    value={tempCY}
                  />

                  <span className="input-border"></span>
                </div>
                <div className="input-box">
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="coordenadaX"
                  >
                    Coordenadas en X (longitud) del la residencia:
                  </label>

                  <InputText
                    className="input"
                    placeholder=" Ingresar las coordenadas en X (longitud) del la residencia "
                    id="coordenadaX"
                    keyfilter="num"
                    onChange={(e) => {
                      setTempCX(e.target.value);
                      setFormData({
                        ...formData,
                        coordenadaX: parseFloat(e.target.value),
                      });
                    }}
                    title="Ingresar las coordenadas en Y (latitud) del la residencia "
                    value={tempCX}
                  />
                  <span className="input-border"></span>
                </div>
              </div>
              {/*ANEXOS*/}
              <Divider align="left">
                <div className="inline-flex align-items-center">
                  <i className="pi pi-file-pdf mr-2"></i>
                  <b>Anexos</b>
                </div>
              </Divider>
              <div className="column">
                <div className="input-box">
                  <label htmlFor="pdf" className="font-medium w-auto min-w-min">
                    Subir Cédula NNA:
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
                    onSelect={customBytesUploaderCedula}
                    accept="application/pdf"
                  />
                </div>
                <div className="input-box">
                  <label htmlFor="pdf" className="font-medium w-auto min-w-min">
                    Subir Documentos Legales:
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
                    onSelect={customBytesUploaderDocLegales}
                    accept="application/pdf"
                  />
                </div>
              </div>

              <Divider style={{ marginTop: "30px" }} />
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
                    onClick={resetForm}
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
              <div className="opcTbl">
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
                      // Actualizar el estado usando setFormData
                      setBusqueda({
                        ...busqueda,
                        ciNombre: e.currentTarget.value,
                      });
                      // Luego, llamar a loadBusqueda después de que se actualice el estado
                      loadBusqueda();
                    }}
                    value={busqueda.ciNombre}
                  />

                  <Button icon="pi pi-search" className="p-button-warning" />
                </div>
              </div>

              <div className="opcTbl">
                <label
                  className="font-medium w-auto min-w-min"
                  htmlFor="estado"
                >
                  Estado:
                </label>

                <div className="mydict">
                  <div>
                    <label className="radioLabel">
                      <input
                        className="input"
                        type="radio"
                        id="estAct"
                        name="estAct"
                        value="true"
                        checked={busqueda.estado === true}
                        onChange={(e) => {
                          setBusqueda({ ...busqueda, estado: true });
                          loadBusqueda();
                        }}
                      />
                      <span>Vinculado</span>
                    </label>
                    <label className="radioLabel">
                      <input
                        className="input"
                        type="radio"
                        id="estInact"
                        name="estInact"
                        value="false"
                        checked={busqueda.estado === false}
                        onChange={(e) => {
                          setBusqueda({ ...busqueda, estado: false });
                          loadBusqueda();
                        }}
                      />
                      <span>Desvinculado</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="opcTbl">
                <label
                  className="font-medium w-auto min-w-min"
                  htmlFor="estado"
                >
                  Refrescar tabla:
                </label>

                <Button
                  className="buttonIcon" // Agrega una clase CSS personalizada
                  icon="pi pi-refresh"
                  style={{ width: "120px", height: "39px" }}
                  severity="danger"
                  aria-label="Cancel"
                  onClick={resetBusqueda}
                />
              </div>

              <div className="" style={{ flex: 1, paddingTop: "24px" }}>
                <ReportBar
                  reportName={excelReportData?.reportName!}
                  headerItems={excelReportData?.headerItems!}
                  rowData={excelReportData?.rowData!}
                  logo={excelReportData?.logo!}
                  onButtonClick={() => {
                    loadBusqueda();
                  }}
                />
              </div>
            </div>
          </div>

          <Divider align="left" style={{ marginBottom: "0px" }}>
            <div className="inline-flex align-items-center">
              <i className="pi pi-list mr-2"></i>
              <b>Lista </b>
            </div>
          </Divider>

          <div className="tblContainer">
            <table className="tableFichas">
              <thead className="theadTab">
                <tr>
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
                  <th className="trFichas">Cédula NNA</th>
                  <th className="trFichas">Doc. Legales</th>
                  <th className="trFichas">Editar</th>
                  <th className="trFichas">Eliminar</th>
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
                    <td className="tdFichas">
                      {calcularEdad(ficha.fechaNacimiento)}
                    </td>
                    <td className="tdFichas">{ficha.genero}</td>
                    <td className="tdFichas">
                      {ficha.parroquia?.canton.cantonNombre}
                    </td>
                    <td className="tdFichas">{ficha.barrioSector}</td>
                    <td className="tdFichas" style={{ width: "70px" }}>
                      {ficha.foto ? (
                        <>
                          <section className="imgSection">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <img
                                src={ficha.foto}
                                alt="FotoNNA"
                                style={{ width: "65px" }}
                              />
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                bottom: "0",
                                right: "0",
                                margin: "5px",
                              }}
                            >
                              <button
                                className="BtnDown"
                                title="Descargar"
                                onClick={() => decodeBase64Download(ficha.foto)}
                              >
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
                      {/*CEDULA*/}
                    </td>
                    <td className="tdFichas">
                      <ButtonPDF
                        base64={ficha.anexosCedula}
                        filename={`Cédula_${ficha.apellidos}_${ficha.nombres}`}
                        tipo={`Cédula: ${ficha.apellidos} ${ficha.nombres}`}
                      />

                    </td>
                    {/*Doc. Legales*/}
                    <td className="tdFichas">
                      <ButtonPDF
                        base64={ficha.anexosDocumentosLegales!}
                        filename={`DocumentosLegales_${ficha.apellidos}_${ficha.nombres}`}
                        tipo={`DocumentosLegales: ${ficha.apellidos} ${ficha.nombres}`}
                      />
                    </td>

                    <td className="tdFichas">
                      <Button
                        className="buttonIcon"
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
                          handleEdit(ficha.idFichaPersonal?.valueOf())
                        }
                      />
                    </td>
                    <td className="tdFichas">
                      <Button
                        className="buttonIcon"
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
      </Fieldset>
    </>
  );
}

export default FichaPersonal;
