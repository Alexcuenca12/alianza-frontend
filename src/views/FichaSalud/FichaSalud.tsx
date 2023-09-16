import React, { useEffect, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import { InputTextarea } from "primereact/inputtextarea";

import cardHeader from "../../shared/CardHeader";
import { IFichaSalud } from "../../interfaces/IFichaSalud";
import { IFichaPersonal } from "../../interfaces/IFichaPersonal";
import { FichaPersonalService } from "../../services/FichaPersonalService";
import { FichaSaludService } from "../../services/FichaSaludService";
import swal from "sweetalert";

function FichaSaludContext() {
  const [idPersona, setIDPersona] = useState<number>(0);

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
  const [contra1, setcontra1] = useState<IFichaSalud[]>([]);
  const [formData, setFormData] = useState<IFichaSalud>({
    idFichaSalud: 0,
    condicionesMedicas: "",
    pesoFichaSalud: 0,
    tallaFichaSalud: 0,
    discapacidadNNAFichaSalud: false,
    tipoDiscapacidadFichaSalud: "",
    porcentajeDiscapacidadFichaSalud: 0,
    enfermedadesPrevalentesFichaSalud: "",
    fichaPersonal: null,
  });

  const personalService = new FichaPersonalService();
  const [cedula, setCedula] = useState<string>("");

  const buscarPorCedula = () => {
    if (cedula.trim() === "") {
      swal("Advertencia", "Ingrese una cédula válida para buscar", "warning");
      return;
    }
    personalService
      .getByPersona(cedula)
      .then((data) => {
        setFormDataPersona(data);
        setIDPersona(data.idFichaPersonal);
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
      !formData.condicionesMedicas ||
      !formData.pesoFichaSalud ||
      !formData.tallaFichaSalud ||
      !formData.tipoDiscapacidadFichaSalud ||
      !formData.enfermedadesPrevalentesFichaSalud
    ) {
      swal("Advertencia", "Por favor, complete todos los campos", "warning");
      return;
    }
    saludService
      .save(formData)
      .then((response) => {
        resetForm();
        swal("Publicacion", "Datos Guardados Correctamente", "success");

        saludService
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
      const editItem = contra1.find((contra) => contra.idFichaSalud === id);
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
      saludService
        .update(Number(editItemId), formData as IFichaSalud)
        .then((response) => {
          swal({
            title: "Publicaciones",
            text: "Datos actualizados correctamente",
            icon: "success",
          });
          setFormData({
            condicionesMedicas: "",
            pesoFichaSalud: 0,
            tallaFichaSalud: 0,
            discapacidadNNAFichaSalud: false,
            tipoDiscapacidadFichaSalud: "",
            porcentajeDiscapacidadFichaSalud: 0,
            enfermedadesPrevalentesFichaSalud: "",
            fichaPersonal: null,
          });
          setcontra1(
            contra1.map((contra) =>
              contra.idFichaSalud === editItemId ? response : contra
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
      condicionesMedicas: "",
      pesoFichaSalud: 0,
      tallaFichaSalud: 0,
      discapacidadNNAFichaSalud: false,
      tipoDiscapacidadFichaSalud: "",
      porcentajeDiscapacidadFichaSalud: 0,
      enfermedadesPrevalentesFichaSalud: "",
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
            Ficha Médica
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
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <div className="flex align-items-center justify-content-center w-auto min-w-min">
                      <InputText
                        className="text-2xl"
                        placeholder="Ingrese la cédula"
                        id="cedula"
                        name="cedula"
                        style={{ width: "221px" }}
                        onChange={(e) => setCedula(e.currentTarget.value)}
                        value={cedula}
                      />
                    </div>
                    <div className="flex align-items-center justify-content-center w-auto min-w-min">
                      <Button
                        type="button"
                        label="Buscar por Cédula"
                        className="w-full text-3xl min-w-min"
                        rounded
                        onClick={buscarPorCedula}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="condiciones"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Condiciones Médicas:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese las Condiciones Médicas"
                      id="condiciones"
                      name="condiciones"
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condicionesMedicas: e.currentTarget.value,
                        })
                      }
                      value={formData.condicionesMedicas}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="condiciones"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Peso:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese las Condiciones Médicas"
                      id="peso"
                      name="peso"
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pesoFichaSalud: parseFloat(e.currentTarget.value),
                        })
                      }
                      value={formData.pesoFichaSalud.toString()}
                    />
                  </div>

                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="condiciones"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Talla:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese las Condiciones Médicas"
                      id="peso"
                      name="peso"
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tallaFichaSalud: parseFloat(e.currentTarget.value),
                        })
                      }
                      value={formData.tallaFichaSalud.toString()}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Discapacidad:
                    </label>
                    <div>
                      <input
                        type="radio"
                        id="discapacidadTrue"
                        name="discapacidad"
                        value="true"
                        checked={formData.discapacidadNNAFichaSalud === true}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            discapacidadNNAFichaSalud: true,
                          })
                        }
                      />
                      <label htmlFor="discapacidadTrue">Si</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        id="discapacidadFalse"
                        name="discapacidad"
                        value="false"
                        checked={formData.discapacidadNNAFichaSalud === false}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            discapacidadNNAFichaSalud: false,
                          })
                        }
                      />
                      <label htmlFor="discapacidadFalse">No</label>
                    </div>
                  </div>
                </div>
                <div
                  className="flex flex-column flex-wrap gap-4"
                  style={{ marginTop: "-25px", marginLeft: "25px" }}
                >
                  {" "}
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="doi"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
                    >
                      Persona:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="doi"
                      disabled
                      name="doi"
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormDataPersona({
                          ...formDataPersona,
                          nombres: e.currentTarget.value,
                        })
                      }
                      value={`${formDataPersona.nombres} ${formDataPersona.apellidos}`}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="tipoDiscapacidad"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
                    >
                      Tipo de Discapacidad:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese el Tipo de Discapacidad"
                      id="tipoDiscapacidad"
                      name="tipoDiscapacidad"
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipoDiscapacidadFichaSalud: e.currentTarget.value,
                        })
                      }
                      value={formData.tipoDiscapacidadFichaSalud}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="filiacion"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
                    >
                      Porcentaje de Discapacidad:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese la Asistencia"
                      id="filiacion"
                      name="filiacion"
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          porcentajeDiscapacidadFichaSalud: parseFloat(
                            e.currentTarget.value
                          ),
                        })
                      }
                      value={formData.porcentajeDiscapacidadFichaSalud.toString()}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="enfermedades"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
                    >
                      Enfermedades Prevalentes:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      placeholder="Ingrese las Enfermedades"
                      id="enfermedades"
                      name="enfermedades"
                      style={{ width: "221px" }}
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
                <th>Nº de Ficha</th>
                <th>Condiciones Médicas</th>
                <th>Peso </th>
                <th>Talla</th>
                <th>Discapacidad</th>
                <th>Porcentaje de Discapacidad</th>
                <th>Tipo de Discapacidad</th>
                <th>Enfermedades Prevalentes</th>
                <th>Operaciones</th>
              </tr>
            </thead>
            <tbody>
              {contra1.map((contrato) => (
                <tr
                  className="text-center"
                  key={contrato.idFichaSalud?.toString()}
                >
                  <td>{contrato.idFichaSalud}</td>
                  <td>{contrato.condicionesMedicas}</td>
                  <td>{contrato.pesoFichaSalud + "kg"}</td>
                  <td>{contrato.tallaFichaSalud + "cm"}</td>
                  <td>{contrato.discapacidadNNAFichaSalud ? "Si" : "No"}</td>
                  <td>{contrato.tipoDiscapacidadFichaSalud}</td>
                  <td>{contrato.porcentajeDiscapacidadFichaSalud + "%"}</td>
                  <td>{contrato.enfermedadesPrevalentesFichaSalud}</td>
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
                        handleEdit(contrato.idFichaSalud?.valueOf())
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
  );
}

export default FichaSaludContext;
