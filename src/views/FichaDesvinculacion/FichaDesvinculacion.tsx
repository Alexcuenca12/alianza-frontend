import React, { useEffect, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Calendar, CalendarChangeEvent } from "primereact/calendar";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import cardHeader from "../../shared/CardHeader";
import { Divider } from "primereact/divider";
import { IFichaDesvinculacion } from "../../interfaces/IFichaDesvinculacion";
import { FichaDesvinculacionService } from "../../services/FichaDesvinculacionService";
import swal from "sweetalert";
import { IFichaPersonal } from "../../interfaces/IFichaPersonal";
import { FichaPersonalService } from "../../services/FichaPersonalService";
import { Dropdown } from "primereact/dropdown";
import "../../styles/FiltroFichas.css";
import {
  IExcelReportParams,
  IHeaderItem,
} from "../../interfaces/IExcelReportParams";
import { ReportBar } from "../../common/ReportBar";
import toast, { Toaster } from "react-hot-toast";
import "../../styles/Fichas.css";
import { InputTextarea } from "primereact/inputtextarea";
import { PiFilePdfFill } from "react-icons/pi";
import { ButtonPDF } from "../../common/ButtonPDF";

function FichaDesvinculacion() {
  const [listFperonales, setListFperonales] = useState<IFichaPersonal[]>([]);
  const [busqueda, setBusqueda] = useState<string>("");
  const [contra1, setcontra1] = useState<IFichaDesvinculacion[]>([]);
  const [formData, setFormData] = useState<IFichaDesvinculacion>({
    idFichaDesvinculacion: 0,
    fechaDesvinculacion: "",
    motivo: "",
    anexosExtras: "",
    fichaPersonal: null,
    fechaRegistro: new Date(),
  });

  const fileUploadRef = useRef<FileUpload>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<number | undefined>(undefined);
  const desvinService = new FichaDesvinculacionService();
  const fichaPersonalService = new FichaPersonalService();
  const [foto, setFoto] = useState<string>(
    "https://cdn-icons-png.flaticon.com/128/666/666201.png"
  );
  const [excelReportData, setExcelReportData] =
    useState<IExcelReportParams | null>(null);

  const loadData = () => {
    desvinService
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

  const customBytesUploader = (event: FileUploadSelectEvent) => {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      const reader = new FileReader();

      reader.onloadend = function () {
        const base64data = reader.result as string;
        setFormData({ ...formData, anexosExtras: base64data });
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
    e.preventDefault();
    if (validaciones()) {
      desvinService
        .save(formData)
        .then((response) => {
          loadDataID(response.fichaPersonal?.idFichaPersonal);
          resetForm();
          swal(
            "Ficha Desvinculacion",
            "Datos Guardados Correctamente",
            "success"
          );
          resetFiltro();
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
          desvinService
            .delete(id)
            .then(() => {
              setcontra1(
                contra1.filter((contra) => contra.idFichaDesvinculacion !== id)
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
        (contra) => contra.idFichaDesvinculacion === id
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

        if (typeof editedItem.fechaDesvinculacion === "string") {
          const nacimiento = new Date(editedItem.fechaDesvinculacion);
          nacimiento.setDate(nacimiento.getDate() + 1);
          const formattedDate = nacimiento
            ? nacimiento.toISOString().split("T")[0]
            : "";
          editedItem.fechaDesvinculacion = formattedDate;
        }

        setFormData(editedItem);

        setEditMode(true);
        setEditItemId(id);

        setBusqueda(editedItem.fichaPersonal?.ciPasaporte ?? "");
        setFoto(editedItem.fichaPersonal?.foto ?? "");

        if (editedItem.fichaPersonal !== null) {
          const editItemWithLabel = {
            ...editedItem,
            fichaPersonal: {
              ...editedItem.fichaPersonal,
              label: `${editedItem.fichaPersonal.ciPasaporte} || ${editedItem.fichaPersonal.apellidos} ${editedItem.fichaPersonal.nombres}`,
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
      desvinService
        .update(Number(editItemId), formData as IFichaDesvinculacion)
        .then((response) => {
          loadDataID(response.fichaPersonal?.idFichaPersonal);
          swal({
            title: "Ficha Desvinculacion",
            text: "Datos actualizados correctamente",
            icon: "success",
          });
          resetForm();
          resetFiltro();

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
      fechaDesvinculacion: "",
      motivo: "",
      anexosExtras: "",
      fichaPersonal: null,
      fechaRegistro: new Date(),
    });
    setEditMode(false);
    setEditItemId(undefined);
    if (fileUploadRef.current) {
      fileUploadRef.current.clear(); // Limpiar el campo FileUpload
    }
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
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };

  const cargarFoto = (id: number) => {
    const fPersonal = listFperonales.find(
      (persona) => persona.idFichaPersonal === id
    );
    console.log("chucha= " + formData.fichaPersonal?.idFichaPersonal);
    if (fPersonal) {
      // Actualiza formData con la foto correspondiente
      setFoto(fPersonal.foto);
    }
  };

  function loadExcelReportData(data: IFichaDesvinculacion[]) {
    const reportName = "Ficha de Desvinculación";
    const logo = "G1:K1";
    const rowData = data.map((item) => ({
      idFicha: item.idFichaDesvinculacion,
      tipoIdentcedula: item.fichaPersonal?.tipoIdentificacion,
      cedula: item.fichaPersonal?.ciPasaporte,
      nombres: item.fichaPersonal?.nombres,
      apellidos: item.fichaPersonal?.apellidos,
      fechaDesvinculacion: new Date(
        item.fechaDesvinculacion!
      ).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      motivo: item.motivo,
    }));
    const headerItems: IHeaderItem[] = [
      { header: "№ FICHA" },
      { header: "TIPO DE IDENTIFICACION" },
      { header: "CEDULA/PASAPORTE" },
      { header: "NOMBRES" },
      { header: "APELLIDOS" },
      { header: "FECHA DE DESVINCULACIÓN" },
      { header: "MOTIVO" },
    ];

    setExcelReportData({
      reportName,
      headerItems,
      rowData,
      logo,
    });
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

    if (!formData.fechaDesvinculacion) {
      toast.error("Seleccione la fecha de desvinculacion", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.motivo) {
      toast.error("Debe proporcionar detaller de la desvinculacion", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    return true;
  }

  const loadDataID = (id: number) => {
    desvinService
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

  const resetFiltro = () => {
    setBusqueda("");
    setFoto("https://cdn-icons-png.flaticon.com/128/666/666201.png");
    setListFperonales([]);
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
          style={{ marginBottom: "35px", maxWidth: "1150px" }}
        >
          <div
            className="h1-rem"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <h1 className="text-5xl font-smibold lg:md-2 h-full max-w-full max-h-full min-w-min">
              Ficha de Desvinculación
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
                  onClick={() => {
                    resetFiltro();
                    loadData();
                  }}
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
                        // keyfilter="int"
                        onChange={(e) => {
                          // Actualizar el estado usando setFormData
                          setListFperonales([]); // Asignar un arreglo vacío para vaciar el estado listFperonales
                          setBusqueda(e.currentTarget.value);
                          // Luego, llamar a loadRelacion después de que se actualice el estado
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
                        loadDataID(parseInt(e.value));
                        cargarFoto(parseInt(e.value));
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
                <div className="column" style={{ width: "30%" }}>
                  <div
                    className=""
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
                      Fecha de Desvinculación:
                    </label>
                    <Calendar
                      className="text-2xl"
                      id="fechaDesvinculacion"
                      style={{ width: "100%" }}
                      name="fechaDesvinculacion"
                      placeholder="Ingrese la Fecha de Desvinculación"
                      required
                      dateFormat="dd-mm-yy" // Cambiar el formato a ISO 8601
                      showIcon
                      onChange={(e) => {
                        const selectedDate =
                          e.value instanceof Date ? e.value : null;
                        if (selectedDate) {
                          selectedDate.setDate(selectedDate.getDate() + 1);
                          const formattedDate = selectedDate
                            .toISOString()
                            .split("T")[0];
                          setFormData({
                            ...formData,
                            fechaDesvinculacion: formattedDate,
                          });
                        } else {
                          setFormData({
                            ...formData,
                            fechaDesvinculacion: "", // Si no se selecciona ninguna fecha
                          });
                        }
                      }}
                      value={
                        formData.fechaDesvinculacion
                          ? new Date(formData.fechaDesvinculacion)
                          : null
                      }
                    />
                    <span className="input-border"></span>
                  </div>
                </div>
                <div className="column" style={{ width: "70%" }}>
                  <div
                    className=""
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      paddingBottom: "35px",
                    }}
                  >
                    <label
                      htmlFor="motivo"
                      className="font-medium w-auto min-w-min"
                    >
                      Motivo:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese el Motivo"
                      id="motivo"
                      name="motivo"
                      style={{ width: "100%" }}
                      value={formData.motivo}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData({
                          ...formData,
                          motivo: e.currentTarget.value,
                        })
                      }
                    />
                    <span className="input-border"></span>
                  </div>
                </div>
              </div>

              <Divider align="left">
                <div className="inline-flex align-items-center">
                  <i className="pi pi-file-pdf mr-2"></i>
                  <b>Anexos</b>
                </div>
              </Divider>
              <div className="column" style={{}}>
                <div className="input-box">
                  <label htmlFor="pdf" className="font-medium w-auto min-w-min">
                    Subir Anexos Extra:
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
                  <th className="trFichas">Nº de Registro </th>
                  <th className="trFichas">Cedula</th>
                  <th className="trFichas">Nombres</th>
                  <th className="trFichas">Apellidos</th>
                  <th className="trFichas">Fecha de Desvinculación </th>
                  <th className="trFichas">Motivo</th>
                  <th className="trFichas">Anexo extra</th>
                  <th className="trFichas">Editar</th>
                  <th className="trFichas">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {contra1.map((cargaF) => (
                  <tr
                    className="text-center"
                    key={cargaF.idFichaDesvinculacion?.toString()}
                  >
                    <td className="tdFichas">{cargaF.idFichaDesvinculacion}</td>
                    <td className="tdFichas">
                      {cargaF.fichaPersonal?.ciPasaporte}
                    </td>
                    <td className="tdFichas">
                      {cargaF.fichaPersonal?.nombres}
                    </td>
                    <td className="tdFichas">
                      {cargaF.fichaPersonal?.apellidos}{" "}
                    </td>
                    <td className="tdFichas">
                      {cargaF.fechaDesvinculacion && (
                        <span>
                          {cargaF.fechaDesvinculacion.split("-")[2]}-
                          {cargaF.fechaDesvinculacion.split("-")[1]}-
                          {cargaF.fechaDesvinculacion.split("-")[0]}
                        </span>
                      )}
                    </td>
                    <td className="tdFichas">{cargaF.motivo}</td>
                    <td className="tdFichas">
                      <ButtonPDF
                        base64={cargaF.anexosExtras}
                        filename={`AnexoExtra_${cargaF.fichaPersonal?.apellidos}_${cargaF.fichaPersonal?.nombres}`}
                        tipo={`Anexo Extra: ${cargaF.fichaPersonal?.apellidos} ${cargaF.fichaPersonal?.nombres}`}
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
                          handleEdit(cargaF.idFichaDesvinculacion?.valueOf())
                        }
                      // Agrega el evento onClick para la operación de editar
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
                          handleDelete(cargaF.idFichaDesvinculacion?.valueOf())
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
      </Fieldset>
    </>
  );
}

export default FichaDesvinculacion;
