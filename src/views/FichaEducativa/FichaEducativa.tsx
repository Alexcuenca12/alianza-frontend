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
import { Dropdown } from "primereact/dropdown";


import '../../styles/FiltroFichas.css'

function FichaInscripcionContext() {
  const [idPersona, setIDPersona] = useState<number>(0);
  const personalService = new FichaPersonalService();
  const fichaPersonalService = new FichaPersonalService();


  const [busqueda, setBusqueda] = useState<string>('');
  const [foto, setFoto] = useState<string>('https://cdn-icons-png.flaticon.com/128/666/666201.png');
  const [listFperonales, setListFperonales] = useState<IFichaPersonal[]>([]);


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

  // const buscarPorCedula = () => {
  //   if (cedula.trim() === "") {
  //     swal("Advertencia", "Ingrese una cédula válida para buscar", "warning");
  //     return;
  //   }
  //   personalService
  //     .getByPersona(true, cedula)
  //     .then((data) => {
  //       console.log("p1", data);
  //       setFormDataPersona(data);
  //       console.log("p2", data);
  //       setIDPersona(data.idFichaPersonal);
  //       console.log("p3", data);
  //       setFormData({
  //         ...formData,
  //         fichaPersonal: {
  //           idFichaPersonal: data.idFichaPersonal,
  //         },
  //       });
  //     })
  //     .catch((error) => {
  //       console.error("Error al buscar por cédula:", error);
  //     });
  // };

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

        setBusqueda(editItem.fichaPersonal?.ciIdentidad ?? "");
        setFoto(editItem.fichaPersonal?.foto ?? '')


        if (editItem.fichaPersonal !== null) {

          const editItemWithLabel = {
            ...editItem,
            fichaPersonal: {
              ...editItem.fichaPersonal,
              label: `${editItem.fichaPersonal.ciIdentidad} || ${editItem.fichaPersonal.apellidos} ${editItem.fichaPersonal.nombres}`,
            },
          };
          setListFperonales([editItemWithLabel.fichaPersonal]);
        }
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


  const loadRelacion = () => {

    // console.log("4 SIN EDAD")
    fichaPersonalService
      .getBusquedaRelacion(true, busqueda)
      .then((data: IFichaPersonal[]) => {
        const dataWithLabel = data.map((object) => ({
          ...object,
          label: `${object.ciIdentidad} || ${object.apellidos} ${object.nombres}`,
        }));

        setListFperonales(dataWithLabel); // Establecer los datos procesados en el estado
        // setDataLoaded(true); // Puedes marcar los datos como cargados si es necesario
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });


    console.log('Datos enviados:', { listFperonales });

  };

  const cargarFoto = (id: number) => {
    const Foto = listFperonales.find((persona) => persona.idFichaPersonal === id);

    if (Foto) {
      // Actualiza formData con la foto correspondiente
      setFoto(Foto.foto);
      if (Foto) {
        console.log("Foto cargada")
      }

    }

  }

  const resetFiltro = () => {
    setBusqueda('')
    setFoto('https://cdn-icons-png.flaticon.com/128/666/666201.png')

  };


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

        <section className="flex justify-content-center flex-wrap container">
          <Fieldset legend="Filtros de busqueda" style={{ width: "1000px", marginBottom: "45px", position: "relative" }}>
            <div style={{ position: "absolute", top: "0", right: "5px", marginTop: "-15px" }}>
              <label className="font-medium w-auto min-w-min" htmlFor="rangoEdad" style={{ marginRight: "10px" }}>Limpiar filtros:</label>

              <Button icon="pi pi-times" rounded severity="danger" aria-label="Cancel" onClick={() => resetFiltro()} />
            </div>

            <section className="layout">
              <div className="">
                <div input-box>
                  <label className="font-medium w-auto min-w-min" htmlFor='genero'>Cedula o Nombre:</label>

                  <div className="flex-1">
                    <InputText
                      placeholder="Cedula de identidad"
                      id="integer"
                      // keyfilter="int"
                      style={{ width: "75%" }}

                      onChange={(e) => {
                        // Actualizar el estado usando setFormData
                        setListFperonales([]); // Asignar un arreglo vacío para vaciar el estado listFperonales

                        setBusqueda(e.currentTarget.value);

                        // Luego, llamar a loadRelacion después de que se actualice el estado
                        loadRelacion();
                      }}

                      onKeyUp={(e) => {
                        setListFperonales([]); // Asignar un arreglo vacío para vaciar el estado listFperonales

                        setBusqueda(e.currentTarget.value);

                        // Luego, llamar a loadRelacion después de que se actualice el estado
                        loadRelacion();
                        loadRelacion(); // Llama a tu método aquí o realiza las acciones necesarias.
                      }}

                      value={busqueda}
                    />

                    <Button icon="pi pi-search" className="p-button-warning" />
                  </div>
                </div>
              </div>
              <div className="">
                <div>
                  <label className="font-medium w-auto min-w-min" htmlFor="fichaPersonal">Resultados de la busqueda:</label>
                  <Dropdown
                    className="text-2xl"
                    id="tiempo_dedicacion"
                    name="tiempo_dedicacion"
                    style={{ width: "100%" }}
                    options={listFperonales}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        fichaPersonal: {
                          idFichaPersonal: parseInt(e.value), foto: '',
                          apellidos: '',
                          nombres: '',
                          ciIdentidad: '',
                          nacionalidad: '',
                          fechaNacimiento: '',
                          rangoEdad: null,
                          genero: '',
                          etnia: null,
                          parroquia: null,
                          zona: '',
                          barrioSector: '',
                          direccion: '',
                          referencia: '',
                          coordenadaX: 0,
                          coordenadaY: 0,
                          estVinculacion: true
                        }
                      });
                      cargarFoto(parseInt(e.value))
                      // loadData()
                      console.log(formData)
                    }}
                    value={formData.fichaPersonal
                      ? formData.fichaPersonal.idFichaPersonal : null
                    }
                    optionLabel="label"
                    optionValue="idFichaPersonal"
                    placeholder="Seleccione una persona"
                  />
                </div>
              </div>
              <div>
                <div style={{ display: "grid", placeItems: "center" }}>
                  <img
                    src={foto}
                    alt="FotoNNA"
                    style={{
                      // width: "80px",
                      height: "80px",
                      borderRadius: "50%", // Borde redondeado
                      border: "2px solid gray", // Borde gris
                    }}
                  />
                </div>
              </div>
            </section>


          </Fieldset>
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
                    onClick={() => {
                      resetForm();
                      resetFiltro();
                      setEditMode(false);
                    }} />
                </div>
              </div>
            </div>
          </form>
        </section>
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
