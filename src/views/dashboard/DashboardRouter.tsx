import { Route, Redirect, Switch } from "react-router-dom";
import Home from "./home/Home";
import { Toast } from "primereact/toast";
import React, { useRef } from "react";
import Footer from "../../common/Footer";
import { FcBusinessman } from "react-icons/fc";
import { FcHome } from "react-icons/fc";
import { FcExport } from "react-icons/fc";
import { FcGraduationCap } from "react-icons/fc";
import { FcViewDetails } from "react-icons/fc";
import { FcConferenceCall } from "react-icons/fc";
import { FcLike } from "react-icons/fc";
import { SideBarMenuCard, SideBarMenuItem } from "../../interfaces/types";
import { SideBarMenu } from "../../common/SideBar/SideBarMenu";
import FichaInscripcionContext from "../../views/FichaInscripcion/FichaInscripcion";
import FichaSalud from "../../views/FichaSalud/FichaSalud";
import FichaPersonal from "../FichaPersonal/FichaPersonal";
import { wrap } from "module";

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
      icon: FcBusinessman,
      url: "/inscripción",
    },
    {
      id: "3",
      label: "Ficha Personal",
      icon: FcViewDetails,
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
      url: "/",
    },
    {
      id: "6",
      label: "Ficha Representante",
      icon: FcConferenceCall,
      url: "/",
    },
    {
      id: "7",
      label: "Ficha de Desvinculación",
      icon: FcExport,
      url: "/",
    },
  ];

  const card: SideBarMenuCard = {
    id: "card001",
    displayName: "Bryan Curillo",
    title: "Administrador",
    photoUrl:
      "https://cdn.computerhoy.com/sites/navi.axelspringer.es/public/media/image/2018/08/fotos-perfil-whatsapp_16.jpg?tf=3840x",
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
                    <div className="estructura" >
                      <SideBarMenu items={items} card={card} />
                      <FichaPersonal />
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
      </main>
    </>
  );
};
