import React, { useEffect, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { Calendar } from "primereact/calendar";
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
import { IDocente } from "../../interfaces/IDocente";

function FichaInscripcionContext() {
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
        setIDPersona(data.idFichaPersonal);
        setBusquedaCedulaCompleta(true);
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
  const [selectedCurso, setSelectedCurso] = useState<string | null>(null);

  const personalService = new FichaPersonalService();
  const cursoService = new CursoService();
  const inscripService = new FichaInscripcionService();

  const [cedula, setCedula] = useState<string>("");
  const [selectedDias, setSelectedDias] = useState<string>("");
  const [busquedaCedulaCompleta, setBusquedaCedulaCompleta] = useState(false);

  const tipoProyectoOptions = [
    { label: "MIES", value: "MIES" },
    { label: "MUNICIPIO", value: "MUNICIPIO" },
    { label: "EMAC", value: "EMAC" },
  ];
  const jornadaOptions = [
    { label: "Matutina", value: "Matutina" },
    { label: "Vespertina", value: "Vespertina" },
  ];
  const diasOptions = [
    { label: "Lunes", value: "Lunes" },
    { label: "Martes", value: "Martes" },
    { label: "Miércoles", value: "Miércoles" },
    { label: "Jueves", value: "Jueves" },
    { label: "Viernes", value: "Viernes" },
    { label: "Sábado", value: "Sábado" },
  ];

  const [contra1, setcontra1] = useState<IFichaInscripcion[]>([]);
  const [cursos, setCursos] = useState<ICurso[]>([]);

  const [formData, setFormData] = useState<IFichaInscripcion>({
    idFichaInscripcion: 0,
    fechaIngresoInscrip: "",
    fechaEgreso: "",
    proyectoInscrip: "",
    situacionIngresoInscrip: "",
    asistenciaInscrip: "",
    jornadaAsistenciaInscrip: "",
    fichaPersonal: null,
    curso: null,
  });

  useEffect(() => {
    const loadCurso = () => {
      cursoService
        .getAll()
        .then((data) => {
          setCursos(data);
          setSelectedCurso(null);
          setDataLoaded(true); // Marcar los datos como cargados
        })
        .catch((error) => {
          console.error("Error al obtener los datos:", error);
        });
    };
    loadCurso();
  }, []);

  const loadData = () => {
    inscripService
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
    buscarPorCedula();
    console.log(idPersona);
    if (
      new Date(formData.fechaIngresoInscrip) >= new Date(formData.fechaEgreso)
    ) {
      swal(
        "Advertencia",
        "La Fecha de Ingreso debe ser menor que la Fecha de Egreso",
        "warning"
      );
      return;
    }

    if (
      !formData.asistenciaInscrip ||
      !formData.fechaEgreso ||
      !formData.jornadaAsistenciaInscrip ||
      !formData.proyectoInscrip ||
      !formData.situacionIngresoInscrip ||
      !formData.fechaIngresoInscrip
    ) {
      swal("Advertencia", "Por favor, complete todos los campos", "warning");
      return;
    }
    inscripService
      .save(formData)
      .then((response) => {
        resetForm();
        swal("Ficha Inscripción", "Datos Guardados Correctamente", "success");
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
        (contra) => contra.idFichaInscripcion === id
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

    // Validación: Verificar que la fecha de ingreso sea menor que la fecha de egreso
    if (
      new Date(formData.fechaIngresoInscrip) >= new Date(formData.fechaEgreso)
    ) {
      swal(
        "Advertencia",
        "La Fecha de Ingreso debe ser menor que la Fecha de Egreso",
        "warning"
      );
      return;
    }

    if (editItemId !== undefined) {
      inscripService
        .update(Number(editItemId), formData as IFichaInscripcion)
        .then((response) => {
          swal({
            title: "Publicaciones",
            text: "Datos actualizados correctamente",
            icon: "success",
          });
          setFormData({
            fechaIngresoInscrip: "",
            fechaEgreso: "",
            proyectoInscrip: "",
            situacionIngresoInscrip: "",
            asistenciaInscrip: "",
            jornadaAsistenciaInscrip: "",
            fichaPersonal: null,
            curso: null,
          });
          setcontra1(
            contra1.map((contra) =>
              contra.idFichaInscripcion === editItemId ? response : contra
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
      fechaIngresoInscrip: "",
      fechaEgreso: "",
      proyectoInscrip: "",
      situacionIngresoInscrip: "",
      asistenciaInscrip: "",
      jornadaAsistenciaInscrip: "",
      fichaPersonal: null,
      curso: null,
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
        style={{ width: "1350px", marginLeft: "90px", height: "688px" }}
      >
        <div
          className="h1-rem"
          style={{ marginLeft: "40%", marginBottom: "20px" }}
        >
          <h1 className="text-5xl font-smibold lg:md-2  w-full h-full max-w-full max-h-full min-w-min">
            Ficha de Inscripción
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
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="evento"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Fecha de Ingreso:
                    </label>
                    <Calendar
                      className="text-2xl"
                      id="inicio"
                      name="inicio"
                      placeholder="Ingrese la Fecha de Ingreso"
                      required
                      dateFormat="yy-mm-dd" // Cambiar el formato a ISO 8601
                      showIcon
                      maxDate={new Date()}
                      onChange={(e) => {
                        const selectedDate =
                          e.value instanceof Date ? e.value : null;
                        const formattedDate = selectedDate
                          ? selectedDate.toISOString().split("T")[0] // Formatear a ISO 8601
                          : "";
                        setFormData({
                          ...formData,
                          fechaIngresoInscrip: formattedDate,
                        });
                      }}
                      value={
                        formData.fechaIngresoInscrip
                          ? new Date(formData.fechaIngresoInscrip)
                          : null
                      }
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="inicio"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px" }}
                    >
                      Fecha de Egreso:
                    </label>

                    <Calendar
                      className="text-2xl"
                      id="inicio"
                      name="inicio"
                      required
                      placeholder="Ingrese la Fecha de Egreso"
                      dateFormat="yy-mm-dd" // Cambiar el formato a ISO 8601
                      showIcon
                      maxDate={new Date()}
                      onChange={(e) => {
                        const selectedDate =
                          e.value instanceof Date ? e.value : null;
                        const formattedDate = selectedDate
                          ? selectedDate.toISOString().split("T")[0] // Formatear a ISO 8601
                          : "";
                        setFormData({
                          ...formData,
                          fechaEgreso: formattedDate,
                        });
                      }}
                      value={
                        formData.fechaEgreso
                          ? new Date(formData.fechaEgreso)
                          : null
                      }
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="tiempo_dedicacion"
                      className="text-3xl font-medium w-auto min-w-min"
                    >
                      Tipo de Proyecto:
                    </label>
                    <Dropdown
                      className="text-2xl"
                      id="tiempo_dedicacion"
                      name="tiempo_dedicacion"
                      style={{ width: "220px" }}
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
                      htmlFor="doi"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
                    >
                      Situación de Ingreso:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese la Situacion de Ingreso"
                      id="doi"
                      name="doi"
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          situacionIngresoInscrip: e.currentTarget.value,
                        })
                      }
                      value={formData.situacionIngresoInscrip}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="filiacion"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
                    >
                      Asistencia:
                    </label>
                    <MultiSelect
                      className="text-2xl"
                      placeholder="Ingrese la Asistencia"
                      id="filiacion"
                      options={diasOptions}
                      display="chip"
                      optionLabel="value"
                      name="filiacion"
                      maxSelectedLabels={7}
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          asistenciaInscrip: e.value,
                        })
                      }
                      value={formData.asistenciaInscrip}
                    />
                  </div>
                  <div className="flex flex-wrap w-full h-full justify-content-between">
                    <label
                      htmlFor="tiempo_dedicacion"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
                    >
                      Jornada de Asistencia:
                    </label>
                    <Dropdown
                      className="text-2xl"
                      id="tiempo_dedicacion"
                      name="tiempo_dedicacion"
                      style={{ width: "220px", marginLeft: "15px" }}
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
                <div
                  className="flex flex-column flex-wrap gap-4"
                  style={{ marginTop: "-45px", marginLeft: "25px" }}
                >
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="curso"
                      className="text-3xl font-medium w-auto min-w-min"
                      style={{ marginRight: "20px", marginLeft: "25px" }}
                    >
                      Curso:
                    </label>
                    <Dropdown
                      id="curso"
                      name="curso"
                      style={{ width: "220px", marginLeft: "15px" }}
                      options={cursos}
                      onChange={(e) =>
                        setFormData({ ...formData, curso: e.value })
                      }
                      value={formData.curso} // Make sure this is correctly bound
                      optionLabel="nombreCurso"
                      optionValue="idCurso"
                      placeholder="Seleccione el Curso"
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
                <th>Nº de Publicacion</th>
                <th>Fecha de Ingreso</th>
                <th>Proyecto </th>
                <th>Situación de Ingreso</th>
                <th>Asistencia</th>
                <th>Jornada de Asistencia</th>
                <th>Fecha de Egreso </th>
                <th>Operaciones</th>
              </tr>
            </thead>
            <tbody>
              {contra1.map((contrato) => (
                <tr
                  className="text-center"
                  key={contrato.idFichaInscripcion?.toString()}
                >
                  <td>{contrato.idFichaInscripcion}</td>
                  <td>
                    {contrato.fechaIngresoInscrip
                      ? new Date(
                          contrato.fechaIngresoInscrip
                        ).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : ""}
                  </td>
                  <td>{contrato.proyectoInscrip}</td>
                  <td>{contrato.situacionIngresoInscrip}</td>
                  <td>{contrato.asistenciaInscrip}</td>
                  <td>{contrato.jornadaAsistenciaInscrip}</td>
                  <td>
                    {contrato.fechaEgreso
                      ? new Date(contrato.fechaEgreso).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          }
                        )
                      : ""}
                  </td>
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
                        handleEdit(contrato.idFichaInscripcion?.valueOf())
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
  );
}

export default FichaInscripcionContext;
