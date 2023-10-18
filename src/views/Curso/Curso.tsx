import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { SelectButton } from "primereact/selectbutton";
import { Button } from "primereact/button";
import { Calendar, CalendarChangeEvent } from "primereact/calendar";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import cardHeader from "../../shared/CardHeader";
import { ICurso } from "../../interfaces/ICurso";
import { IDocente } from "../../interfaces/IDocente";
import { IRangoEdad } from "../../interfaces/IRangoEdad";
import { CursoService } from "../../services/CursoService";
import { RangoEdadService } from "../../services/RangoEdadService";
// import { DocenteService } from "../../services/DocenteService";
import { UserService } from "../../services/UsuarioService";

import swal from "sweetalert";
import { IUsuario } from "../../interfaces/IUsuario";
import { Toaster } from "react-hot-toast";
import { Divider } from "primereact/divider";
import { ReportBar } from "../../common/ReportBar";
import { IExcelReportParams } from "../../interfaces/IExcelReportParams";


function Curso() {
  const options: string[] = ["Si", "No"];

  const [contra1, setContra1] = useState<ICurso[]>([]);
  const [formData, setFormData] = useState<ICurso>({
    idCurso: 0,
    nombreCurso: "",
    fechaInicio: "",
    rangoEdad: null,
    docente: null,
    fechaRegistro: new Date(),

  });

  const [docentes, setDocentes] = useState<IUsuario[]>([]);
  const [rangos, setRangosEdad] = useState<IRangoEdad[]>([]);

  const [dataLoaded, setDataLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<number | undefined>(undefined);

  const cursoService = new CursoService();
  const rangoService = new RangoEdadService();
  const usuarioService = new UserService();
  const [excelReportData, setExcelReportData] = useState<IExcelReportParams | null>(null);

  const [busqueda, setBusqueda] = useState<string>();

  useEffect(() => {

    loadDocentes();
  }, []);

  const loadDocentes = () => {
    usuarioService
      .userXrol(3)
      .then((data: IUsuario[]) => { // Proporciona un tipo explícito para "data"

        const dataWithLabel = data.map((object) => ({
          ...object,
          label: `${object.persona?.nombresPersona} ${object.persona?.apellidosPersona}`,
        }));

        setDocentes(dataWithLabel);
        setDataLoaded(true);
        // setSelectedDocente(null);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });

  };

  useEffect(() => {

    loadRango();
  }, []);

  const loadRango = () => {
    rangoService
      .getAll()
      .then((data: IRangoEdad[]) => { // Proporciona un tipo explícito para "data"
        // Transforma los datos para agregar la propiedad "label"
        const dataWithLabel = data.map((rangoEdad) => ({
          ...rangoEdad,
          label: `${rangoEdad.limInferior} - ${rangoEdad.limSuperior}`,
        }));

        setRangosEdad(dataWithLabel);
        setDataLoaded(true);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };

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
      idCurso: 0,
      nombreCurso: "",
      fechaInicio: "",
      rangoEdad: null,
      docente: null,
      fechaRegistro: new Date(),
    });
    setEditMode(false);
    setEditItemId(undefined);
  };

  if (!dataLoaded) {
    return <div>Cargando datos...</div>;
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
          style={{ marginBottom: "35px", minWidth: "800px ", maxWidth: "1100px" }}
        >
          <div
            className="h1-rem"
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <h1 className="text-5xl font-smibold lg:md-2 h-full max-w-full max-h-full min-w-min">
              Curso
            </h1>
          </div>


          <div className="" style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "right" }}>
            <label className="font-medium w-auto min-w-min" htmlFor="fichaPersonal" style={{ marginRight: "10px" }}>Fecha de Registro:</label>
            <Calendar
              disabled
              style={{ width: "95px", marginRight: "25px", fontWeight: "bold" }}
              value={formData.fechaRegistro}
              onChange={(e: CalendarChangeEvent) => {
                if (e.value !== undefined) {
                  setFormData({
                    ...formData,
                    fechaRegistro: e.value,
                  });
                }
              }} />
          </div>

          <form onSubmit={editMode ? handleUpdate : handleSubmit} className='form' encType="multipart/form-data">

            <Divider align="left">
              <div className="inline-flex align-items-center">
                <i className="pi pi-book mr-2"></i>
                <b>Formulario </b>
              </div>
            </Divider>

            <div className='column' style={{}}>
              <div className='column' style={{ width: "50%" }}>
                <div className='input-box' style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <label htmlFor="fechaDesvinculacion" className="font-medium w-auto min-w-min">
                    Nombre Curso:
                  </label>
                  <InputText
                    className="text-2xl"
                    placeholder="Ingrese el Nombre del Curso"
                    id="nomCurso"
                    name="nomCurso"
                    style={{ width: "100%" }}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nombreCurso: e.currentTarget.value,
                      })
                    }
                    value={formData.nombreCurso}
                  />
                </div>
              </div>
              <div className='column' style={{ width: "50%" }}>
                <div className='input-box' style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <label htmlFor="fechaDesvinculacion" className="font-medium w-auto min-w-min">
                    Fecha de Inicio:
                  </label>
                  <Calendar
                    className="text-2xl"
                    id="fechaInicio"
                    name="fechaInicio"
                    placeholder="Ingrese la Fecha de Inicio"
                    required
                    style={{ width: "100%" }}

                    dateFormat="yy-mm-dd"
                    showIcon
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
              </div>
            </div>

            <div className='column' style={{}}>
              <div className='column' style={{ width: "50%" }}>
                <div className='input-box' style={{}}>
                  <label className="font-medium w-auto min-w-min" htmlFor="tipoDocumento">
                    Docente:
                  </label>
                  <Dropdown
                    id="docente"
                    name="docente"
                    options={docentes}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        docente: { idUsuario: parseInt(e.value), persona: null, username: '', password: '', rol: null, fechaRegistro: '' },
                      });

                    }}
                    value={formData.docente?.idUsuario}
                    optionLabel="label"
                    optionValue="idUsuario"
                    placeholder="Seleccione al Docente"
                    style={{ width: "100%", height: "36px", alignItems: "center" }}
                  />
                </div>
              </div>
              <div className='column' style={{ width: "50%" }}>
                <div className='input-box' style={{}}>
                  <label className="font-medium w-auto min-w-min" htmlFor="tipoDocumento">
                    Rango de Edad:
                  </label>
                  <Dropdown
                    id="rangos"
                    name="rangos"
                    options={rangos}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        rangoEdad: { idRangoEdad: parseInt(e.value), limInferior: 0, limSuperior: 0 },
                      })
                    }}
                    value={formData.rangoEdad?.idRangoEdad}
                    optionLabel="label"
                    optionValue="idRangoEdad"
                    placeholder="Seleccione el Rango"
                    style={{ width: "100%", height: "36px", alignItems: "center" }}
                  />
                </div>
              </div>
            </div>

            <div className='btnSend'>

              <div className="flex align-items-center justify-content-center w-auto min-w-min"
                style={{ gap: "25px" }}>
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

                  }} />
              </div>
            </div>
          </form>
          <Divider align="left">
            <div className="inline-flex align-items-center">
              <i className="pi pi-filter-fill mr-2"></i>
              <b>Filtro</b>
            </div>
          </Divider>
          <div className="opcTblLayout">

            <div className="opcTbl" >
              <label className="font-medium w-auto min-w-min" htmlFor='genero'>Aula o Docente:</label>

              <div className="flex-1" >
                <InputText
                  placeholder="Cedula de identidad"
                  id="integer"
                  // keyfilter="int"
                  style={{ width: "75%" }}

                  onChange={(e) => {
                    // Actualizar el estado usando setFormData

                    setBusqueda(e.currentTarget.value);


                  }}



                  value={busqueda}
                />

                <Button icon="pi pi-search" className="p-button-warning" />
              </div>
            </div>



            <div className="opcTbl">
              <label className="font-medium w-auto min-w-min" htmlFor='estado'>Cargar todo:</label>

              <Button className="buttonIcon" // Agrega una clase CSS personalizada
                icon="pi pi-refresh" style={{ width: "120px", height: "39px" }} severity="danger" aria-label="Cancel" onClick={loadData} />

            </div>


            <div className="" style={{ flex: 1, paddingTop: '24px' }}>
              <ReportBar
                reportName={excelReportData?.reportName!}
                headerItems={excelReportData?.headerItems!}
                rowData={excelReportData?.rowData!}
                logo={excelReportData?.logo!}
              />
            </div>
          </div>

          <Divider align="left" style={{ marginBottom: "0px" }}>
            <div className="inline-flex align-items-center">
              <i className="pi pi-list mr-2"></i>
              <b>Lista</b>
            </div>
          </Divider>

          <div className="tblContainer" >
            <table className="tableFichas">
              <thead className="theadTab" >
                <tr style={{ backgroundColor: "#871b1b", color: "white" }}>
                  <th className="trFichas">Nº de Registro</th>
                  <th className="trFichas">Aula</th>
                  <th className="trFichas">Docente</th>
                  <th className="trFichas">Fecha Inicio</th>
                  <th className="trFichas">Editar</th>
                  <th className="trFichas">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {contra1.map((curso) => (
                  <tr className="text-center" key={curso.idCurso?.toString()}>
                    <td className="tdFichas">{curso.idCurso}</td>
                    <td className="tdFichas">{curso.nombreCurso}</td>
                    <td className="tdFichas">{`${curso.docente?.persona?.nombresPersona} ${curso.docente?.persona?.apellidosPersona}`}</td>
                    <td className="tdFichas">
                      {curso.fechaInicio
                        ? new Date(curso.fechaInicio).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                        : ""}
                    </td>
                    <td className="tdFichas">
                      <Button className="buttonIcon"
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
                        onClick={() => handleEdit(curso.idCurso?.valueOf())}

                      // Agrega el evento onClick para la operación de editar
                      />

                    </td>

                    <td className="tdFichas">
                      <Button className="buttonIcon"
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
                        onClick={() => handleDelete(curso.idCurso?.valueOf())}

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

export default Curso;
