import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import cardHeader from "../../shared/CardHeader";
import { IDocente } from "../../interfaces/IDocente";
import { DocenteService } from "../../services/DocenteService";
import { PersonaService } from "../../services/PersonaService";
import swal from "sweetalert";

function DocenteContext() {


  const [docentes, setDocentes] = useState<IDocente[]>([]);
  const [formData, setFormData] = useState<IDocente>({
    idDocente: 0,
    tituloDocente: "",
    materiaDocente: "",
    persona: null,
  });

  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<number | undefined>(undefined);
  const docenteService = new DocenteService();
  const [dataLoaded, setDataLoaded] = useState(false);
  const personaService = new PersonaService();

  const loadData = () => {
    docenteService
      .getAll()
      .then((data) => {
        setDocentes(data);
        setDataLoaded(true);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePersonaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.persona) {
      swal(
        "Advertencia",
        "Por favor, complete los datos de la persona",
        "warning"
      );
      return;
    }

    personaService
      .save(formData.persona)
      .then((personaResponse) => {
        // Aquí obtienes el ID de la persona recién creada o actualizada
        const personaId = personaResponse.idPersona;

        // Ahora puedes actualizar los datos del docente con el ID de la persona relacionada
        const docenteData = { ...formData, persona: { idPersona: personaId } };
        if (
          !formData.tituloDocente ||
          !formData.materiaDocente ||
          !formData.persona
        ) {
          swal(
            "Advertencia",
            "Por favor, complete todos los campos",
            "warning"
          );
          return;
        }
        // Luego, guarda los datos del docente
        docenteService
          .save(docenteData)
          .then((docenteResponse) => {
            loadData();
            resetForm();
            swal("Docente", "Datos Guardados Correctamente", "success");
          })
          .catch((docenteError) => {
            console.error(
              "Error al enviar el formulario del docente:",
              docenteError
            );
          });
      })
      .catch((personaError) => {
        console.error(
          "Error al enviar el formulario de la persona:",
          personaError
        );
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
          // Primero, obtenemos el docente que queremos eliminar
          const docenteToDelete = docentes.find(
            (docente) => docente.idDocente === id
          );

          if (!docenteToDelete) {
            // Docente no encontrado, maneja el error según sea necesario
            console.error("Docente no encontrado");
            return;
          }

          if (docenteToDelete.persona) {
            // Si el docente está relacionado con una persona, verificamos si otros docentes también la tienen relacionada
            const isPersonaUsed = docentes.some((docente) =>
              docente.persona?.idPersona === docenteToDelete.persona?.idPersona
            );

            if (!isPersonaUsed) {
              // Si la persona no está relacionada con otros docentes, la eliminamos
              const personaId = docenteToDelete.persona.idPersona;
              if (personaId !== undefined) {
                personaService
                  .delete(personaId)
                  .then(() => {
                    // Luego, eliminamos el docente
                    docenteService
                      .delete(id)
                      .then(() => {
                        // Actualizamos la lista de docentes excluyendo el docente eliminado
                        setDocentes(docentes.filter((docente) => docente.idDocente !== id));
                        swal("Eliminado", "El registro ha sido eliminado correctamente", "error");
                      })
                      .catch((error) => {
                        console.error("Error al eliminar el registro:", error);
                        swal("Error", "Ha ocurrido un error al eliminar el registro", "error");
                      });
                  })
                  .catch((error) => {
                    console.error("Error al eliminar la persona:", error);
                    swal("Error", "Ha ocurrido un error al eliminar la persona", "error");
                  });
              } else {
                // Manejar el caso en el que personaId sea undefined según sea necesario
                console.error("ID de persona indefinido");
              }
            } else {
              // Si la persona está relacionada con otros docentes, solo eliminamos el docente
              docenteService
                .delete(id)
                .then(() => {
                  // Actualizamos la lista de docentes excluyendo el docente eliminado
                  setDocentes(docentes.filter((docente) => docente.idDocente !== id));
                  swal("Eliminado", "El registro ha sido eliminado correctamente", "error");
                })
                .catch((error) => {
                  console.error("Error al eliminar el registro:", error);
                  swal("Error", "Ha ocurrido un error al eliminar el registro", "error");
                });
            }
          } else {
            // Si el docente no está relacionado con una persona, simplemente eliminamos el docente
            docenteService
              .delete(id)
              .then(() => {
                // Actualizamos la lista de docentes excluyendo el docente eliminado
                setDocentes(docentes.filter((docente) => docente.idDocente !== id));
                swal("Eliminado", "El registro ha sido eliminado correctamente", "error");
              })
              .catch((error) => {
                console.error("Error al eliminar el registro:", error);
                swal("Error", "Ha ocurrido un error al eliminar el registro", "error");
              });
          }
        }
      });
    }
  };


  const handleEdit = (id: number | undefined) => {
    if (id !== undefined) {
      const editItem = docentes.find((docente) => docente.idDocente === id);
      if (editItem) {
        setEditMode(true);
        setEditItemId(id);

        // Verifica si hay una persona relacionada y carga sus datos si existe
        if (editItem.persona) {
          setFormData({
            ...editItem,
            persona: {
              ...editItem.persona,
              ciPasaporte: editItem.persona.ciPasaporte ?? "",
              apellidosPersona: editItem.persona.apellidosPersona ?? "",
              nombresPersona: editItem.persona.nombresPersona ?? "",
            },
          });
        } else {
          setFormData(editItem);
        }
      }
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (editItemId !== undefined) {
      // Verifica si existe una persona relacionada
      if (formData.persona) {
        // Verifica si existe un ID de persona antes de intentar actualizar
        if (formData.persona.idPersona !== undefined) {
          personaService
            .update(formData.persona.idPersona, formData.persona)
            .then((personaResponse) => {
              // Después de actualizar la persona, actualiza los datos del docente
              docenteService
                .update(editItemId, formData)
                .then((response) => {
                  swal({
                    title: "Docente",
                    text: "Datos actualizados correctamente",
                    icon: "success",
                  });
                  loadData();
                  resetForm();
                })
                .catch((error) => {
                  console.error(
                    "Error al actualizar el formulario del docente:",
                    error
                  );
                });
            })
            .catch((personaError) => {
              console.error(
                "Error al actualizar el formulario de la persona:",
                personaError
              );
            });
        } else {
          // Si formData.persona.idPersona es undefined, muestra un error o maneja la situación adecuadamente
          console.error("ID de persona indefinido en formData");
        }
      } else {
        // Si no hay una persona relacionada, simplemente actualiza los datos del docente
        docenteService
          .update(editItemId, formData)
          .then((response) => {
            swal({
              title: "Docentes",
              text: "Datos actualizados correctamente",
              icon: "success",
            });
            loadData();
            resetForm();
          })
          .catch((error) => {
            console.error(
              "Error al actualizar el formulario del docente:",
              error
            );
          });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      idDocente: 0,
      tituloDocente: "",
      materiaDocente: "",
      persona: null,
    });
    setEditMode(false);
    setEditItemId(undefined);
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
            Docente
          </h1>
        </div>

        <div className="flex justify-content-center flex-wrap">
          <form
            onSubmit={editMode ? handleUpdate : handlePersonaSubmit}
            encType="multipart/form-data"
          >
            <div className="flex flex-wrap flex-row">
              <div className="flex align-items-center justify-content-center">
                <div className="flex flex-column flex-wrap gap-4">
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="nombre"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Nombres:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese los Nombres"
                      id="nombre"
                      name="nombre"
                      style={{ width: "221px" }}
                      // onChange={(e) =>
                      //   setFormData({
                      //     ...formData,
                      //     persona: {
                      //       ...formData.persona,
                      //       nombresPersona: e.currentTarget.value,
                      //     },
                      //   })
                      // }
                      value={formData.persona?.nombresPersona ?? ""}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="apellidos"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Apellidos:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese los Apellidos"
                      id="apellidos"
                      name="apellidos"
                      style={{ width: "221px" }}
                      // onChange={(e) =>
                      //   setFormData({
                      //     ...formData,
                      //     persona: {
                      //       ...formData.persona,
                      //       apellidosPersona: e.currentTarget.value,
                      //     },
                      //   })
                      // }
                      value={formData.persona?.apellidosPersona ?? ""}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="cedula"
                      className="text-3xl font-medium w-auto min-w-min"
                    >
                      Cédula:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese la Cédula"
                      id="cedula"
                      name="cedula"
                      style={{ width: "221px" }}
                      // onChange={(e) =>
                      //   setFormData({
                      //     ...formData,
                      //     persona: {
                      //       ...formData.persona,
                      //       ciPasaporte: e.currentTarget.value,
                      //     },
                      //   })
                      // }
                      value={formData.persona?.ciPasaporte ?? ""}
                    />
                  </div>
                </div>
                <div
                  className="flex flex-column flex-wrap gap-4"
                  style={{ marginTop: "-50px", marginLeft: "50px" }}
                >
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="titulo"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginLeft: "25px" }}
                    >
                      Usuario:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese el Titulo"
                      id="titulo"
                      name="titulo"
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tituloDocente: e.currentTarget.value,
                        })
                      }
                      value={formData.tituloDocente}
                    />
                  </div>

                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="materia"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
                    >
                      Contraseña:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese la Materia"
                      id="materia"
                      name="materia"
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          materiaDocente: e.currentTarget.value,
                        })
                      }
                      value={formData.materiaDocente}
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
        <div style={{ minWidth: "40rem", overflowX: "auto" }} className="table-container">
          <table
            style={{ minWidth: "40rem" }}
            className="mt-4  w-full h-full text-3xl font-large"
          >
            <thead>
              <tr style={{ backgroundColor: "#871b1b", color: "white" }}>
                <th>ID Docente</th>
                <th>Cédula</th>
                <th>Nombre</th>
                <th>Titulo </th>
                <th>Materia</th>
                <th>Operaciones</th>
              </tr>
            </thead>
            <tbody>
              {docentes.map((docente) => (
                <tr className="text-center" key={docente.idDocente?.toString()}>
                  <td>{docente.idDocente}</td>
                  <td>{docente.persona?.ciPasaporte}</td>
                  <td>
                    {docente.persona?.nombresPersona +
                      " " +
                      docente.persona?.apellidosPersona}
                  </td>
                  <td>{docente.tituloDocente}</td>
                  <td>{docente.materiaDocente}</td>

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
                      onClick={() => handleEdit(docente.idDocente?.valueOf())}
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
                      onClick={() => handleDelete(docente.idDocente?.valueOf())}
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

export default DocenteContext;
