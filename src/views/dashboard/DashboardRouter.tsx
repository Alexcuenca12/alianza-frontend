import { Route, Redirect, Switch } from "react-router-dom";
import Home from "./home/Home";
import { Toast } from "primereact/toast";
import React, { useRef } from "react";
import Footer from "../../common/Footer";
import {
  FcHome,
  FcBusinessman,
  FcExport,
  FcGraduationCap,
  FcViewDetails,
  FcPodiumWithSpeaker,
  FcLike,
  FcElectricalThreshold,
  FcInspection,
} from "react-icons/fc";
import { FaUserCircle, FaChalkboardTeacher } from "react-icons/fa";
import { MdFamilyRestroom } from "react-icons/md";
import { SideBarMenuCard, SideBarMenuItem } from "../../interfaces/types";
import { SideBarMenu } from "../../common/SideBar/SideBarMenu";
import FichaInscripcionContext from "../../views/FichaInscripcion/FichaInscripcion";
import FichaSalud from "../../views/FichaSalud/FichaSalud";
import FichaPersonal from "../FichaPersonal/FichaPersonal";
import FichaFamiliar from "../FichaFamiliar/FichaFamiliar";
import FichaEducativa from "../FichaEducativa/FichaEducativa";
import FichaDesvinculacion from "../FichaDesvinculacion/FichaDesvinculacion";
import FichaRepresentante from "../FichaRepresentante/FichaRepresentante";
import Usuario from "../Usuario/Usuario";
import Curso from "../Curso/Curso";
import Reporte from "../Reportes/Reporte";
import Asistencia from "../Asistencia/Asistencia";


export const DashboardRouter = () => {
  //Datos del sessionStorage
  const userData = sessionStorage.getItem("user");
  const userObj = JSON.parse(userData || "{}");
  const rol = userObj.rol;
  const perData = sessionStorage.getItem("datos");
  const perObj = JSON.parse(perData || "{}");
  /*const userId = userObj.id as number;*/
  const toast = useRef<Toast>(null);

  const items: SideBarMenuItem[] = [
    {
      id: "1",
      label: "Home",
      icon: FcHome,
      url: "/home",
    },
    {
      id: "2",
      label: "Ficha Personal",
      icon: FcBusinessman,
      url: "/personal",
    },
    {
      id: "3",
      label: "Ficha de Inscripción",
      icon: FcViewDetails,
      url: "/inscripción",
    },

    {
      id: "4",
      label: "Ficha Medica",
      icon: FcLike,
      url: "/salud",
    },
    {
      id: "5",
      label: "Ficha Educativa",
      icon: FcGraduationCap,
      url: "/educar",
    },
    {
      id: "6",
      label: "Ficha del Representante",
      icon: FcPodiumWithSpeaker,
      url: "/representante",
    },
    {
      id: "7",
      label: "Ficha Familiar",
      icon: MdFamilyRestroom,
      url: "/familiar",
    },
    {
      id: "8",
      label: "Ficha de Desvinculación",
      icon: FcExport,
      url: "/desvinculacion",
    },
    {
      id: "9",
      label: "Asistencia",
      icon: FcInspection,
      url: "/asistencia",
    },
    {
      id: "10",
      label: "Aula",
      icon: FaChalkboardTeacher,
      url: "/aula",
    },
    {
      id: "11",
      label: "Usuario",
      icon: FaUserCircle,
      url: "/usuario",
    },

    {
      id: "12",
      label: "Reportes",
      icon: FcElectricalThreshold,
      url: "/reporte",
    },
  ];


  function getItemsForUser(): SideBarMenuItem[] {
    // alert(userObj.rol)
    if (rol === 1) {
      // Si el usuario tiene ID 1, muestra todo el menu
      return items;
    } else if (rol === 2) {
      // Si el usuario tiene ID 2, muestra ciertos elementos
      return items.filter(item => item.id === "1" || item.id === "12");
    } else if (rol === 3) {
      // Si el usuario tiene ID 2, muestra ciertos elementos
      return items.filter(item => item.id === "1" || item.id === "9");
    }
    // Agrega lógica para otros casos aquí

    // Si no coincide con ningún caso, devuelve una lista vacía
    return [];
  }

  const card: SideBarMenuCard = {
    id: "card001",
    displayName: userObj.rol === 1
      ? "Encargado/Administrador"
      : userObj.rol === 2
        ? "Secretaria/Administrativo"
        : userObj.rol === 3
          ? "Docente"
          : "Sin rol asignado",
    title: perObj.apellidosPersona + " " + perObj.nombresPersona,

    photoUrl:
      "https://falianza.org.ec/wp-content/uploads/2020/12/Recurso-1@1000x.png",
    url: "/",
  };
  return (
    <>
      <Toast ref={toast} />
      <main>
        <div>
          <div>
            <Switch>
              <Route path="/dashboard/home">
                <>
                  <SideBarMenu
                    items={getItemsForUser()}
                    card={card}
                    bodyComponent={<Home />}
                    footerComponent={<Footer />}
                  />
                </>
              </Route>
              <Route path="/login">
                <SideBarMenu
                  items={getItemsForUser()}
                  card={card}
                  bodyComponent={<Home />}
                  footerComponent={<Footer />}
                />

              </Route>
              <Route path="/inscripción">
                <>
                  <SideBarMenu
                    items={getItemsForUser()}
                    card={card}
                    bodyComponent={<FichaInscripcionContext />}
                    footerComponent={<Footer />}
                  />
                </>

              </Route>
              <Route path="/salud">
                <>
                  <SideBarMenu
                    items={getItemsForUser()}
                    card={card}
                    bodyComponent={<FichaSalud />}
                    footerComponent={<Footer />}
                  />
                </>

              </Route>
              <Route path="/personal">
                <>
                  <SideBarMenu
                    items={getItemsForUser()}
                    card={card}
                    bodyComponent={<FichaPersonal />}
                    footerComponent={<Footer />}
                  />
                </>

              </Route>
              <Route path="/familiar">
                <>
                  <SideBarMenu
                    items={getItemsForUser()}
                    card={card}
                    bodyComponent={<FichaFamiliar />}
                    footerComponent={<Footer />}
                  />
                </>

              </Route>
              <Route path="/educar">

                <>
                  <SideBarMenu
                    items={getItemsForUser()}
                    card={card}
                    bodyComponent={<FichaEducativa />}
                    footerComponent={<Footer />}
                  />
                </>

              </Route>
              <Route path="/desvinculacion">
                <>
                  <SideBarMenu
                    items={getItemsForUser()}
                    card={card}
                    bodyComponent={<FichaDesvinculacion />}
                    footerComponent={<Footer />}
                  />
                </>

              </Route>
              <Route path="/representante">
                <>
                  <SideBarMenu
                    items={getItemsForUser()}
                    card={card}
                    bodyComponent={<FichaRepresentante />}
                    footerComponent={<Footer />}
                  />
                </>

              </Route>
              <Route path="/usuario">
                <>
                  <SideBarMenu
                    items={getItemsForUser()}
                    card={card}
                    bodyComponent={<Usuario />}
                    footerComponent={<Footer />}
                  />
                </>

              </Route>
              <Route path="/aula">
                <>
                  <SideBarMenu
                    items={getItemsForUser()}
                    card={card}
                    bodyComponent={<Curso />}
                    footerComponent={<Footer />}
                  />
                </>

              </Route>
              <Route path="/reporte">
                <>
                  <SideBarMenu
                    items={getItemsForUser()}
                    card={card}
                    bodyComponent={<Reporte />}
                    footerComponent={<Footer />}
                  />
                </>

              </Route>
              <Route path="/asistencia">
                <>
                  <SideBarMenu
                    items={getItemsForUser()}
                    card={card}
                    bodyComponent={<Asistencia />}
                    footerComponent={<Footer />}
                  />
                </>
              </Route>
              <Route path="*">
                <SideBarMenu
                  items={getItemsForUser()}
                  card={card}
                  bodyComponent={<Home />}
                  footerComponent={<Footer />}
                />

                <Redirect to="/dashboard/home" />
              </Route>
            </Switch>
          </div>
        </div>
      </main>
    </>
  );
};
