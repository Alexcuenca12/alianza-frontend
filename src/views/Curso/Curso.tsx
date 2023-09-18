import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { SelectButton } from "primereact/selectbutton";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import cardHeader from "../../shared/CardHeader";
import { ICurso } from "../../interfaces/ICurso";
import { IDocente } from "../../interfaces/IDocente";
import { IRangoEdad } from "../../interfaces/IRangoEdad";
import { CursoService } from "../../services/CursoService";
import { RangoEdadService } from "../../services/RangoEdadService";
import { DocenteService } from "../../services/DocenteService";
import swal from "sweetalert";

function Curso() {
  const options: string[] = ["Si", "No"];

  const [contra1, setContra1] = useState<ICurso[]>([]);
  const [formData, setFormData] = useState<ICurso>({
    nombreCurso: "",
    fechaInicio: "",
    fechaFin: "",
    estadoCurso: false,
    rangoEdad: null,
    docente: null,
  });

  const [docentes, setDocentes] = useState<IDocente[]>([]);
  const [rangos, setRangosEdad] = useState<IRangoEdad[]>([]);

  const opcionesRango = rangos.map((rango) => ({
    ...rango,
    etiquetaRango: `${rango.limInferior} - ${rango.limSuperior}`,
  }));

  const opcionesDocente = docentes.map((docente) => ({
    ...docente,
    etiqueta: `${docente.persona?.nombresPersona}  ${docente.persona?.apellidosPersona}`,
  }));

  const [dataLoaded, setDataLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<number | undefined>(undefined);

  const cursoService = new CursoService();
  const docenteService = new DocenteService();
  const rangoService = new RangoEdadService();

  const [selectedDocente, setSelectedDocente] = useState<IDocente | null>(null);
  const [selectedRango, setSelectedRango] = useState<IRangoEdad | null>(null);

  useEffect(() => {
    const loadDocentes = () => {
      docenteService
        .getAll()
        .then((data) => {
          setDocentes(data);
          setDataLoaded(true);
          setSelectedDocente(null);
        })
        .catch((error) => {
          console.error("Error al obtener los datos:", error);
        });
    };
    loadDocentes();
  }, []);

  useEffect(() => {
    const loadRango = () => {
      rangoService
        .getAll()
        .then((data) => {
          setRangosEdad(data);
          setDataLoaded(true);
          setSelectedRango(null);
        })
        .catch((error) => {
          console.error("Error al obtener los datos:", error);
        });
    };
    loadRango();
  }, []);

  const loadData = () => {
    cursoService
      .getAll()
      .then((data) => {
        setContra1(data);
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
      !formData.nombreCurso ||
      !formData.fechaInicio ||
      !formData.fechaFin ||
      !formData.estadoCurso ||
      !formData.docente || // Asegúrate de que docente esté seleccionado
      !formData.rangoEdad // Asegúrate de que rangoEdad esté seleccionado
    ) {
      swal("Advertencia", "Por favor, complete todos los campos", "warning");
      return;
    }

    cursoService
      .save(formData)
      .then((response) => {
        resetForm();
        swal("Publicacion", "Datos Guardados Correctamente", "success");

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
          cursoService
            .delete(id)
            .then(() => {
              setContra1(contra1.filter((curso) => curso.idCurso !== id));
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
      const editItem = contra1.find((curso) => curso.idCurso === id);
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
      cursoService
        .update(Number(editItemId), formData as ICurso)
        .then((response) => {
          swal({
            title: "Publicaciones",
            text: "Datos actualizados correctamente",
            icon: "success",
          });
          resetForm();
          loadData();
        })
        .catch((error) => {
          console.error("Error al actualizar el formulario:", error);
        });
    }
  };

  const resetForm = () => {
    setFormData({
      nombreCurso: "",
      fechaInicio: "",
      fechaFin: "",
      estadoCurso: false,
      rangoEdad: null,
      docente: null,
    });
    setEditMode(false);
    setEditItemId(undefined);
  };

  if (!dataLoaded) {
    return <div>Cargando datos...</div>;
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
          style={{ marginLeft: "45%", marginBottom: "20px" }}
        >
          <h1 className="text-5xl font-smibold lg:md-2  w-full h-full max-w-full max-h-full min-w-min">
            Curso
          </h1>
        </div>

        <div className="flex justify-content-center flex-wrap">
          <form
            onSubmit={editMode ? handleUpdate : handleSubmit}
            encType="multipart/form-data"
          >
            <div className="flex flex-wrap flex-row">
              <div className="flex align-items-center justify-content-center">
                <div
                  className="flex flex-column flex-wrap gap-4"
                  style={{ marginLeft: "50px" }}
                >
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="nomCurso"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Nombre Curso:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese el Nombre del Curso"
                      id="nomCurso"
                      name="nomCurso"
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nombreCurso: e.currentTarget.value,
                        })
                      }
                      value={formData.nombreCurso}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="fechaInicio"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Fecha de Inicio:
                    </label>
                    <Calendar
                      className="text-2xl"
                      id="fechaInicio"
                      name="fechaInicio"
                      placeholder="Ingrese la Fecha de Inicio"
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
                          fechaInicio: formattedDate,
                        });
                      }}
                      value={
                        formData.fechaInicio
                          ? new Date(formData.fechaInicio)
                          : null
                      }
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="fechaFin"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Fecha Fin:
                    </label>
                    <Calendar
                      className="text-2xl"
                      id="fechaFin"
                      name="fechaFin"
                      placeholder="Ingrese la Fecha de Fin"
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
                          fechaFin: formattedDate,
                        });
                      }}
                      value={
                        formData.fechaFin ? new Date(formData.fechaFin) : null
                      }
                    />
                  </div>
                </div>
                <div
                  className="flex flex-column flex-wrap gap-4"
                  style={{ marginLeft: "50px" }}
                >
                  <div
                    className="flex flex-wrap w-full h-full  justify-content-between"
                    style={{ marginTop: "25px" }}
                  >
                    <label
                      htmlFor="docente"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Docente:
                    </label>
                    <Dropdown
                      id="docente"
                      name="docente"
                      options={opcionesDocente}
                      onChange={(e) => {
                        const selectedDocente = docentes.find(
                          (docente) => docente.idDocente === e.value
                        );
                        if (selectedDocente) {
                          setSelectedDocente(selectedDocente);
                          setFormData({
                            ...formData,
                            docente: selectedDocente,
                          });
                        } else {
                          setSelectedDocente(null);
                          setFormData({ ...formData, docente: null });
                        }
                      }}
                      value={selectedDocente}
                      optionLabel="etiqueta"
                      optionValue="idDocente"
                      placeholder="Seleccione al Docente"
                      style={{ width: "250px" }}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="rangos"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Rango de Edad:
                    </label>
                    <Dropdown
                      id="rangos"
                      name="rangos"
                      options={opcionesRango}
                      onChange={(e) => {
                        const selectedRango = rangos.find(
                          (rango) => rango.idRangoEdad === e.value
                        );
                        setSelectedRango(selectedRango ?? null); // Actualiza selectedRango con el objeto de rango de edad o null
                        setFormData({
                          ...formData,
                          rangoEdad: selectedRango ?? null,
                        });
                      }}
                      value={selectedRango ?? null} // Utiliza selectedRango como valor seleccionado o null
                      optionLabel="etiquetaRango"
                      optionValue="idRangoEdad"
                      placeholder="Seleccione el Rango"
                      style={{ width: "250px" }}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="activo"
                      className="text-3xl font-medium w-auto min-w-min"
                    >
                      Curso Activo:
                    </label>
                    <SelectButton
                      className="text-2xl"
                      id="activo"
                      name="activo"
                      options={options}
                      style={{ width: "221px", marginTop: "10px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estadoCurso: e.value === "Si",
                        })
                      }
                      value={formData.estadoCurso ? "Si" : "No"}
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
                    style={{ marginTop: "25px" }}
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
                    style={{ marginTop: "25px" }}
                    className="w-full text-3xl min-w-min"
                    rounded
                    onClick={resetForm}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
        <table
          style={{ minWidth: "40rem" }}
          className="mt-4  w-full h-full text-3xl font-large"
        >
          <thead>
            <tr style={{ backgroundColor: "#871b1b", color: "white" }}>
              <th>Nº de Registro</th>
              <th>Curso</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
              <th>Operaciones</th>
            </tr>
          </thead>
          <tbody>
            {contra1.map((curso) => (
              <tr className="text-center" key={curso.idCurso?.toString()}>
                <td>{curso.idCurso}</td>
                <td>{curso.nombreCurso}</td>
                <td>
                  {curso.fechaInicio
                    ? new Date(curso.fechaInicio).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : ""}
                </td>
                <td>
                  {curso.fechaFin
                    ? new Date(curso.fechaFin).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : ""}
                </td>
                <td>{curso.estadoCurso ? "Activo" : "Inactivo"}</td>
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
                    onClick={() => handleEdit(curso.idCurso?.valueOf())}
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
                    onClick={() => handleDelete(curso.idCurso?.valueOf())}
                    // Agrega el evento onClick para la operación de eliminar
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Fieldset>
  );
}

export default Curso;
