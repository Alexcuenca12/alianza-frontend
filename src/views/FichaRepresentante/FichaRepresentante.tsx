import React, { useEffect, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Fieldset } from "primereact/fieldset";
import { Card } from "primereact/card";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import cardHeader from "../../shared/CardHeader";
import { Divider } from "primereact/divider";
import { IFichaRepresentante } from "../../interfaces/IFichaRepresentante";
import { FichaRepresentanteService } from "../../services/FichaRepresentanteService";
import swal from "sweetalert";
import { InputTextarea } from "primereact/inputtextarea";
import '../../styles/FiltroFichas.css'
import '../../styles/Fichas.css'
import { FichaPersonalService } from "../../services/FichaPersonalService";
import { IFichaPersonal } from "../../interfaces/IFichaPersonal";
import { IExcelReportParams, IHeaderItem } from "../../interfaces/IExcelReportParams";
import { ReportBar } from "../../common/ReportBar";
import { Calendar, CalendarChangeEvent } from 'primereact/calendar';
import toast, { Toaster } from "react-hot-toast";
import { calcularEdad } from "../../services/functions/calcularEdad";



function FichaInscripcionContext() {
  //Session Storage
  /*const userData = sessionStorage.getItem("user");
  const userObj = JSON.parse(userData || "{}");
  const idPersona = userObj.id;*/
  const fichaPersonalService = new FichaPersonalService();

  const [busqueda, setBusqueda] = useState<string>('');
  const [foto, setFoto] = useState<string>('https://cdn-icons-png.flaticon.com/128/666/666201.png');
  const [listFperonales, setListFperonales] = useState<IFichaPersonal[]>([]);
  const [excelReportData, setExcelReportData] = useState<IExcelReportParams | null>(null);




  const [contra1, setcontra1] = useState<IFichaRepresentante[]>([]);
  const [formData, setFormData] = useState<IFichaRepresentante>({
    idFichaRepresentante: 0,
    nombresRepre: "",
    apellidosRepre: "",
    cedulaRepre: "",
    contactoRepre: "",
    contactoEmergenciaRepre: "",
    fechaNacimientoRepre: "",
    ocupacionPrimariaRepre: "",
    ocupacionSecundariaRepre: "",
    lugarTrabajoRepre: "",
    observacionesRepre: "",
    nivelInstruccionRepre: "",
    parentescoRepre: "",
    fichaPersonal: null,
    fechaRegistro: new Date,
    genero: '',
    nacionalidad: '',
    tipoIdentificacion: '',

  });

  const fileUploadRef = useRef<FileUpload>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<number | undefined>(undefined);
  const repreService = new FichaRepresentanteService();

  const tipoDocumentoOpc = [
    { label: "Cédula", value: "Cédula" },
    { label: "Pasaporte", value: "Pasaporte" },
  ];

  const nivelInstrucOpc = [
    { label: "Sin Instrucción", value: "Sin Instrucción" },
    { label: "Educación Primaria", value: "Educación Primaria" },
    { label: "Educación Secundaria", value: "Educación Secundaria" },
    { label: "Bachillerato o Educación Media", value: "Bachillerato o Educación Media" },
    { label: "Tercer nivel o Educación Superior", value: "Tercer nivel o Educación Superior" },
    { label: "Cuarto nivel", value: "Cuarto nivel" },
  ];

  const loadData = () => {
    repreService
      .getAll()
      .then((data) => {
        setcontra1(data);
        loadExcelReportData(data);
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

    if (validaciones()) {
      repreService
        .save(formData)
        .then((response) => {
          loadDataID(response.fichaPersonal?.idFichaPersonal);

          resetForm();
          resetFiltro();
          swal("Publicacion", "Datos Guardados Correctamente", "success");
          if (fileUploadRef.current) {
            fileUploadRef.current.clear();
          }
        })
        .catch((error) => {
          console.error("Error al enviar el formulario:", error);
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
          repreService
            .delete(id)
            .then(() => {
              setcontra1(
                contra1.filter((contra) => contra.idFichaRepresentante !== id)
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
        (contra) => contra.idFichaRepresentante === id
      );
      if (editItem) {
        setFormData(editItem);
        resetFiltro();
        setEditMode(true);
        setEditItemId(id);

        setBusqueda(editItem.fichaPersonal?.ciPasaporte ?? "");
        setFoto(editItem.fichaPersonal?.foto ?? '')


        if (editItem.fichaPersonal !== null) {

          const editItemWithLabel = {
            ...editItem,
            fichaPersonal: {
              ...editItem.fichaPersonal,
              label: `${editItem.fichaPersonal.ciPasaporte} || ${editItem.fichaPersonal.apellidos} ${editItem.fichaPersonal.nombres}`,
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
      if (validaciones()) {
        repreService
          .update(Number(editItemId), formData as IFichaRepresentante)
          .then((response) => {
            swal({
              title: "Publicaciones",
              text: "Datos actualizados correctamente",
              icon: "success",
            });
            setFormData({
              nombresRepre: "",
              apellidosRepre: "",
              cedulaRepre: "",
              contactoRepre: "",
              contactoEmergenciaRepre: "",
              fechaNacimientoRepre: "",
              ocupacionPrimariaRepre: "",
              ocupacionSecundariaRepre: "",
              lugarTrabajoRepre: "",
              observacionesRepre: "",
              nivelInstruccionRepre: "",
              parentescoRepre: "",
              fichaPersonal: null,
              fechaRegistro: new Date,
              genero: '',
              nacionalidad: '',
              tipoIdentificacion: '',

            });
            resetForm();
            resetFiltro();
            loadDataID(response.fichaPersonal?.idFichaPersonal);
            setEditMode(false);
            setEditItemId(undefined);
          })
          .catch((error) => {
            console.error("Error al actualizar el formulario:", error);
          });
      }

    }
  };

  function validaciones(): boolean {

    if (!formData.fichaPersonal?.idFichaPersonal) {
      toast.error("Seleccione al propietario de la ficha", {
        style: {
          fontSize: '15px'
        },
        duration: 3000,
      })
      return false
    }

    if (!formData.tipoIdentificacion) {
      toast.error("Seleccione el tipo de identificacion", {
        style: {
          fontSize: '15px'
        },
        duration: 3000,
      })
      return false
    }

    if (!formData.cedulaRepre) {
      toast.error("Ingrese su documento de identidad", {
        style: {
          fontSize: '15px'
        },
        duration: 3000,
      })
      return false
    }

    if (!formData.parentescoRepre) {
      toast.error("Especifique el parentesco", {
        style: {
          fontSize: '15px'
        },
        duration: 3000,
      })
      return false
    }

    if (!formData.nombresRepre) {
      toast.error("Por favor, ingrese los nombres", {
        style: {
          fontSize: '15px'
        },
        duration: 3000,
      })
      return false
    }


    if (!formData.apellidosRepre) {
      toast.error("Por favor, ingrese los apellidos", {
        style: {
          fontSize: '15px'
        },
        duration: 3000,
      })
      return false
    }

    if (!formData.fechaNacimientoRepre) {
      toast.error("Por favor, ingrese la fecha de nacimiento", {
        style: {
          fontSize: '15px'
        },
        duration: 3000,
      })
      return false
    }

    if (!formData.genero) {
      toast.error("Por favor, seleccione el genero", {
        style: {
          fontSize: '15px'
        },
        duration: 3000,
      })
      return false
    }

    if (!formData.nacionalidad) {
      toast.error("Por favor, ingrese la nacionalidad", {
        style: {
          fontSize: '15px'
        },
        duration: 3000,
      })
      return false
    }


    if (!formData.nivelInstruccionRepre) {
      toast.error("Por favor, seleccione el nivel de intruccion", {
        style: {
          fontSize: '15px'
        },
        duration: 3000,
      })
      return false
    }


    if (!formData.lugarTrabajoRepre) {
      toast.error("Introduzca el lugar de trabajo", {
        style: {
          fontSize: '15px'
        },
        duration: 3000,
      })
      return false
    }


    if (!formData.ocupacionPrimariaRepre) {

      toast.error("Ingrese la ocupacion del representante", {
        style: {
          fontSize: '15px'
        },
        duration: 3000,
      })
      return false
    }


    if (!formData.contactoRepre) {
      toast.error("Por favor, ingrese un número de contacto", {
        style: {
          fontSize: '15px'
        },
        duration: 3000,
      })
      return false
    }

    if (!formData.contactoEmergenciaRepre) {
      toast.error("Por favor, ingrese un número de emergencia", {
        style: {
          fontSize: '15px'
        },
        duration: 3000,
      })
      return false
    }


    if (!formData.observacionesRepre) {
      toast('No ha introducido observaciones', {
        icon: '⚠️',
        style: {
          fontSize: '15px'

        },
        duration: 4000,
      });
    }

    return true

  }

  const resetForm = () => {
    setFormData({
      nombresRepre: "",
      apellidosRepre: "",
      cedulaRepre: "",
      contactoRepre: "",
      contactoEmergenciaRepre: "",
      fechaNacimientoRepre: "",
      ocupacionPrimariaRepre: "",
      ocupacionSecundariaRepre: "",
      lugarTrabajoRepre: "",
      observacionesRepre: "",
      nivelInstruccionRepre: "",
      parentescoRepre: "",
      fichaPersonal: null,
      fechaRegistro: new Date,
      genero: '',
      nacionalidad: '',
      tipoIdentificacion: '',

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
          label: `${object.ciPasaporte} || ${object.apellidos} ${object.nombres}`,
        }));

        setListFperonales(dataWithLabel); // Establecer los datos procesados en el estado
        // setDataLoaded(true); // Puedes marcar los datos como cargados si es necesario
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });



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

  function loadExcelReportData(data: IFichaRepresentante[]) {
    const reportName = "Ficha del Representante"
    const logo = 'G1:I1'
    const rowData = data.map((item) => (
      {
        idFicha: item.idFichaRepresentante,
        tipoIdentificacionNNA: item.fichaPersonal?.tipoIdentificacion,
        cedulaNNA: item.fichaPersonal?.ciPasaporte,
        nombresNNA: item.fichaPersonal?.nombres,
        apellidosNNA: item.fichaPersonal?.apellidos,
        division: '||',
        tipoIdentificacion: item.tipoIdentificacion || '',
        cedula: item.cedulaRepre,
        nombres: item?.nombresRepre,
        apellidos: item?.apellidosRepre,
        parentesco: item.parentescoRepre,
        nacimiento: item.fechaNacimientoRepre,
        edad: calcularEdad(item.fechaNacimientoRepre),
        genero: item.genero,
        nacionalidad: item.nacionalidad,
        nivelInstruccion: item.nivelInstruccionRepre,
        trabajo: item.lugarTrabajoRepre,
        ocupacion: item.ocupacionPrimariaRepre,
        ocupacionSec: item.ocupacionSecundariaRepre,
        contacto: item.contactoRepre,
        contactoEmerg: item.contactoEmergenciaRepre,
        observaciones: item.observacionesRepre || 'Ninguna',
      }
    ));
    const headerItems: IHeaderItem[] = [
      { header: "№ FICHA" },
      { header: "TIPO DE IDENTIFICACION (REPRESENTADO)" },
      { header: "(REPRESENTADO) CEDULA/PASAPORTE" },
      { header: "(REPRESENTADO) NOMBRES" },
      { header: "(REPRESENTADO) APELLIDOS" },
      { header: "||" },
      { header: "TIPO DE IDENTIFICACION" },
      { header: "CEDULA/PASAPORTE" },
      { header: "NOMBRES" },
      { header: "APELLIDOS" },
      { header: "PARENTESCO" },
      { header: "FECHA DE NACIMIENTO" },
      { header: "EDAD" },
      { header: "GENERO" },
      { header: "NACIONALIDAD" },
      { header: "NIVEL DE INSTRUCCION" },
      { header: "LUGAR DE TRABAJO" },
      { header: "OCUPACIÓN" },
      { header: "OCUPACION SECUNDARIA" },
      { header: "№ DE CONTACTO" },
      { header: "№ DE EMERGENCIA" },
      { header: "OBSERVACIONES" },


    ]
    console.log(reportName, '  //  ',
      headerItems, '  //  ',
      rowData)

    setExcelReportData({
      reportName,
      headerItems,
      rowData,
      logo
    }
    )
  }

  const loadDataID = (id: number) => {
    setcontra1([]);
    repreService
      .getBusquedaID(id)
      .then((data) => {
        setcontra1(data);
        loadExcelReportData(data);
        setDataLoaded(true); // Marcar los datos como cargados
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  };



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
          style={{ marginBottom: "35px", maxWidth: "1150px" }}
        >
          <div
            className="h1-rem"
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <h1 className="text-5xl font-smibold lg:md-2 h-full max-w-full max-h-full min-w-min">
              Ficha del Representante
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

                        // onKeyUp={(e) => {
                        //   setListFperonales([]); // Asignar un arreglo vacío para vaciar el estado listFperonales

                        //   setBusqueda(e.currentTarget.value);

                        //   // Luego, llamar a loadRelacion después de que se actualice el estado
                        //   loadRelacion(); // Llama a tu método aquí o realiza las acciones necesarias.
                        // }}

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
                            ciPasaporte: '',
                            tipoIdentificacion: '',
                            actTrabInfantil: false,
                            detalleActTrabInfantil: '',
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
                            estVinculacion: true,
                            fechaRegistro: new Date()
                          }
                        });
                        cargarFoto(parseInt(e.value))
                        loadDataID(parseInt(e.value))
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

            <form onSubmit={editMode ? handleUpdate : handleSubmit} className='form' encType="multipart/form-data">

              <Divider align="left">
                <div className="inline-flex align-items-center">
                  <i className="pi pi-book mr-2"></i>
                  <b>Formulario </b>
                </div>
              </Divider>

              <div className='column' style={{}}>
                <div className='column' style={{ width: "30.3%" }}>
                  <div className='input-box' style={{}}>
                    <label className="font-medium w-auto min-w-min" htmlFor="tipoDocumento">
                      Tipo de documento:
                    </label>
                    <div className=" " style={{ width: "100%" }}>
                      <Dropdown
                        className="text-2xl"
                        id="tiempo_dedicacion"
                        name="tiempo_dedicacion"
                        style={{ width: "100%", height: "36px", alignItems: "center" }}
                        options={tipoDocumentoOpc}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tipoIdentificacion: e.value, cedulaRepre: ''
                          })
                        }
                        value={formData.tipoIdentificacion}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Seleccione el tipo de documento de identificación"
                      />


                    </div>

                  </div>
                </div>

                <div className='column' style={{ width: "30.3%" }}>
                  <div className='input-box' >
                    <label className="font-medium w-auto min-w-min" htmlFor="cedula">
                      {!formData.tipoIdentificacion
                        ? 'Debe seleccionar el tipo de identificaicon:'
                        : formData.tipoIdentificacion === 'Cédula'
                          ? 'Cédula:'
                          : 'Pasaporte:'}
                    </label>

                    <InputText
                      placeholder={!formData.tipoIdentificacion
                        ? 'Se habilitara cuando seleccione el tipo de identificaicon'
                        : formData.tipoIdentificacion === 'Cédula'
                          ? 'Ingrese el numero de cédula:'
                          : 'Ingrese el numero de pasaporte:'}
                      id="cedula"
                      disabled={!formData.tipoIdentificacion}
                      maxLength={formData.tipoIdentificacion === 'Cédula'
                        ? 10
                        : 1000} // Establecer el máximo de 10 caracteres
                      keyfilter="pint" // Solo permitir dígitos enteros positivos
                      onChange={(e) => setFormData({ ...formData, cedulaRepre: e.target.value })}
                      title="Ingresar el documento de identidad del NNA"
                      value={formData.cedulaRepre}
                    />
                    <span className="input-border"></span>

                  </div>
                </div>

                <div className='column' style={{ width: "30.3%", }}>
                  <div className='input-box' >
                    <label className="font-medium w-auto min-w-min" htmlFor="cedula;">
                      Parentesco:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="parentescoRepre"
                      name="parentescoRepre"
                      keyfilter={/^[A-Za-z\s]*$/} // Solo permitir caracteres 
                      placeholder="Ingrese el Parentesco"
                      required
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          parentescoRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.parentescoRepre}
                    />
                    <span className="input-border"></span>

                  </div>

                </div>

              </div>
              <div className='column' style={{}}>
                <div className='column' style={{ width: "30.3%", }}>
                  <div className='input-box' >
                    <label className="font-medium w-auto min-w-min" htmlFor="cedula;">
                      Nombres Representante:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="inicio"
                      name="centro"
                      keyfilter={/^[A-Za-z\s]*$/} // Solo permitir caracteres 
                      placeholder="Ingrese los Nombres del Representate"
                      required
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nombresRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.nombresRepre}
                    />
                  </div>
                </div>

                <div className='column' style={{ width: "30.3%", }}>
                  <div className='input-box' >
                    <label className="font-medium w-auto min-w-min" htmlFor="cedula;">
                      Apellidos Representante:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="apellidosRepre"
                      name="apellidosRepre"
                      keyfilter={/^[A-Za-z\s]*$/} // Solo permitir caracteres 
                      required
                      placeholder="Ingrese los Apellidos del Representante"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          apellidosRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.apellidosRepre}
                    />
                  </div>
                </div>

                <div className='column' style={{ width: "30.3%", }}>
                  <div className='input-box'
                    style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <label htmlFor="fechaDesvinculacion" className="font-medium w-auto min-w-min">
                      Fecha de Nacimiento:
                    </label>
                    <Calendar
                      className="text-2xl"
                      id="fechaNacimientoRepre"
                      style={{ width: "100%" }}
                      name="fechaNacimientoRepre"
                      placeholder="Ingrese la fecha de nacimiento"
                      required
                      dateFormat="dd-mm-yy" // Cambiar el formato a ISO 8601
                      showIcon
                      maxDate={new Date()}
                      onChange={(e) => {
                        const selectedDate =
                          e.value instanceof Date ? e.value : null;
                        const formattedDate = selectedDate
                          ? selectedDate.toISOString().split("T")[0]
                          : "";
                        setFormData({
                          ...formData,
                          fechaNacimientoRepre: formattedDate,
                        });
                      }}
                      value={
                        formData.fechaNacimientoRepre
                          ? new Date(formData.fechaNacimientoRepre)
                          : null
                      }
                    />
                  </div>
                </div>

              </div>
              <div className='column' style={{}}>
                <div className='column' style={{ width: "30.3%", }}>
                  <div className="input-box">
                    <label className="font-medium w-auto min-w-min" htmlFor='genero'>Genero:</label>


                    <div className="mydict">
                      <div>
                        <label>
                          <input
                            className="input"
                            type="radio"
                            id="genMasculino"
                            name="masculino"
                            value="Masculino"
                            checked={formData.genero === 'Masculino'}
                            onChange={(e) => setFormData({ ...formData, genero: e.target.value })}

                          />
                          <span>Masculino</span>
                        </label>
                        <label>
                          <input
                            className="input"
                            type="radio"
                            id="genFemenino"
                            name="femenino"
                            value="Femenino"
                            checked={formData.genero === 'Femenino'}
                            onChange={(e) => setFormData({ ...formData, genero: e.target.value })}

                          />
                          <span>Femenino</span>
                        </label>
                      </div>
                    </div>

                  </div >
                </div>

                <div className='column' style={{ width: "30.3%", }}>
                  <div className='input-box' style={{}}>
                    <label className="font-medium w-auto min-w-min" htmlFor="nacionalidad">Nacionalidad:</label>

                    <InputText
                      className="input"
                      placeholder=' Ingresar la nacionalidad'
                      id="nacionalidad"
                      keyfilter="alpha" // Solo permitir caracteres alfabeticos
                      onChange={(e) => setFormData({ ...formData, nacionalidad: e.target.value })}
                      title="Ingresar la nacionalidad del NNA"
                      value={formData.nacionalidad}
                    />
                    <span className="input-border"></span>

                  </div>
                </div>

                <div className='column' style={{ width: "30.3%", }}>
                  <div className='input-box'>
                    <label className="font-medium w-auto min-w-min" htmlFor="provincia">Nivel de Instruccion:</label>
                    <div className=" ">

                      <div className="flex justify-content-center">
                        <Dropdown
                          value={formData.nivelInstruccionRepre}
                          onChange={(e: DropdownChangeEvent) => {
                            setFormData({ ...formData, nivelInstruccionRepre: e.value });

                          }}
                          options={nivelInstrucOpc}
                          optionLabel="label"
                          optionValue="value"
                          placeholder="Seleccione el nivel de instrucción"
                          style={{ width: "100%", height: "36px", alignItems: "center" }}
                        />
                        <span className="input-border"></span>

                      </div>

                    </div>
                  </div>
                </div>

              </div>
              <div className='column' style={{}}>
                <div className='column' style={{ width: "30.3%", }}>
                  <div className='input-box' >
                    <label className="font-medium w-auto min-w-min" htmlFor="cedula;">
                      Lugar de Trabajo:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="lugarTrabajoRepre"
                      name="lugarTrabajoRepre"
                      required
                      placeholder="Ingrese el Lugar de Trabajo"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lugarTrabajoRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.lugarTrabajoRepre}
                    />
                  </div>
                </div>

                <div className='column' style={{ width: "30.3%", }}>
                  <div className='input-box' >
                    <label className="font-medium w-auto min-w-min" htmlFor="cedula;">
                      Ocupación:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="ocupacionPrimariaRepre"
                      name="ocupacionPrimariaRepre"
                      placeholder="Ingrese la Ocupación del Representante"
                      required
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ocupacionPrimariaRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.ocupacionPrimariaRepre}
                    />
                  </div>
                </div>

                <div className='column' style={{ width: "30.3%", }}>
                  <div className='input-box' >
                    <label className="font-medium w-auto min-w-min" htmlFor="cedula;">
                      Ocupación Secundaria:
                    </label>
                    <InputText
                      className="text-2xl"
                      id="ocupacionSecundariaRepre"
                      name="ocupacionSecundariaRepre"
                      required
                      placeholder="Ingrese la Ocupación Secundaria del Representante"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ocupacionSecundariaRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.ocupacionSecundariaRepre}
                    />
                  </div>
                </div>

              </div>
              <div className='column' style={{}}>
                <div className='column' style={{ width: "30.3%", }}>
                  <div className='input-box' >
                    <label className="font-medium w-auto min-w-min" htmlFor="cedula;">
                      Número de Contacto:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese el nº de Contacto"
                      id="contactoRepre"
                      name="contactoRepre"
                      keyfilter={/^[\d\s+]*$/}
                      style={{}}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactoRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.contactoRepre}
                    />
                  </div>
                </div>

                <div className='column' style={{ width: "30.3%", }}>
                  <div className='input-box' >
                    <label className="font-medium w-auto min-w-min" htmlFor="cedula;">
                      Número de Emergencia:
                    </label>
                    <InputText
                      className="text-2xl"
                      placeholder="Ingrese el nº de emergencia"
                      id="contactoEmergenciaRepre"
                      name="contactoEmergenciaRepre"
                      keyfilter={/^[\d\s+]*$/}
                      style={{}}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactoEmergenciaRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.contactoEmergenciaRepre}
                    />
                  </div>
                </div>

                <div className='column' style={{ width: "30.3%", }}>
                  <div className='input-box' style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingBottom: '35px' }}>
                    <label className="font-medium w-auto min-w-min" htmlFor="cedula;">
                      Observaciones:
                    </label>
                    <InputTextarea
                      className="text-2xl"
                      id="observacionesRepre"
                      name="observacionesRepre"
                      style={{ width: "100%" }}
                      required
                      placeholder="Observaciones"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          observacionesRepre: e.currentTarget.value,
                        })
                      }
                      value={formData.observacionesRepre}
                    />
                  </div>
                </div>

              </div>
              <div className='btnSend' style={{ marginTop: "1px" }}>
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
                      resetFiltro();
                      setEditMode(false);

                    }} />
                </div>
              </div>
            </form>
          </section>

          <Divider align="left" style={{ marginBottom: "0px" }}>
            <div className="inline-flex align-items-center">
              <i className="pi pi-list mr-2"></i>
              <b>Lista</b>
            </div>
          </Divider>

          <div className="opcTblLayout" >
            <div className="" style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>

              <div className="opcTbl" style={{ justifyContent: "right" }} >
                <label className="font-medium w-auto min-w-min" htmlFor='estado'>Cargar todo:</label>

                <Button className="buttonIcon" // Agrega una clase CSS personalizada
                  icon="pi pi-refresh" style={{ width: "120px", height: "39px" }}
                  severity="danger" aria-label="Cancel" onClick={() => { loadData(); resetFiltro(); }}
                />

              </div>
              <ReportBar
                reportName={excelReportData?.reportName!}
                headerItems={excelReportData?.headerItems!}
                rowData={excelReportData?.rowData!}
                logo={excelReportData?.logo!}
              />
            </div>
          </div>

          <div className="tblContainer" >
            <table className="tableFichas">
              <thead className="theadTab" >

                <tr style={{ backgroundColor: "#871b1b", color: "white" }}>
                  <th className="trFichas">Nº Ficha</th>
                  <th className="trFichas">Reprensentado</th>
                  <th className="trFichas">||</th>
                  <th className="trFichas">Representante</th>
                  <th className="trFichas">Cedula/Pasaporte</th>
                  <th className="trFichas">Parentesco</th>
                  <th className="trFichas">Edad</th>
                  <th className="trFichas">Lugar de trabajo</th>
                  <th className="trFichas">Contacto</th>
                  <th className="trFichas">Contacto de emergencia</th>
                  <th className="trFichas">Ocupacion</th>
                  <th className="trFichas">Editar</th>
                  <th className="trFichas">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {contra1.map((contrato) => (
                  <tr
                    className="text-center"
                    key={contrato.idFichaRepresentante?.toString()}
                  >
                    <td className="tdFichas">{contrato.idFichaRepresentante}</td>
                    <td className="tdFichas">{`${contrato.fichaPersonal?.nombres} ${contrato.fichaPersonal?.apellidos}`}</td>
                    <td className="tdFichas">||</td>
                    <td className="tdFichas">{`${contrato.nombresRepre} ${contrato.apellidosRepre}`}</td>
                    <td className="tdFichas">{contrato.cedulaRepre}</td>
                    <td className="tdFichas">{contrato.parentescoRepre}</td>
                    <td className="tdFichas">{calcularEdad(contrato.fechaNacimientoRepre)}</td>
                    <td className="tdFichas">{contrato.lugarTrabajoRepre}</td>
                    <td className="tdFichas">{contrato.contactoRepre}</td>
                    <td className="tdFichas">{contrato.contactoEmergenciaRepre}</td>
                    <td className="tdFichas">{contrato.ocupacionPrimariaRepre}</td>

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
                        onClick={() =>
                          handleEdit(contrato.idFichaRepresentante?.valueOf())
                        }
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
                        onClick={() =>
                          handleDelete(contrato.idFichaRepresentante?.valueOf())
                        }
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

export default FichaInscripcionContext;
