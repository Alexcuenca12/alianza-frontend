import { Route, Redirect, Switch } from "react-router-dom";
import Home from "./home/Home";
import { Toast } from "primereact/toast";
import React, { useRef } from "react";
import Footer from "../../common/Footer";
import { FcDocument } from "react-icons/fc";
import { FcHome } from "react-icons/fc";
import { FcExport } from "react-icons/fc";
import { FcGraduationCap } from "react-icons/fc";
import { FcPortraitMode } from "react-icons/fc";
import { FcConferenceCall } from "react-icons/fc";
import { FcElectricalThreshold } from "react-icons/fc";
import { FcLike } from "react-icons/fc";
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
import Reporte from "../Reportes/Reporte";

import "../../styles/DashBoard.css"

export const DashboardRouter = () => {
  //Datos del sessionStorage
  const userData = sessionStorage.getItem("user");
  const userObj = JSON.parse(userData || "{}");
  const rol = userObj.rol;
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
      label: "Ficha de Inscripción",
      icon: FcDocument,
      url: "/inscripción",
    },
    {
      id: "3",
      label: "Ficha Personal",
      icon: FcPortraitMode,
      url: "/personal",
    },
    {
      id: "4",
      label: "Ficha Salud",
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
      label: "Ficha Representante",
      icon: FcConferenceCall,
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
      label: "Reportes",
      icon: FcElectricalThreshold,
      url: "/reporte",
    },

  ];

  const card: SideBarMenuCard = {
    id: "card001",
    displayName: "Fundación Alianza",
    title: "Administrador",
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
                {rol === 1 ? (
                  <>
                    <SideBarMenu items={items} card={card} />
                    <Home />
                  </>
                ) : rol === 2 ? (
                  <>
                    <SideBarMenu items={items} card={card} />
                    <Home />
                  </>
                ) : (
                  <>
                    <SideBarMenu items={items} card={card} />
                  </>
                )}
              </Route>

              <Route path="/login">
                {rol === 1 ? (
                  <SideBarMenu items={items} card={card} />
                ) : rol === 2 ? (
                  <SideBarMenu items={items} card={card} />
                ) : (
                  <SideBarMenu items={items} card={card} />
                )}
              </Route>
              <Route path="/inscripción">
                {rol === 1 ? (
                  <>
                    <SideBarMenu items={items} card={card} />
                    <FichaInscripcionContext />
                    <Footer />
                  </>
                ) : rol === 2 ? (
                  <>
                    <SideBarMenu items={items} card={card} />
                  </>
                ) : (
                  <SideBarMenu items={items} card={card} />
                )}
              </Route>
              <Route path="/salud">
                {rol === 1 ? (
                  <>
                    <SideBarMenu items={items} card={card} />
                    <FichaSalud />
                    <Footer />
                  </>
                ) : rol === 2 ? (
                  <>
                    <SideBarMenu items={items} card={card} />
                  </>
                ) : (
                  <SideBarMenu items={items} card={card} />
                )}
              </Route>

              <Route path="/personal">
                {rol === 1 ? (
                  <>
                    <section className="layout">
                      <div className="sidebar">
                        <SideBarMenu items={items} card={card} />
                      </div>
                      <div className="body">
                        <FichaPersonal />
                      </div>

                    </section>
                    <div className="footer">
                      <Footer />
                    </div>
                  </>
                ) : rol === 2 ? (
                  <>
                    <SideBarMenu items={items} card={card} />
                  </>
                ) : (
                  <SideBarMenu items={items} card={card} />
                )}
              </Route>

              <Route path="/familiar">
                {rol === 1 ? (
                  <>
                    <div className="estructura">
                      <SideBarMenu items={items} card={card} />
                      <FichaFamiliar />
                    </div>
                    <Footer />
                  </>
                ) : rol === 2 ? (
                  <>
                    <SideBarMenu items={items} card={card} />
                  </>
                ) : (
                  <SideBarMenu items={items} card={card} />
                )}
              </Route>
              <Route path="/educar">
                {rol === 1 ? (
                  <>
                    <SideBarMenu items={items} card={card} />
                    <FichaEducativa />
                    <Footer />
                  </>
                ) : rol === 2 ? (
                  <>
                    <SideBarMenu items={items} card={card} />
                  </>
                ) : (
                  <SideBarMenu items={items} card={card} />
                )}
              </Route>
              <Route path="/desvinculacion">
                {rol === 1 ? (
                  <>
                    <SideBarMenu items={items} card={card} />
                    <FichaDesvinculacion />
                    <Footer />
                  </>
                ) : rol === 2 ? (
                  <>
                    <SideBarMenu items={items} card={card} />
                  </>
                ) : (
                  <SideBarMenu items={items} card={card} />
                )}
              </Route>
              <Route path="/representante">
                {rol === 1 ? (
                  <>
                    <SideBarMenu items={items} card={card} />
                    <FichaRepresentante />
                    <Footer />
                  </>
                ) : rol === 2 ? (
                  <>
                    <SideBarMenu items={items} card={card} />
                  </>
                ) : (
                  <SideBarMenu items={items} card={card} />
                )}
              </Route>
              <Route path="/reporte">
                {rol === 1 ? (
                  <>
                    <SideBarMenu items={items} card={card} />
                    <Reporte />
                    <Footer />
                  </>
                ) : rol === 2 ? (
                  <>
                    <SideBarMenu items={items} card={card} />
                  </>
                ) : (
                  <SideBarMenu items={items} card={card} />
                )}
              </Route>
              <Route path="*">
                {rol === 1 ? (
                  <SideBarMenu items={items} card={card} />
                ) : rol === 2 ? (
                  <SideBarMenu items={items} card={card} />
                ) : (
                  <SideBarMenu items={items} card={card} />
                )}
                <Redirect to="/dashboard/home" />
              </Route>
            </Switch>
          </div>
        </div>
      </main >
    </>
  );
};
