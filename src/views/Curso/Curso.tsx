import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import cardHeader from "../../shared/CardHeader";
import { ICurso } from "../../interfaces/ICurso";
import { IRangoEdad } from "../../interfaces/IRangoEdad";
import { CursoService } from "../../services/CursoService";
import { RangoEdadService } from "../../services/RangoEdadService";
import { UserService } from "../../services/UsuarioService";

import swal from "sweetalert";
import { IUsuario } from "../../interfaces/IUsuario";
import toast, { Toaster } from "react-hot-toast";
import { Divider } from "primereact/divider";
import { ReportBar } from "../../common/ReportBar";
import {
  IExcelReportParams,
  IHeaderItem,
} from "../../interfaces/IExcelReportParams";

function Curso() {
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
  const [excelReportData, setExcelReportData] =
    useState<IExcelReportParams | null>(null);

  const [busqueda, setBusqueda] = useState<string>("");

  useEffect(() => {
    loadDocentes();
  }, []);

  const loadDocentes = () => {
    usuarioService
      .userXrol(3)
      .then((data: IUsuario[]) => {
        const dataWithLabel = data.map((object) => ({
          ...object,
          label: `${object.persona?.nombresPersona} ${object.persona?.apellidosPersona}`,
        }));
        setDocentes(dataWithLabel);
        setDataLoaded(true);
      })
      .catch((error) => {
        swal({
          title: "Error",
          text: "Error al obtener datos",
          icon: "error",
        });
      });
  };

  useEffect(() => {
    loadRango();
  }, []);
  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
    loadBusqueda();
  }, [busqueda]);

  const loadRango = () => {
    rangoService
      .getAll()
      .then((data: IRangoEdad[]) => {
        const dataWithLabel = data.map((rangoEdad) => ({
          ...rangoEdad,
          label: `${rangoEdad.limInferior} - ${rangoEdad.limSuperior}`,
        }));

        setRangosEdad(dataWithLabel);
        setDataLoaded(true);
      })
      .catch((error) => {
        swal({
          title: "Error",
          text: "Error al obtener datos",
          icon: "error",
        });
      });
  };

  const loadData = () => {
    cursoService
      .getAll()
      .then((data) => {
        setContra1(data);
        loadExcelReportData(data);
        setDataLoaded(true);
      })
      .catch((error) => {
        swal({
          title: "Error",
          text: "Error al obtener datos",
          icon: "error",
        });
      });
  };

  const loadBusqueda = () => {
    if (busqueda.trim()) {
      cursoService
        .busquedaCurso(busqueda)
        .then((data: ICurso[]) => {
          loadExcelReportData(data);
          setContra1(data);
        })
        .catch((error) => {
          swal({
            title: "Error",
            text: "Error al obtener datos",
            icon: "error",
          });
        });
    } else {
      loadData();
    }
  };

  function loadExcelReportData(data: ICurso[]) {
    const reportName = "Aulas";
    const logo = "G1:K1";

    const rowData = data.map((item) => ({
      idFicha: item.idCurso,
      aula: item.nombreCurso || "",
      docente:
        `${item.docente?.persona?.nombresPersona} ${item.docente?.persona?.apellidosPersona}` ||
        "",
      inicio: item.fechaInicio
        ? new Date(item.fechaInicio).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        : "",
      rango:
        `${item.rangoEdad?.limInferior} - ${item.rangoEdad?.limSuperior}` ||
        "Sin rango",
      registro:
        typeof item.fechaRegistro === "string" &&
        `${item.fechaRegistro.split("-")[2]}/${item.fechaRegistro.split("-")[1]
        }/${item.fechaRegistro.split("-")[0]}`,
    }));
    const headerItems: IHeaderItem[] = [
      { header: "№ FICHA" },
      { header: "AULA" },
      { header: "DOCENTE" },
      { header: "FECHA DE INICIO" },
      { header: "RANGO DE EDAD" },
      { header: "FECHA DE REGISTRO" },
    ];
    setExcelReportData({
      reportName,
      headerItems,
      rowData,
      logo,
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreCurso) {
      toast.error("Ingrese un nombre para identificar el aula", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return;
    } else {
      cursoService
        .existsByNombreCurso(formData.nombreCurso)
        .then((data: boolean) => {
          if (data) {
            toast.error("Ya existe una aula registrada con este nombre", {
              style: {
                fontSize: "17px",
              },
              duration: 4500,
            });
          } else {
            if (validaciones()) {
              cursoService
                .save(formData)
                .then((response) => {
                  resetForm();
                  swal("Aula", "Datos Guardados Correctamente", "success");
                  setBusqueda(response.nombreCurso);
                  loadBusqueda();
                })
                .catch((error) => {
                  swal({
                    title: "Error",
                    text: "Error al enviar el formulario",
                    icon: "error",
                  });
                });
            }
          }
        })
        .catch((error) => {
          swal({
            title: "Error",
            text: "Error al obtener datos",
            icon: "error",
          });
        });
    }
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
        const editedItem = { ...editItem };

        if (typeof editedItem.fechaRegistro === "string") {
          const registro = new Date(editedItem.fechaRegistro);
          registro.setDate(registro.getDate() + 1);
          const formattedDate = registro
            ? registro.toISOString().split("T")[0]
            : "";
          editedItem.fechaRegistro = formattedDate;
        }

        setFormData(editedItem);

        setEditMode(true);
        setEditItemId(id);
      }
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (editItemId !== undefined) {
      if (validaciones()) {
        cursoService
          .update(Number(editItemId), formData as ICurso)
          .then((response) => {
            swal({
              title: "Aulas",
              text: "Datos actualizados correctamente",
              icon: "success",
            });
            resetForm();
            setBusqueda(response.nombreCurso);
            loadBusqueda();
          })
          .catch((error) => {
            swal({
              title: "Error",
              text: "Datos no actualizados",
              icon: "error",
            });
          });
      }
    }
  };

  function validaciones(): boolean {
    if (!formData.nombreCurso) {
      toast.error("Ingrese un nombre para identificar el aula", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.fechaInicio) {
      toast.error("Seleccione la fecha de inicio", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.docente) {
      toast.error("Seleccione el docente que estara acargo del aula", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    if (!formData.rangoEdad) {
      toast.error("Seleccione en que rango de edad estan los niños del aula", {
        style: {
          fontSize: "15px",
        },
        duration: 3000,
      });
      return false;
    }

    return true;
  }

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
        <Toaster position="top-right" reverseOrder={true} />
      </div>
      <Fieldset
        className="fgrid col-fixed "
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Card
          header={cardHeader}
          className="border-solid border-red-800 border-3 flex-1 flex-wrap"
          style={{
            marginBottom: "35px",
            minWidth: "800px ",
            maxWidth: "1100px",
          }}
        >
          <div
            className="h1-rem"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <h1 className="text-5xl font-smibold lg:md-2 h-full max-w-full max-h-full min-w-min">
              Aula
            </h1>
          </div>

          <div
            className=""
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "right",
            }}
          >
            <label
              className="font-medium w-auto min-w-min"
              htmlFor="fichaPersonal"
              style={{ marginRight: "10px" }}
            >
              Fecha de Registro:
            </label>
            <Calendar
              disabled
              style={{ width: "95px", marginRight: "25px", fontWeight: "bold" }}
              dateFormat="dd-mm-yy"
              onChange={(e) => {
                if (
                  e.value !== undefined &&
                  e.value !== null &&
                  !Array.isArray(e.value)
                ) {
                  setFormData({
                    ...formData,
                    fechaRegistro: e.value,
                  });
                }
              }}
              value={
                typeof formData.fechaRegistro === "string"
                  ? new Date(formData.fechaRegistro)
                  : new Date()
              }
            />
          </div>

          <form
            onSubmit={editMode ? handleUpdate : handleSubmit}
            className="form"
            encType="multipart/form-data"
          >
            <Divider align="left">
              <div className="inline-flex align-items-center">
                <i className="pi pi-book mr-2"></i>
                <b>Formulario </b>
              </div>
            </Divider>

            <div className="column" style={{}}>
              <div className="column" style={{ width: "50%" }}>
                <div
                  className="input-box"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <label
                    htmlFor="fechaDesvinculacion"
                    className="font-medium w-auto min-w-min"
                  >
                    Nombre Aula:
                  </label>
                  <InputText
                    className="text-2xl"
                    placeholder="Ingrese el Nombre del Aula"
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
              <div className="column" style={{ width: "50%" }}>
                <div
                  className="input-box"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <label
                    htmlFor="fechaDesvinculacion"
                    className="font-medium w-auto min-w-min"
                  >
                    Fecha de Inicio:
                  </label>
                  <Calendar
                    className="text-2xl"
                    id="fechaInicio"
                    name="fechaInicio"
                    placeholder="Ingrese la Fecha de Inicio"
                    required
                    style={{ width: "100%" }}
                    dateFormat="dd-mm-yy"
                    showIcon
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
                          fechaInicio: formattedDate,
                        });
                      }
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

            <div className="column" style={{}}>
              <div className="column" style={{ width: "50%" }}>
                <div className="input-box" style={{}}>
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="tipoDocumento"
                  >
                    Docente:
                  </label>
                  <Dropdown
                    id="docente"
                    name="docente"
                    filter
                    options={docentes}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        docente: {
                          idUsuario: parseInt(e.value),
                          persona: null,
                          username: "",
                          password: "",
                          rol: null,
                          fechaRegistro: "",
                        },
                      });
                    }}
                    value={formData.docente?.idUsuario}
                    optionLabel="label"
                    optionValue="idUsuario"
                    placeholder="Seleccione al Docente"
                    style={{
                      width: "100%",
                      height: "36px",
                      alignItems: "center",
                    }}
                  />
                </div>
              </div>
              <div className="column" style={{ width: "50%" }}>
                <div className="input-box" style={{}}>
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="tipoDocumento"
                  >
                    Rango de Edad:
                  </label>
                  <Dropdown
                    id="rangos"
                    name="rangos"
                    options={rangos}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        rangoEdad: {
                          idRangoEdad: parseInt(e.value),
                          limInferior: 0,
                          limSuperior: 0,
                        },
                      });
                    }}
                    value={formData.rangoEdad?.idRangoEdad}
                    optionLabel="label"
                    optionValue="idRangoEdad"
                    placeholder="Seleccione el Rango"
                    style={{
                      width: "100%",
                      height: "36px",
                      alignItems: "center",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="btnSend">
              <div
                className="flex align-items-center justify-content-center w-auto min-w-min"
                style={{ gap: "25px" }}
              >
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
                    setEditMode(false);
                  }}
                />
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
            <div className="opcTbl">
              <label className="font-medium w-auto min-w-min" htmlFor="genero">
                Aula o Docente:
              </label>
              <div className="flex-1">
                <InputText
                  placeholder="Cedula de identidad"
                  id="integer"
                  style={{ width: "75%" }}
                  onChange={(e) => {
                    setBusqueda(e.currentTarget.value);
                    loadBusqueda();
                  }}
                  value={busqueda}
                />
                <Button icon="pi pi-search" className="p-button-warning" />
              </div>
            </div>

            <div className="opcTbl">
              <label className="font-medium w-auto min-w-min" htmlFor="estado">
                Cargar todo:
              </label>

              <Button
                className="buttonIcon"
                icon="pi pi-refresh"
                style={{ width: "120px", height: "39px" }}
                severity="danger"
                aria-label="Cancel"
                onClick={() => {
                  loadData();
                  setBusqueda("");
                }}
              />
            </div>

            <div className="" style={{ flex: 1, paddingTop: "24px" }}>
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

          <div className="tblContainer">
            <table className="tableFichas">
              <thead className="theadTab">
                <tr style={{ backgroundColor: "#871b1b", color: "white" }}>
                  <th className="trFichas">Nº de Registro</th>
                  <th className="trFichas">Aula</th>
                  <th className="trFichas">Docente</th>
                  <th className="trFichas">Rando de Edad</th>
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
                    <td className="tdFichas">{`${curso.rangoEdad?.limInferior} - ${curso.rangoEdad?.limSuperior}`}</td>
                    <td className="tdFichas">
                      {curso.fechaInicio
                        ? new Date(curso.fechaInicio).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          }
                        )
                        : ""}
                    </td>
                    <td className="tdFichas">
                      <Button
                        className="buttonIcon"
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
                      />
                    </td>

                    <td className="tdFichas">
                      <Button
                        className="buttonIcon"
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
