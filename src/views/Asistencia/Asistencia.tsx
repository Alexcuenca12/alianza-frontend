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
import cardHeader from "../../shared/CardHeader";
import { Avatar } from 'primereact/avatar';
import toast, { Toaster } from "react-hot-toast";
import { Divider } from "primereact/divider";
import { ReportBar } from "../../common/ReportBar";
import { IExcelReportParams, IHeaderItem } from "../../interfaces/IExcelReportParams";
import '../../styles/FiltroFichas.css'
import '../../styles/Fichas.css'
import { UserService } from "../../services/UsuarioService";
import { IUsuario } from "../../interfaces/IUsuario";
import { SelectButton } from "primereact/selectbutton";
import { Nullable } from "primereact/ts-helpers";

function Asistencia() {

  const [editMode, setEditMode] = useState(false);

  const inscripcionService = new FichaInscripcionService();
  const cursoService = new CursoService();
  const asistenciaService = new AsistenciaService();
  const usuarioService = new UserService();


  // const [listAsistencia, setListAsistencia] = useState<IAsistencia[]>([]);
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [docentes, setDocentes] = useState<IUsuario[]>([]);
  const [listEstudiantes, setlListEstudiantes] = useState<IAsistencia[]>([]);

  const [docenteObj, setDocenteObj] = useState<IUsuario>();



  const [excelReportData, setExcelReportData] = useState<IExcelReportParams | null>(null);


  const [curso, setCurso] = useState<ICurso>({
    idCurso: 0,
    docente: null,
    fechaInicio: '',
    fechaRegistro: '',
    nombreCurso: '',
    rangoEdad: null,

  });

  const [fechaAsistencia, setFechaAsistencia] = useState<Nullable<string | Date | Date[]>>(new Date());

  useEffect(() => {
    loadDocentes();
  }, []);

  useEffect(() => {
    if (docenteObj?.idUsuario) {
      loadCurso(docenteObj?.idUsuario);
    } else {
      // setCursos([])
      cleanCurso()
      // setlListEstudiantes([])
    }
  }, [docenteObj]);

  // useEffect(() => {
  //   if (curso?.idCurso) {
  //     loadListEstudiantes(curso.idCurso);
  //   } else {
  //     setlListEstudiantes([]); // Limpia la lista si no hay un curso seleccionado
  //   }
  // }, [curso]);


  useEffect(() => {
    if (curso?.idCurso) {

      if (fechaAsistencia) {
        loadListEstudiantes(formatDate(fechaAsistencia.toString()), curso.idCurso);
      }
    } else {
      setlListEstudiantes([]);
      setEditMode(false)
    }
  }, [curso, fechaAsistencia]);

  function formatDate(fecha: Date | string) {
    if (fecha instanceof Date) {
      const date = fecha;
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Agrega cero a la izquierda si es necesario
      const day = date.getDate().toString().padStart(2, '0'); // Agrega cero a la izquierda si es necesario
      return `${year}-${month}-${day}`;
    } else if (typeof fecha === 'string') {
      const months: { [key: string]: string } = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04',
        May: '05', Jun: '06', Jul: '07', Aug: '08',
        Sep: '09', Oct: '10', Nov: '11', Dec: '12'
      };

      const parts = fecha.split(' ');
      const year = parts[3];
      const month = months[parts[1]];
      const day = parts[2];

      // Formatea la fecha como "yyyy-MM-dd"
      return `${year}-${month}-${day}`;
    } else {
      // Maneja otros tipos de entrada si es necesario
      return '';
    }
  }

  const resetFiltro = () => {
    setDocenteObj({
      fechaRegistro: null,
      password: '',
      persona: null,
      rol: null,
      username: '',
      idUsuario: 0
    })
    cleanCurso()
    setFechaAsistencia(new Date())
  }


  const cleanCurso = () => {
    setCurso({
      idCurso: 0,
      docente: null,
      fechaInicio: '',
      fechaRegistro: '',
      nombreCurso: '',
      rangoEdad: null,
    })
  }

  const loadCurso = (id: number) => {
    cursoService
      .cursoByUser(id)
      .then((data: ICurso[]) => {



        setCursos(data);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };
  const loadDocentes = () => {
    usuarioService
      .userXrol(3)
      .then((data: IUsuario[]) => { // Proporciona un tipo explícito para "data"

        const dataWithLabel = data.map((object) => ({
          ...object,
          label: `${object.persona?.nombresPersona} ${object.persona?.apellidosPersona}`,
        }));

        setDocentes(dataWithLabel);
        // setSelectedDocente(null);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });

  };

  const convertirAAsistencia = (fichaInscripcion: IFichaInscripcion): IAsistencia => {
    return {
      fechaAsistencia: fechaAsistencia, // Define la fecha de asistencia como sea necesario
      estadoAsistencia: false, // Establece el estado de asistencia según tus necesidades
      observacionesAsistencia: '', // Agrega observaciones si es necesario
      fichaInscripcion: fichaInscripcion, // Asigna el objeto IFichaInscripcion
      curso: curso, // Asigna el curso relacionado
    };
  };

  const convertirFechas = (asistencia: IAsistencia): IAsistencia => {
    if (fechaAsistencia) {
      const fechaUTC: Date = new Date(fechaAsistencia?.toString())
      asistencia.fechaAsistencia = fechaUTC;
    }
    return asistencia
  };


  const loadListEstudiantes = (fecha: string, id: number) => {

    asistenciaService
      .buscarAsistencia(fecha, id)
      .then((data) => {
        if (data.length > 0) {
          setlListEstudiantes(data);
          loadExcelReportData(data)
          setEditMode(true)
        } else {

          inscripcionService
            .listaEstudiantes(id)
            .then((dataEst) => {
              const asistenciaList: IAsistencia[] = dataEst.map((estudiante: IFichaInscripcion) =>
                convertirAAsistencia(estudiante)
              );
              setlListEstudiantes(asistenciaList);
              loadExcelReportData(asistenciaList)
              setEditMode(false)

            })
            .catch((error) => {
              console.error("Error al obtener los datos:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };


  const handleSubmit = () => {

    if (validaciones()) {

      asistenciaService
        .saveAll(listEstudiantes)
        .then((response) => {
          swal("Asistencia", "La asistencia se registro exitosamente", "success");
          if (fechaAsistencia && curso.idCurso) {
            loadListEstudiantes(formatDate(fechaAsistencia.toString()), curso.idCurso);
          }
          setEditMode(true);
        })

        .catch((error) => {
          console.error("Error al enviar el formulario:", error);
        });
    }


  }

  const handleUpdate = () => {
    if (editMode) {
      if (validaciones()) {

        const asistenciaList: IAsistencia[] = listEstudiantes.map((estudiante: IAsistencia) =>
          convertirFechas(estudiante)
        );
        asistenciaService
          .updateAll(listEstudiantes)
          .then((response) => {
            swal({
              title: "Asistencia",
              text: "La asistencia se actualizo exitosamente",
              icon: "success",
            });
            if (fechaAsistencia && curso.idCurso) {
              loadListEstudiantes(formatDate(fechaAsistencia.toString()), curso.idCurso);
            }
            setEditMode(true);
          })
          .catch((error) => {
            console.error("Error al actualizar el formulario:", error);
          });
      }
    }
  };

  function validaciones(): boolean {

    if (curso.idCurso === 0) {
      toast.error("Seleccione el curso al que desea tomar asistecia", {
        style: {
          fontSize: '15px'
        },
        duration: 3000,
      })
      return false
    }
    if (!fechaAsistencia) {
      toast.error("Por favor, escoja la fecha en que desea tomar asistencia", {
        style: {
          fontSize: '15px'
        },
        duration: 3000,
      })
      return false
    }


    return true

  }


  function loadExcelReportData(data: IAsistencia[]) {
    const cursoEncontrado = cursos.find((curso) => curso.idCurso === curso.idCurso);

    const fecha: Date = new Date(fechaAsistencia?.toString() || '')
    const dia = fecha.getDate().toString().padStart(2, '0'); // Garantiza 2 dígitos con un 0 adelante si es necesario
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Garantiza 2 dígitos con un 0 adelante si es necesario
    const anio = fecha.getFullYear();

    const reportName = `Asistencia ${cursoEncontrado?.nombreCurso} ${dia}-${mes}-${anio}`
    const logo = 'G1:K1'
    const rowData = data.map((item, index) => (
      {
        numLista: index + 1,
        apellidos: item.fichaInscripcion?.fichaPersonal?.apellidos,
        nombres: item.fichaInscripcion?.fichaPersonal?.nombres,
        estado: item.estadoAsistencia ? 'PRESENTE' : 'AUSENTE',
        observacion: item.observacionesAsistencia,
      }
    ));
    const headerItems: IHeaderItem[] = [
      { header: "№ Lista" },
      { header: "APELLIDOS" },
      { header: "NOMBRES" },
      { header: "ASISTENCIA" },
      { header: "OBSERVACION" },


    ]


    setExcelReportData({
      reportName,
      headerItems,
      rowData,
      logo
    }
    )
  }

  return (
    <>
      <div>
        <Toaster position="top-right"
          reverseOrder={true} />
      </div>
      <Fieldset className="fgrid col-fixed " style={{ display: 'flex', justifyContent: 'center' }}>

        <Card
          header={cardHeader}
          className="border-solid border-red-800 border-3 flex-1 flex-wrap"
          style={{ marginBottom: "35px", minWidth: "700px ", maxWidth: "1000px" }}
        >
          <div
            className="h1-rem"
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <h1 className="text-5xl font-smibold lg:md-2 h-full max-w-full max-h-full min-w-min">
              Registro de Asistencia
            </h1>
          </div>

          <section className="flex justify-content-center flex-wrap container">
            <Divider align="left">
              <div className="inline-flex align-items-center">
                <i className="pi pi-filter-fill mr-2"></i>
                <b>Filtro</b>
              </div>
            </Divider>
            <Fieldset legend="Filtros de busqueda" style={{ width: "1000px", position: "relative" }}>
              <div style={{ position: "absolute", top: "0", right: "5px", marginTop: "-15px" }}>
                <label className="font-medium w-auto min-w-min" htmlFor="rangoEdad" style={{ marginRight: "10px" }}>Limpiar filtros:</label>

                <Button icon="pi pi-times" rounded severity="danger" aria-label="Cancel"
                  onClick={() => resetFiltro()}
                />
              </div>

              <section className="layout">

                <div className="" style={{}}>
                  <div className="input-box" style={{ display: "grid" }}>
                    <label className="font-medium w-auto min-w-min" htmlFor='genero'>Docente:</label>

                    <div className="flex-1" style={{ display: "flex", alignItems: "center" }}>
                      <Dropdown
                        id="Docente"
                        name="Docente"
                        filter
                        showClear
                        style={{ minWidth: "200", maxWidth: "270px", height: "36px", alignItems: "center" }}
                        options={docentes}
                        onChange={(e) => {
                          setDocenteObj({
                            ...docenteObj,
                            idUsuario: e.value, fechaRegistro: '', password: '', persona: null, rol: null, username: ''
                          });

                        }}
                        value={docenteObj?.idUsuario} // Make sure this is correctly bound
                        optionLabel="label"
                        optionValue="idUsuario"
                        placeholder="Seleccione al Docente"
                      />
                    </div>
                  </div>
                </div>
                <div className="" style={{}}>
                  <div className="input-box" style={{ display: "grid" }}>
                    <label className="font-medium w-auto min-w-min" htmlFor='genero'>Curso:</label>

                    <div className="flex-1" style={{ display: "flex", alignItems: "center" }}>
                      <Dropdown
                        id="curso"
                        name="curso"
                        style={{ minWidth: "150px", maxWidth: "200px", height: "36px", alignItems: "center" }}
                        options={cursos}
                        onChange={(e) => {
                          setCurso({ ...curso, idCurso: e.value });
                        }}
                        // onChange={(e) => {
                        //   setCurso({ ...curso, idCurso: e.value });

                        //   if (!e.value) {
                        //     setlListEstudiantes([])
                        //   } else {
                        //     loadListEstudiantes(e.value);
                        //   }

                        // }}
                        filter
                        showClear
                        value={curso?.idCurso} // Make sure this is correctly bound
                        optionLabel="nombreCurso"
                        optionValue="idCurso"
                        placeholder="Seleccione el Curso"
                      />
                    </div>
                  </div>
                </div>



                <div className="">
                  <div className="input-box" style={{ display: "grid" }}>
                    <label className="font-medium w-auto min-w-min" htmlFor='genero'
                      style={{ width: "100%", }}
                    >
                      Fecha de asistencia:
                    </label>
                    <div className="flex-1" style={{ display: "flex", alignItems: "center" }}>
                      <Calendar
                        style={{ width: "100%", maxWidth: "150px", height: "36px", alignItems: "center", justifyContent: "center" }}
                        showIcon
                        dateFormat="dd-mm-yy" // Cambiar el formato a ISO 8601
                        value={fechaAsistencia}
                        onChange={(e) => setFechaAsistencia(e.value)}
                        showButtonBar
                      />
                    </div>
                  </div>
                </div>

                <div className="">
                  <div className="input-box" style={{ display: "grid" }}>
                    <label className="font-medium w-auto min-w-min" htmlFor='genero'
                      style={{ width: "100%", }}
                    >Nº Estudiantes:</label>
                    <div className="flex-1" style={{ display: "flex", alignItems: "center" }}>

                      <Avatar label={`${listEstudiantes.length}`} className="mr-2" size="xlarge"
                        style={{}}

                      />
                    </div>
                  </div>
                </div>
              </section>
            </Fieldset>

            <Divider align="left" style={{ marginBottom: "0px" }}>
              <div className="inline-flex align-items-center">
                <i className="pi pi-check-square mr-2"></i>
                <b>Asistencia</b>
              </div>
            </Divider>

            <div className="opcTblLayout" style={{ width: "100%", }}>
              <div className="" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingTop: "20px" }}>

                <div className="" style={{ paddingLeft: "25px" }} >

                  <ReportBar
                    reportName={excelReportData?.reportName!}
                    headerItems={excelReportData?.headerItems!}
                    rowData={excelReportData?.rowData!}
                    logo={excelReportData?.logo!}
                  />

                </div>

                <div className="" style={{ paddingLeft: "25px" }} >
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

                </div>

                <div className="" style={{ paddingLeft: "25px" }} >

                  <Button
                    type="button"
                    label="Cancelar"
                    className="btn"
                    style={{
                      width: "100px",
                    }}
                    rounded
                    onClick={() => {
                      // resetForm();
                      resetFiltro();
                      setEditMode(false);
                    }} />
                </div>
              </div>
            </div>

            <div className="tblContainer" style={{ minWidth: "900px" }}>
              <table className="tableFichas">
                <thead className="theadTab" >
                  <tr style={{ backgroundColor: "#871b1b", color: "white" }}>
                    <th className="trFichas">Nº</th>
                    <th className="trFichas">Apellidos</th>
                    <th className="trFichas">Nombres </th>
                    <th className="trFichas">Asistencia</th>
                    <th className="trFichas">Observaciones</th>

                  </tr>
                </thead>
                <tbody>
                  {listEstudiantes.map((est, index) => (
                    <tr
                      className="text-center"
                      key={est.idAsistencia?.toString()}
                    >
                      <td className="tdFichas">{index + 1}</td>

                      <td className="tdFichas">{est.fichaInscripcion?.fichaPersonal?.apellidos}</td>
                      <td className="tdFichas">{est.fichaInscripcion?.fichaPersonal?.nombres}</td>
                      <td className="tdFichas" style={{ width: "190px" }}>

                        <div className="mydict">
                          <div>
                            <label className="radioLabel">
                              <input
                                className="input"
                                // disabled={est.estadoAsistencia === true} // Cambiado a est.estadoAsistencia === true
                                type="radio"
                                id={`carnerTrue_${index}`}
                                name={`carner_${index}`}
                                value="true"
                                checked={est.estadoAsistencia === true}
                                onChange={() => {
                                  const updatedEstudiantes = [...listEstudiantes];
                                  updatedEstudiantes[index].estadoAsistencia = true;
                                  setlListEstudiantes(updatedEstudiantes);
                                }}
                              />
                              <span>Presente</span>
                            </label>
                            <label className="radioLabel">
                              <input
                                className="input"
                                // disabled={est.estadoAsistencia === false} // Cambiado a est.estadoAsistencia === true
                                type="radio"
                                id={`carnerFalse_${index}`}
                                name={`carner_${index}`}
                                value="false"
                                checked={est.estadoAsistencia === false}
                                onChange={() => {
                                  const updatedEstudiantes = [...listEstudiantes];
                                  updatedEstudiantes[index].estadoAsistencia = false;
                                  setlListEstudiantes(updatedEstudiantes);
                                }}
                              />
                              <span>Ausente</span>
                            </label>
                          </div>
                        </div>
                      </td>
                      <td className="tdFichas">
                        <InputTextarea
                          className="text-2xl"
                          placeholder="Observaciones"
                          id="motivo"
                          name="motivo"
                          style={{ minWidth: '300px', maxWidth: '300px', minHeight: "40px", height: "40px", marginTop: "5px" }}
                          value={est.observacionesAsistencia}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            const updatedEstudiantes = [...listEstudiantes];
                            updatedEstudiantes[index].observacionesAsistencia = e.currentTarget.value;
                            setlListEstudiantes(updatedEstudiantes);

                          }
                          }

                        />
                      </td>




                    </tr>
                  ))}
                </tbody>
              </table>
            </div>



          </section >

        </Card >
      </Fieldset >

    </>
  );
}

export default Asistencia;
