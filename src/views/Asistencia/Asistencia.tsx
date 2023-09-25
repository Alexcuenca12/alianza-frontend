import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import cardHeader from "../../shared/CardHeader";
import { CursoService } from "../../services/CursoService";
import { DocenteService } from "../../services/DocenteService";
import { FichaInscripcionService } from "../../services/FichaInscripcionService";
import { IDocente } from "../../interfaces/IDocente";
import { ICurso } from "../../interfaces/ICurso";
import { IFichaInscripcion } from "../../interfaces/IFichaInscripcion";
import { IAsistencia } from "../../interfaces/IAsistencia";
import { InputTextarea } from "primereact/inputtextarea";

function Asistencia() {
  const [docentes, setDocentes] = useState<IDocente[]>([]);
  const [selectedDocente, setSelectedDocente] = useState<IDocente | null>(null);

  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<ICurso | null>(null);
  const [selectedCursoId, setSelectedCursoId] = useState<number | undefined>(
    undefined
  );

    // Obtén la fecha actual
    const fechaActual = new Date();

    // Establece la fecha actual como estado inicial
    const [fechaSeleccionada, setFechaSeleccionada] = useState(fechaActual);

  const [fichas, setFichas] = useState<IFichaInscripcion[]>([]);

  const [formData, setFormData] = useState<IAsistencia>({
    idAsistencia: 0,
    fechaAsistencia: "",
    observacionesAsistencia: "",
    estadoAsistencia: false,
    fichaInscripcion: null,
    curso: null,
  });

  const [isDataLoaded, setIsDataLoaded] = useState(false); // Nuevo estado para indicar si se han cargado los datos

  const opcionesDocente = docentes.map((docente) => ({
    ...docente,
    etiqueta: `${docente.persona?.nombresPersona}  ${docente.persona?.apellidosPersona}`,
  }));

  const opcionesCurso = cursos.map((curso) => ({
    ...curso,
    etiqueta: `${curso.nombreCurso}`,
  }));

  const docenteService = new DocenteService();
  const cursoService = new CursoService();
  const fichaService = new FichaInscripcionService();

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
    const loadCursos = () => {
      cursoService
        .getAll()
        .then((data) => {
          setCursos(data);
          setSelectedCurso(null);
        })
        .catch((error) => {
          console.error("Error al obtener los datos:", error);
        });
    };
    loadCursos();
  }, []);

  const loadData = () => {
    if (selectedCursoId !== undefined) {
      fichaService
        .getByID(selectedCursoId) // Asegúrate de pasar el ID del docente
        .then((data) => {
          setFichas(data);
          setIsDataLoaded(true); // Marcar que los datos se han cargado
        })
        .catch((error) => {
          console.error("Error al obtener los datos:", error);
        });
    }
  };

  return (
    <Fieldset className="fgrid col-fixed">
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
            Asistencia
          </h1>
        </div>

        <div className="flex justify-content-center flex-wrap">
          <form encType="multipart/form-data">
            <div className="flex flex-wrap flex-row">
              <div className="flex align-items-center justify-content-center">
                <Fieldset
                  legend="Filtros"
                  style={{
                    width: "1150px",
                    marginBottom: "35px",
                    position: "relative",
                    marginLeft: "15%",
                  }}
                >
                  <div className="flex flex-wrap w-full h-full  justify-content-between">
                    <label
                      htmlFor="curso"
                      className="text-3xl font-medium w-auto min-w-min"
                    >
                      Curso:
                    </label>
                    <Dropdown
                      id="curso"
                      name="curso"
                      optionLabel="etiqueta"
                      optionValue="idCurso"
                      options={opcionesCurso}
                      placeholder="Seleccione el Curso"
                      style={{ width: "250px" }}
                      onChange={(e) => {
                        const selectedCurso = cursos.find(
                          (curso) => curso.idCurso === e.value
                        );

                        if (selectedCurso) {
                          setSelectedCurso(selectedCurso);
                          setSelectedCursoId(selectedCurso.idCurso); // Aquí guardamos el ID del curso seleccionado
                          setFormData({
                            ...formData,
                            curso: selectedCurso,
                          });
                        } else {
                          setSelectedCurso(null);
                          setSelectedCursoId(undefined); // Si no se selecciona ningún curso, establecemos el ID en null
                          setFormData({
                            ...formData,
                            curso: null,
                          });
                        }
                      }}
                      value={selectedCurso?.idCurso}
                    />

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
                        } else {
                          setSelectedDocente(null);
                        }
                      }}
                      value={selectedDocente?.idDocente}
                      optionLabel="etiqueta"
                      optionValue="idDocente"
                      placeholder="Seleccione al Docente"
                      style={{ width: "250px" }}
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
                      value={fechaSeleccionada}
                      style={{ width: "250px", height: "40px" }}
                    />
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
                    label={"Guardar"}
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
                <div className="flex align-items-center justify-content-center w-auto min-w-min">
                  <Button
                    type="button"
                    label="Cargar Datos"
                    style={{ marginTop: "25px" }}
                    className="w-full text-3xl min-w-min"
                    rounded
                    onClick={loadData} // Llamar a la función loadData en el clic del botón
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
