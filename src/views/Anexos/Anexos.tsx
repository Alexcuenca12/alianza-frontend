import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import { InputTextarea } from "primereact/inputtextarea";
import { RadioButton } from "primereact/radiobutton";
import CardHeader from "../../shared/CardHeader";
import { InputText } from "primereact/inputtext";
import { IFichaPersonal } from "../../interfaces/IFichaPersonal";
import { FichaPersonalService } from "../../services/FichaPersonalService";

function Anexo() {
  const [foto, setFoto] = useState<string>(
    "https://cdn-icons-png.flaticon.com/128/666/666201.png"
  );
  const [busqueda, setBusqueda] = useState<string>("");

  const [listFperonales, setListFperonales] = useState<IFichaPersonal[]>([]);

  const fichaPersonalService = new FichaPersonalService();

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

  const resetFiltro = () => {
    setBusqueda("");
    setFoto("https://cdn-icons-png.flaticon.com/128/666/666201.png");
    setListFperonales([]);
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
            Anexos
          </h1>
        </div>

        <div className="flex justify-content-center flex-wrap">
          <form>
            <div className="flex flex-wrap flex-row">
              <div className="flex align-items-center justify-content-center">
                <section
                  className="flex justify-content-center flex-wrap container"
                  style={{
                    paddingLeft: "150px",
                  }}
                >
                  <Fieldset
                    legend="Filtros de busqueda"
                    style={{
                      width: "1000px",
                      marginBottom: "45px",
                      position: "relative",
                      paddingLeft: "15px",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "0",
                        right: "5px",
                        marginTop: "-15px",
                      }}
                    >
                      <label
                        className="font-medium w-auto min-w-min"
                        htmlFor="rangoEdad"
                        style={{ marginRight: "10px" }}
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
                      <div className="">
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
                              keyfilter="int"
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

                            <Button
                              icon="pi pi-search"
                              className="p-button-warning"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="">
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
                              cargarFoto(parseInt(e.value));
                            }}
                            //value={formData.fichaPersonal?.idFichaPersonal}
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
                              width: "80px",
                              height: "80px",
                              borderRadius: "50%", // Borde redondeado
                              border: "2px solid gray", // Borde gris
                            }}
                          />
                        </div>
                      </div>
                    </section>
                  </Fieldset>
                </section>
              </div>
              <div
                className="flex flex-column flex-wrap gap-4"
                style={{
                  paddingRight: "50px",
                  paddingLeft: "200px",
                  paddingBottom: "20px",
                }}
              >
                <div
                  className="flex flex-wrap w-full h-full "
                  style={{ justifyContent: "right", marginLeft: "10px" }}
                >
                  <label
                    htmlFor="docente"
                    className="text-3xl font-medium w-auto min-w-min"
                    style={{ marginLeft: "10px", marginRight: "10px" }}
                  >
                    Tipo Ficha:
                  </label>
                  <Dropdown
                    id="docente"
                    name="docente"
                    placeholder="Seleccione el Tipo de Ficha"
                    //options={opcionesDocente}
                  />
                </div>
              </div>
              <div
                className="flex flex-column flex-wrap gap-4"
                style={{ paddingRight: "25px", paddingBottom: "20px" }}
              >
                <div
                  className="flex flex-wrap w-full h-full "
                  style={{ justifyContent: "right", marginLeft: "10px" }}
                >
                  <label
                    htmlFor="docente"
                    className="text-3xl font-medium w-auto min-w-min"
                    style={{ marginLeft: "50px", marginRight: "20px" }}
                  >
                    Tipo Anexo:
                  </label>
                  <Dropdown
                    id="docente"
                    name="docente"
                    placeholder="Seleccione el Tipo de Anexo"
                    //options={opcionesDocente}
                  />
                </div>
              </div>
              <div
                className="flex flex-column flex-wrap gap-4"
                style={{ paddingRight: "25px", paddingBottom: "20px" }}
              >
                <div
                  className="flex flex-wrap w-full h-full "
                  style={{ justifyContent: "right", marginLeft: "10px" }}
                >
                  <label
                    htmlFor="nombre"
                    className="text-3xl font-medium w-auto min-w-min"
                  >
                    Nombres:
                  </label>
                  <InputText
                    className="text-2xl"
                    placeholder="Ingrese los Nombres"
                    id="nombre"
                    name="nombre"
                    style={{
                      width: "221px",
                      justifyContent: "right",
                      marginLeft: "10px",
                    }}
                    /*onChange={(e) =>
                        setFormData({
                          ...formData,
                          persona: {
                            ...formData.persona,
                            nombresPersona: e.currentTarget.value,
                          },
                        })
                      }
                      value={formData.persona?.nombresPersona ?? ""}*/
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
              <th>Tipo de Anexo</th>
              <th>Observaciones</th>
              <th>Operaciones</th>
            </tr>
          </thead>
        </table>
      </Card>
    </Fieldset>
  );
}

export default Anexo;
