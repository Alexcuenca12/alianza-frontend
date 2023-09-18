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
import { Dropdown } from "primereact/dropdown";
import '../../styles/FiltroFichas.css'


function FichaSaludContext() {
  const fichaPersonalService = new FichaPersonalService();
  const [busqueda, setBusqueda] = useState<string>('');
  const [foto, setFoto] = useState<string>('https://cdn-icons-png.flaticon.com/128/666/666201.png');
  const [listFperonales, setListFperonales] = useState<IFichaPersonal[]>([]);




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
    setListFperonales([])

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
            Ficha Médica
          </h1>
        </div>

        <div className="flex justify-content-center flex-wrap container">
          <Fieldset legend="Filtros de busqueda" style={{ width: "1000px", marginBottom: "35px", position: "relative" }}>
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
                    value={formData.fichaPersonal?.idFichaPersonal}
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
                    onClick={() => {
                      resetForm();
                      resetFiltro();
                      setEditMode(false);
                    }} />
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
