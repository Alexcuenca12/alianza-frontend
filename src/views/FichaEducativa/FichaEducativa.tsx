import React, { useEffect, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";
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

function FichaInscripcionContext() {
  const [idPersona, setIDPersona] = useState<number>(0);
  const personalService = new FichaPersonalService();

  const [cedula, setCedula] = useState<string>("");
  const [formDataPersona, setFormDataPersona] = useState<IFichaPersonal>({
    idFichaPersonal: 0,
    foto: "",
    apellidos: "",
    nombres: "",
    ciIdentidad: "",
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
  });
  const buscarPorCedula = () => {
    if (cedula.trim() === "") {
      swal("Advertencia", "Ingrese una cédula válida para buscar", "warning");
      return;
    }
    personalService
      .getByPersona(cedula)
      .then((data) => {
        console.log("p1", data);
        setFormDataPersona(data);
        console.log("p2", data);
        setIDPersona(data.idFichaPersonal);
        console.log("p3", data);
        setFormData({
          ...formData,
          fichaPersonal: {
            idFichaPersonal: data.idFichaPersonal,
          },
        });
      })
      .catch((error) => {
        console.error("Error al buscar por cédula:", error);
      });
  };

  const [contra1, setcontra1] = useState<IFichaEducativa[]>([]);
  const [formData, setFormData] = useState<IFichaEducativa>({
    idFichaEducativa: 0,
    centroEducativo: "",
    direccionEducativa: "",
    referenciaEducativa: "",
    jornadaEducativa: "",
    observacionesEducativa: "",
    gradoEducativo: "",
    fichaPersonal: null,
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
      !formData.centroEducativo ||
      !formData.direccionEducativa ||
      !formData.referenciaEducativa ||
      !formData.jornadaEducativa ||
      !formData.observacionesEducativa ||
      !formData.gradoEducativo
    ) {
      swal("Advertencia", "Por favor, complete todos los campos", "warning");
      return;
    }

    educaService
      .save(formData)
      .then((response) => {
        resetForm();
        swal("Publicacion", "Datos Guardados Correctamente", "success");

        educaService
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
      const editItem = contra1.find((contra) => contra.idFichaEducativa === id);
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
      educaService
        .update(Number(editItemId), formData as IFichaEducativa)
        .then((response) => {
          swal({
            title: "Publicaciones",
            text: "Datos actualizados correctamente",
            icon: "success",
          });
          setFormData({
            centroEducativo: "",
            direccionEducativa: "",
            referenciaEducativa: "",
            jornadaEducativa: "",
            observacionesEducativa: "",
            gradoEducativo: "",
            fichaPersonal: null,
          });
          setcontra1(
            contra1.map((contra) =>
              contra.idFichaEducativa === editItemId ? response : contra
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
      centroEducativo: "",
      direccionEducativa: "",
      referenciaEducativa: "",
      jornadaEducativa: "",
      observacionesEducativa: "",
      gradoEducativo: "",
      fichaPersonal: null,
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
        style={{ width: "90%", marginLeft: "7%", height: "100%" }}
      >
        <div
          className="h1-rem"
          style={{ marginLeft: "40%", marginBottom: "20px" }}
        >
          <h1 className="text-5xl font-smibold lg:md-2  w-full h-full max-w-full max-h-full min-w-min">
            Ficha Educativa
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
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="inicio"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
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
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="tiempo_dedicacion"
                      className="text-3xl font-medium w-auto min-w-min"
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
                <div
                  className="flex flex-column flex-wrap gap-4"
                  style={{ marginTop: "5px", marginLeft: "25px" }}
                >
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="doi"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
                    >
                      Jornada de Estudio:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese la Jornada de Estudio"
                      id="doi"
                      name="doi"
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          jornadaEducativa: e.currentTarget.value,
                        })
                      }
                      value={formData.jornadaEducativa}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="filiacion"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
                    >
                      Observaciones:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese las Observaciones"
                      id="filiacion"
                      name="filiacion"
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          observacionesEducativa: e.currentTarget.value,
                        })
                      }
                      value={formData.observacionesEducativa}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <div className="flex flex-wrap w-full h-full justify-content-between">
                      <label
                        htmlFor="tiempo_dedicacion"
                        className="text-3xl font-medium w-auto min-w-min"
                        style={{ marginRight: "20px", marginLeft: "25px" }}
                      >
                        Grado Actual:
                      </label>
                      <InputText
                        className="text-2xl"
                        placeholder="Ingrese el Grado"
                        id="doi"
                        name="doi"
                        style={{ width: "221px" }}
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
                  key={contrato.idFichaEducativa?.toString()}
                >
                  <td>{contrato.idFichaEducativa}</td>
                  <td>{contrato.centroEducativo}</td>
                  <td>{contrato.direccionEducativa}</td>
                  <td>{contrato.referenciaEducativa}</td>
                  <td>{contrato.jornadaEducativa}</td>
                  <td>{contrato.observacionesEducativa}</td>
                  <td>{contrato.gradoEducativo}</td>
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
                        handleEdit(contrato.idFichaEducativa?.valueOf())
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
  );
}

export default FichaInscripcionContext;
