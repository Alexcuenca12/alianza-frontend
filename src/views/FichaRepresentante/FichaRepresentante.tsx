import React, { useEffect, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import cardHeader from "../../shared/CardHeader";
import { Divider } from "primereact/divider";
import { IFichaRepresentante } from "../../interfaces/IFichaRepresentante";
import { FichaRepresentanteService } from "../../services/FichaRepresentanteService";
import swal from "sweetalert";
import { InputTextarea } from "primereact/inputtextarea";

function FichaInscripcionContext() {
  //Session Storage
  /*const userData = sessionStorage.getItem("user");
  const userObj = JSON.parse(userData || "{}");
  const idPersona = userObj.id;*/

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

    if (
      !formData.nombresRepre ||
      !formData.apellidosRepre ||
      !formData.cedulaRepre ||
      !formData.contactoRepre ||
      !formData.contactoEmergenciaRepre ||
      !formData.ocupacionPrimariaRepre ||
      !formData.ocupacionSecundariaRepre ||
      !formData.lugarTrabajoRepre ||
      !formData.observacionesRepre ||
      !formData.nivelInstruccionRepre ||
      !formData.parentescoRepre ||
      !formData.fechaNacimientoRepre
    ) {
      swal("Advertencia", "Por favor, complete todos los campos", "warning");
      return;
    }

    repreService
      .save(formData)
      .then((response) => {
        resetForm();
        swal("Publicacion", "Datos Guardados Correctamente", "success");

        repreService
          .getAll()
          .then((data) => {
            setcontra1(data);
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
          });
          setcontra1(
            contra1.map((contra) =>
              contra.idFichaRepresentante === editItemId ? response : contra
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

        <div className="flex justify-content-center flex-wrap">
          <form
            onSubmit={editMode ? handleUpdate : handleSubmit}
            encType="multipart/form-data"
          >
            <div className="flex flex-wrap flex-row">
              <div className="flex align-items-center justify-content-center">
                <div className="flex flex-column flex-wrap gap-4">
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="centro"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Nombres Representante:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="inicio"
                      name="centro"
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
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="apellidosRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Apellidos Representante:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="apellidosRepre"
                      name="apellidosRepre"
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
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="cedulaRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                    >
                      Cédula del representate:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="cedulaRepre"
                      name="cedulaRepre"
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
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="parentescoRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Parentesco:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="parentescoRepre"
                      name="parentescoRepre"
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
                  className="flex flex-column flex-wrap gap-4"
                  style={{ marginTop: "5px", marginLeft: "25px" }}
                >
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="contactoRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
                    >
                      Nº de Contacto:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese el nº de Contacto"
                      id="contactoRepre"
                      name="contactoRepre"
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
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="contactoEmergenciaRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
                    >
                      Nº de Emergencia:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese el nº de emergencia"
                      id="contactoEmergenciaRepre"
                      name="contactoEmergenciaRepre"
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
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="tiempo_dedicacion"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
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
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="nivelInstruccionRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
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
                  <div
                    className="flex flex-wrap w-full h-full justify-content-between"
                    style={{
                      marginTop: "30px",
                    }}
                  >
                    <label
                      htmlFor="ocupacionPrimariaRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{
                        marginRight: "20px",
                        marginLeft: "25px",
                      }}
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
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="ocupacionSecundariaRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
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
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="lugarTrabajoRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
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
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="observacionesRepre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
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
                    onClick={resetForm}
                  />
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
