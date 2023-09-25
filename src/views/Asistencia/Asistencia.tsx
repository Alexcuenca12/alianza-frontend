import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import { InputTextarea } from "primereact/inputtextarea";
import swal from "sweetalert";
import { CursoService } from "../../services/CursoService";
import { DocenteService } from "../../services/DocenteService";
import { FichaInscripcionService } from "../../services/FichaInscripcionService";
import { AsistenciaService } from "../../services/AsistenciaService";
import { IDocente } from "../../interfaces/IDocente";
import { ICurso } from "../../interfaces/ICurso";
import { IFichaInscripcion } from "../../interfaces/IFichaInscripcion";
import { IAsistencia } from "../../interfaces/IAsistencia";
import CardHeader from "../../shared/CardHeader";

function Asistencia() {
  const [docentes, setDocentes] = useState<IDocente[]>([]);
  const [selectedDocente, setSelectedDocente] = useState<IDocente | null>(null);
  const [selectedDocenteId, setSelectedDocenteId] = useState<
    number | undefined
  >(undefined);

  const [selectedCurso, setSelectedCurso] = useState<ICurso | null>(null);
  const [selectedCursoId, setSelectedCursoId] = useState<number | undefined>(
    undefined
  );

  const [fechaActual] = useState(new Date());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(fechaActual);

  const [fichas, setFichas] = useState<IFichaInscripcion[]>([]);
  const [selectedFichasId, setSelectedFichasId] = useState<number | undefined>(
    undefined
  );

  const [editMode, setEditMode] = useState(false);

  const [asistencia, setAsistencia] = useState<IAsistencia[]>([]);
  const [formData, setFormData] = useState<IAsistencia>({
    idAsistencia: 0,
    fechaAsistencia: "",
    observacionesAsistencia: "",
    estadoAsistencia: false,
    fichaInscripcion: null,
    curso: null,
  });

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [editItemId, setEditItemId] = useState<number | undefined>(undefined);

  const [cursosPorDocente, setCursosPorDocente] = useState<ICurso[]>([]);

  const opcionesDocente = docentes.map((docente) => ({
    label: `${docente.persona?.nombresPersona}  ${docente.persona?.apellidosPersona}`,
    value: docente.idDocente,
  }));

  const opcionesCurso = cursosPorDocente.map((curso) => ({
    label: `${curso.nombreCurso}`,
    value: curso.idCurso,
  }));

  const docenteService = new DocenteService();
  const cursoService = new CursoService();
  const fichaService = new FichaInscripcionService();
  const asistenciaService = new AsistenciaService();

  useEffect(() => {
    const loadDocentes = () => {
      docenteService
        .getAll()
        .then((data) => {
          setDocentes(data);
          setSelectedDocente(null);
        })
        .catch((error) => {
          console.error("Error al obtener los datos:", error);
        });
    };
    loadDocentes();
  }, []);

  useEffect(() => {
    const loadCursosPorDocente = () => {
      if (selectedDocenteId !== undefined) {
        cursoService
          .getAllDocente(selectedDocenteId)
          .then((data) => {
            setCursosPorDocente(data);
            setSelectedCurso(null);
          })
          .catch((error) => {
            console.error("Error al obtener los datos:", error);
          });
      }
    };

    loadCursosPorDocente();
  }, [selectedDocenteId]);

  const loadData = () => {
    if (selectedCursoId !== undefined) {
      fichaService
        .getByID(selectedCursoId)
        .then((data) => {
          setFichas(data);

          if (data.length > 0) {
            setSelectedFichasId(data[0].idFichaInscripcion);
          } else {
            setSelectedFichasId(undefined);
          }

          setIsDataLoaded(true);
        })
        .catch((error) => {
          console.error("Error al obtener los datos:", error);
        });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fichaInscripcionPersistente = fichas.find(
      (ficha) => ficha.idFichaInscripcion === selectedFichasId
    );

    if (!fichaInscripcionPersistente) {
      console.error(
        "No se encontró la FichaInscripcion persistente correspondiente a selectedFichasId"
      );
      return;
    }

    const updatedFormData = {
      ...formData,
      fichaInscripcion: fichaInscripcionPersistente,
    };

    asistenciaService
      .save(updatedFormData)
      .then((response) => {
        resetForm();
        swal("Publicacion", "Datos Guardados Correctamente", "success");

        asistenciaService
          .getAll()
          .then((data) => {
            setAsistencia(data);
            resetForm();
          })
          .catch((error) => {
            console.error("Error al obtener los datos:", error);
          });
      })
      .catch((error) => {
        console.error("Error al enviar el formulario:", error);
      });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItemId !== undefined) {
      asistenciaService
        .update(Number(editItemId), formData as IAsistencia)
        .then((response) => {
          swal({
            title: "Asistencia",
            text: "Datos actualizados correctamente",
            icon: "success",
          });
          setFormData({ ...formData });
          setAsistencia(
            asistencia.map((asiste) =>
              asiste.idAsistencia === editItemId ? response : asiste
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
      fechaAsistencia: "",
      observacionesAsistencia: "",
      estadoAsistencia: false,
      fichaInscripcion: null,
      curso: null,
    });
  };

  return (
    <Fieldset className="fgrid col-fixed">
      <Card
        header={CardHeader}
        className="border-solid border-red-800 border-3 flex-1 flex-wrap"
        style={{ width: "90%", marginLeft: "7%", height: "100%" }}
      >
        <div
          className="h1-rem"
          style={{ marginLeft: "45%", marginBottom: "20px" }}
        >
          <h1 className="text-5xl font-smibold lg:md-2  w-full h-full max-w-full max-h-full min-w-min">
            Asistencia
          </h1>
        </div>

        <div className="flex justify-content-center flex-wrap">
          <form onSubmit={editMode ? handleUpdate : handleSubmit}>
            <div className="flex flex-wrap flex-row">
              <div className="flex align-items-center justify-content-center">
                <Fieldset
                  legend="Cursos"
                  style={{
                    width: "1250px",
                    marginBottom: "35px",
                    position: "relative",
                    marginLeft: "2%",
                  }}
                >
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="docente"
                      className="text-3xl font-medium w-auto min-w-min"
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
                          setSelectedDocenteId(selectedDocente.idDocente);
                        } else {
                          setSelectedDocente(null);
                          setSelectedDocenteId(undefined);
                        }
                      }}
                      value={selectedDocente?.idDocente}
                      placeholder="Seleccione al Docente"
                      style={{ width: "250px" }}
                    />
                    <label
                      htmlFor="curso"
                      className="text-3xl font-medium w-auto min-w-min"
                    >
                      Curso:
                    </label>
                    <Dropdown
                      id="curso"
                      name="curso"
                      optionLabel="label"
                      optionValue="value"
                      options={opcionesCurso}
                      placeholder="Seleccione el Curso"
                      style={{ width: "250px" }}
                      onChange={(e) => {
                        const selectedCurso = cursosPorDocente.find(
                          (curso) => curso.idCurso === e.value
                        );

                        if (selectedCurso) {
                          setSelectedCurso(selectedCurso);
                          setSelectedCursoId(selectedCurso.idCurso);
                          setFormData({
                            ...formData,
                            curso: selectedCurso,
                          });
                        } else {
                          setSelectedCurso(null);
                          setSelectedCursoId(undefined);
                          setFormData({
                            ...formData,
                            curso: null,
                          });
                        }
                      }}
                      value={selectedCurso?.idCurso}
                    />

                    <label
                      htmlFor="fechaFin"
                      className="text-3xl font-medium w-auto min-w-min"
                    >
                      Fecha:
                    </label>
                    <Calendar
                      className="text-2xl"
                      id="fechaFin"
                      name="fechaFin"
                      placeholder="Ingrese la Fecha de Asistencia"
                      required
                      dateFormat="yy-mm-dd"
                      showIcon
                      maxDate={fechaActual}
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
                            fechaAsistencia: formattedDate,
                          });
                        } else {
                          setFormData({
                            ...formData,
                            fechaAsistencia: "",
                          });
                        }
                      }}
                      value={fechaSeleccionada}
                      style={{ width: "250px", height: "40px" }}
                    />
                    <div
                      className="flex align-items-c


enter justify-content-center w-auto min-w-min"
                    >
                      <Button
                        type="button"
                        label="Cargar Datos"
                        className="w-full text-3xl min-w-min"
                        rounded
                        onClick={loadData}
                      />
                    </div>
                  </div>
                </Fieldset>
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
                    onClick={editMode ? handleUpdate : handleSubmit}
                    className="w-full text-3xl min-w-min "
                    rounded
                  />
                </div>
                <div className="flex align-items-center justify-content-center w-auto min-w-min">
                  <Button
                    type="button"
                    label="Cancelar"
                    style={{ marginTop: "25px" }}
                    className="w-full text-3xl min-w-min"
                    rounded
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
        <table
          style={{ minWidth: "40rem" }}
          className="mt-4 w-full h-full text-3xl font-large"
        >
          <thead>
            <tr style={{ backgroundColor: "#871b1b", color: "white" }}>
              <th>Cédula</th>
              <th>Estudiantes</th>
              <th>Asistencia</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {isDataLoaded &&
              fichas.map((ficha) => (
                <tr
                  className="text-center"
                  key={ficha.idFichaInscripcion?.toString()}
                >
                  <td>{ficha.fichaPersonal?.ciIdentidad}</td>
                  <td>
                    {ficha.fichaPersonal?.nombres}{" "}
                    {ficha.fichaPersonal?.apellidos}
                  </td>
                  <td>
                    <div className="gender-option">
                      <div className="gender">
                        <div className="mydict">
                          <div>
                            <label style={{ marginLeft: "30%" }}>
                              <input
                                className="input"
                                type="radio"
                                id="genSi"
                                name="si"
                                value="si"
                                checked={formData.estadoAsistencia}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    estadoAsistencia: e.target.value === "si",
                                  })
                                }
                              />
                              <span>Si</span>
                            </label>
                            <label>
                              <input
                                className="input"
                                type="radio"
                                id="genNo"
                                name="no"
                                value="no"
                                checked={!formData.estadoAsistencia}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    estadoAsistencia: e.target.value === "si",
                                  })
                                }
                              />
                              <span>No</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <InputTextarea
                      className="text-2xl"
                      autoResize
                      placeholder="Ingrese alguna observación en caso de ser necesaria"
                      id="tipoDiscapacidad"
                      name="tipoDiscapacidad"
                      style={{ width: "221px" }}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          observacionesAsistencia: e.currentTarget.value,
                        })
                      }
                      value={formData.observacionesAsistencia}
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

export default Asistencia;
