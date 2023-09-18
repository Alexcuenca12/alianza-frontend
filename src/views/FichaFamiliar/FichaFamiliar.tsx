// src/components/RegistroForm.tsx
import React, { useEffect, useState, useRef } from "react";

import "../../styles/Fichas.css";
import { IFichaFamiliar } from "../../interfaces/IFichaFamiliar";
import { ITipoFamilia } from "../../interfaces/ITipoFamilia";
import { FichaFamiliarService } from "../../services/FichaFamiliarService";
import swal from "sweetalert";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import cardHeader from "../../shared/CardHeader";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { ICalcularEdad } from "../../interfaces/ICalcularEdad";
import CalcularEdad from "../../common/CalcularEdad";
import { FichaPersonalService } from "../../services/FichaPersonalService";
import { IFichaPersonal } from "../../interfaces/IFichaPersonal";

function FichaPersonal() {
  const service = new FichaFamiliarService();
  const fichaPersonalService = new FichaPersonalService();

  const fileUploadRef = useRef<FileUpload>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [busqueda, setBusqueda] = useState<string>("");
  const [foto, setFoto] = useState<string>(
    "https://cdn-icons-png.flaticon.com/128/666/666201.png"
  );

  const [editItemId, setEditItemId] = useState<number | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);

  const [listFperonales, setListFperonales] = useState<IFichaPersonal[]>([]);
  const [listFichaFamiliar, setFichaFamiliar] = useState<IFichaFamiliar[]>([]);
  const [formData, setFormData] = useState<IFichaFamiliar>({
    idFichaFamiliar: 0,
    visitaDomiciliar: false,
    jefaturaFamiliar: "",
    numIntegrantes: 0,
    numAdultos: 0,
    numNNA: 0,
    numAdultosMayores: 0,
    beneficioAdicional: "",
    organizacionBeneficio: "",
    discapacidadIntegrantes: false,
    otrasSituaciones: "",
    tipoFamilia: null,
    fichaPersonal: null,
  });

  //LISTA DE PARA CARGAR LOS OBJETOS TRAIDOS DEL BACK PARA LOS COMBOS
  const tiposFamilias: ITipoFamilia[] = [
    { idTipoFamilia: 1, nombreTipo: "Grande" },
    { idTipoFamilia: 2, nombreTipo: "Mediana" },
  ];

  // const rangosEdadOpc: { label: string, value: number }[] = [];
  const [tiposFamiliasOpc, setTiposFamiliasOpc] = useState<
    { label: string; value: number }[]
  >([]);

  useEffect(() => {
    //METODOS PARA CARGAR LOS COMBOS DEL FORMILARIO
    const cargarComboFamilias = () => {
      const opciones = tiposFamilias.map((dato) => ({
        label: `${dato.nombreTipo}`,
        value: dato.idTipoFamilia,
      }));
      setTiposFamiliasOpc(opciones);
    };

    cargarComboFamilias();

    loadData();
  }, []);

  const loadData = () => {
    service
      .getAll()
      .then((data) => {
        setFichaFamiliar(data);
        setDataLoaded(true); // Marcar los datos como cargados
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    service
      .save(formData)
      .then((response) => {
        resetForm();
        swal("Publicacion", "Datos Guardados Correctamente", "success");

        service
          .getAll()
          .then((data) => {
            setFichaFamiliar(data);
            resetForm();
            // if (fileUploadRef.current) {
            //     fileUploadRef.current.clear();
            // }
          })
          .catch((error) => {
            console.error("Error al obtener los datos:", error);
          });
      })
      .catch((error) => {
        console.error("Error al enviar el formulario:", error);
      });

    // Aquí puedes enviar los datos del formulario al servidor o realizar otras acciones
    console.log("Datos enviados:", { formData });
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
          service
            .delete(id)
            .then(() => {
              setFichaFamiliar(
                listFichaFamiliar.filter(
                  (contra) => contra.idFichaFamiliar !== id
                )
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
      const editItem = listFichaFamiliar.find(
        (contra) => contra.idFichaFamiliar === id
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

    if (editItemId !== undefined) {
      service
        .update(Number(editItemId), formData as IFichaFamiliar)
        .then((response) => {
          swal({
            title: "Ficha Personal",
            text: "Datos actualizados correctamente",
            icon: "success",
          });
          setFormData({
            idFichaFamiliar: 0,
            visitaDomiciliar: false,
            jefaturaFamiliar: "",
            numIntegrantes: 0,
            numAdultos: 0,
            numNNA: 0,
            numAdultosMayores: 0,
            beneficioAdicional: "",
            organizacionBeneficio: "",
            discapacidadIntegrantes: false,
            otrasSituaciones: "",
            tipoFamilia: null,
            fichaPersonal: null,
          });
          setFichaFamiliar(
            listFichaFamiliar.map((contra) =>
              contra.idFichaFamiliar === editItemId ? response : contra
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
      idFichaFamiliar: 0,
      visitaDomiciliar: false,
      jefaturaFamiliar: "",
      numIntegrantes: 0,
      numAdultos: 0,
      numNNA: 0,
      numAdultosMayores: 0,
      beneficioAdicional: "",
      organizacionBeneficio: "",
      discapacidadIntegrantes: false,
      otrasSituaciones: "",
      tipoFamilia: null,
      fichaPersonal: null,
    });
  };

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

    console.log("Datos enviados:", { listFperonales });
  };

  const cargarFoto = (id: number) => {
    const Foto = listFperonales.find(
      (persona) => persona.idFichaPersonal === id
    );

    if (Foto) {
      // Actualiza formData con la foto correspondiente
      setFoto(Foto.foto);
      if (Foto) {
        console.log("Foto cargada");
      }
    }
  };

  const resetFiltro = () => {
    setBusqueda("");
    setFoto("https://cdn-icons-png.flaticon.com/128/666/666201.png");
  };

  return (
    <Fieldset
      className="fgrid col-fixed "
      style={{ display: "flex", justifyContent: "center" }}
    >
      <Card
        header={cardHeader}
        className="border-solid border-red-800 border-3 flex-1 flex-wrap"
        style={{
          width: "1200px",
          marginLeft: "90px",
          marginTop: "15px",
          marginBottom: "35px",
          height: "1125px",
        }}
      >
        <div
          className="h1-rem"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <h1 className="text-5xl font-smibold lg:md-2 h-full max-w-full max-h-full min-w-min">
            Ficha de Familiar
          </h1>
        </div>
        <section className="container">
          <form
            onSubmit={editMode ? handleUpdate : handleSubmit}
            className="form"
            encType="multipart/form-data"
          >
            <Fieldset legend="Filtros de busqueda">
              <div
                style={{
                  textAlign: "right",
                  marginRight: "",
                  position: "absolute",
                  top: "30px",
                  right: "10px",
                }}
              >
                <label
                  className="font-medium w-auto min-w-min"
                  htmlFor="rangoEdad"
                  style={{ marginRight: "15px" }}
                >
                  Limpiar filtros:
                </label>

                <Button
                  icon="pi pi-times"
                  rounded
                  severity="danger"
                  aria-label="Cancel"
                  onClick={() => resetFiltro()}
                />
              </div>

              <section className="layout">
                <div className="grow1 marginLeft">
                  <div input-box>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="genero"
                    >
                      Cedula o Nombre:
                    </label>

                    <div className="flex-1">
                      <InputText
                        placeholder="Cedula de identidad"
                        id="integer"
                        // keyfilter="int"
                        onChange={(e) => {
                          // Actualizar el estado usando setFormData
                          setBusqueda(e.currentTarget.value);

                          // Luego, llamar a loadRelacion después de que se actualice el estado
                          loadRelacion();
                        }}
                        value={busqueda}
                      />

                      <Button
                        icon="pi pi-search"
                        className="p-button-warning"
                      />
                    </div>
                  </div>
                </div>
                <div className="grow1 shrink0">
                  <div>
                    <label
                      className="font-medium w-auto min-w-min"
                      htmlFor="fichaPersonal"
                    >
                      Resultados de la busqueda:
                    </label>
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
                            idFichaPersonal: parseInt(e.value),
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
                            estVinculacion: true,
                          },
                        });
                        cargarFoto(parseInt(e.value));
                        // loadData()
                        console.log(formData);
                      }}
                      value={formData.fichaPersonal}
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

            <div className="column">
              <div className="column" style={{ width: "50%" }}>
                <div className="input-box">
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="jefaturaFamiliar"
                  >
                    Jefatura familiar:
                  </label>
                  <input
                    className="input"
                    type="text"
                    id="jefaturaFamiliar"
                    value={formData.jefaturaFamiliar}
                    placeholder="Ingrese el nombre del jefe del hogar"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jefaturaFamiliar: e.target.value,
                      })
                    }
                    required
                  />
                  <span className="input-border"></span>
                </div>
              </div>

              <div className="column" style={{ width: "50%" }}>
                <div className="input-box">
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="etnia"
                  >
                    Tipo de familia::
                  </label>
                  <div className="select-box" style={{ width: "100%" }}>
                    <Dropdown
                      className="text-2xl"
                      id="parroquia"
                      name="parroquia"
                      style={{ width: "100%" }}
                      options={tiposFamiliasOpc}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipoFamilia: {
                            idTipoFamilia: parseInt(e.value),
                            nombreTipo: "",
                          },
                        })
                      }
                      value={formData.tipoFamilia?.idTipoFamilia}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Seleccione el tipo de familia"
                    />
                  </div>
                </div>

                <div className="gender-box">
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="genero"
                  >
                    Visita Domiciliar:
                  </label>

                  <div className="gender-option">
                    <div className="gender">
                      <div className="mydict">
                        <div>
                          <label>
                            <input
                              className="input"
                              type="radio"
                              id="genSI"
                              name="genSI"
                              value="true"
                              checked={formData.visitaDomiciliar === true}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  visitaDomiciliar: true,
                                })
                              }
                            />
                            <span>SI</span>
                          </label>
                          <label>
                            <input
                              className="input"
                              type="radio"
                              id="genNO"
                              name="genNO"
                              value="false"
                              checked={formData.visitaDomiciliar === false}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  visitaDomiciliar: false,
                                })
                              }
                            />
                            <span>NO</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="column">
              <div className="column" style={{ width: "50%" }}>
                <div className="input-box">
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="numNNA"
                  >
                    Numero de NNA:
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    id="numNNA"
                    value={formData.numNNA}
                    placeholder="Ingrese el numero de adultos del hogar"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numNNA: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                  <span className="input-border"></span>
                </div>

                <div className="input-box">
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="numAdultosMayores"
                  >
                    Numero adultos mayores:
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    id="numAdultosMayores"
                    value={formData.numAdultosMayores}
                    placeholder="Ingrese el numero de adultos del hogar"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numAdultosMayores: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                  <span className="input-border"></span>
                </div>
              </div>
              <div className="column" style={{ width: "50%" }}>
                <div className="input-box">
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="numIntegrantes"
                  >
                    Numero de integrantes:
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    id="numIntegrantes"
                    value={formData.numIntegrantes}
                    placeholder="Ingrese el numero de integrantes del hogar"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numIntegrantes: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                  <span className="input-border"></span>
                </div>
                <div className="input-box">
                  <label
                    className="font-medium w-auto min-w-min"
                    htmlFor="numAdultos"
                  >
                    Numero de adultos:
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    id="numAdultos"
                    value={formData.numAdultos}
                    placeholder="Ingrese el numero de adultos del hogar"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numAdultos: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                  <span className="input-border"></span>
                </div>
              </div>
            </div>

            <div className="column"></div>

            <div className="column">
              <div className="input-box">
                <label
                  className="font-medium w-auto min-w-min"
                  htmlFor="beneficioAdicional"
                >
                  Beneficio adicional:
                </label>
                <input
                  className="input"
                  type="text"
                  id="beneficioAdicional"
                  value={formData.beneficioAdicional}
                  placeholder="En caso de contar con ayuda adicional"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      beneficioAdicional: e.target.value,
                    })
                  }
                  required
                />
                <span className="input-border"></span>
              </div>

              <div className="input-box">
                <label
                  className="font-medium w-auto min-w-min"
                  htmlFor="organizacionBeneficio"
                >
                  Organizacion benefica:
                </label>
                <input
                  className="input"
                  type="text"
                  id="organizacionBeneficio"
                  value={formData.organizacionBeneficio}
                  placeholder="Nombre de la organizacion que brinda el beneficio"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organizacionBeneficio: e.target.value,
                    })
                  }
                  required
                />
                <span className="input-border"></span>
              </div>
            </div>

            <div className="column">
              <div className="gender-box">
                <label
                  className="font-medium w-auto min-w-min"
                  htmlFor="discapacidadIntegrantes"
                >
                  ¿En su residencia, convive alguna persona con discapacidad?:
                </label>

                <div className="gender-option">
                  <div className="gender">
                    <div className="mydict">
                      <div>
                        <label>
                          <input
                            className="input"
                            type="radio"
                            id="genSiDis"
                            name="genSiDis"
                            value="true"
                            checked={formData.discapacidadIntegrantes === true}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                discapacidadIntegrantes: true,
                              })
                            }
                          />
                          <span>SI</span>
                        </label>
                        <label>
                          <input
                            className="input"
                            type="radio"
                            id="genNoDis"
                            name="genNoDis"
                            value="false"
                            checked={formData.discapacidadIntegrantes === false}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                discapacidadIntegrantes: false,
                              })
                            }
                          />
                          <span>NO</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="input-box">
                <label
                  className="font-medium w-auto min-w-min"
                  htmlFor="otrasSituaciones"
                >
                  Otras situaciones familiares:
                </label>
                <input
                  className="input"
                  type="text"
                  id="organizacionBeneficio"
                  value={formData.otrasSituaciones}
                  placeholder="Otras situaciones familiares relacionadas"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      otrasSituaciones: e.target.value,
                    })
                  }
                  required
                />
                <span className="input-border"></span>
              </div>
            </div>
          </form>
          {/* </div> */}
        </section>

        <div style={{ marginTop: "50px" }}>
          <table
            style={{ minWidth: "40rem" }}
            className="mt-4  w-full h-full text-3xl font-large"
          >
            <thead>
              <tr style={{ backgroundColor: "#871b1b", color: "white" }}>
                <th>Nº Ficha</th>
                <th>Visita Domi.</th>
                <th>Jefatira Fam.</th>
                <th>Tipo de Fam.</th>
                <th>Integrantes</th>
                <th># Adultos</th>
                <th># NNA</th>
                <th># Adultos Mayores</th>
                <th>Beneficio Ad.</th>
                <th>Org. Benefica</th>
                <th>Discapacidad Fam.</th>
                {/* <th>Otras Situaciones</th> */}
              </tr>
            </thead>
            <tbody>
              {listFichaFamiliar.map((ficha) => (
                <tr
                  className="text-center"
                  key={ficha.idFichaFamiliar?.toString()}
                >
                  <td>{ficha.visitaDomiciliar}</td>
                  <td>{ficha.jefaturaFamiliar}</td>
                  <td>{ficha.tipoFamilia?.nombreTipo}</td>
                  <td>{ficha.numIntegrantes}</td>
                  <td>{ficha.numAdultos}</td>
                  <td>{ficha.numNNA}</td>
                  <td>{ficha.numAdultosMayores}</td>
                  <td>{ficha.beneficioAdicional}</td>
                  <td>{ficha.organizacionBeneficio}</td>
                  <td>{ficha.otrasSituaciones}</td>
                  {/* <td>{ficha.organizacionBeneficio}</td> */}

                  <td
                    style={{
                      display: "flex",
                      gap: "10px",
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      type="button"
                      className=""
                      label="✎"
                      style={{
                        background: "#ff0000",
                        borderRadius: "10%",
                        fontSize: "25px",
                        width: "50px",
                        color: "black",
                        justifyContent: "center",
                      }}
                      onClick={() =>
                        handleEdit(ficha.idFichaFamiliar?.valueOf())
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
                        handleDelete(ficha.idFichaFamiliar?.valueOf())
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

export default FichaPersonal;
