import { SideBarMenuCard, SideBarMenuItem } from "../../interfaces/types";
import React, { useState, useEffect, useRef } from "react";
import { classNames } from "../../util/classes";
import { VscMenu } from "react-icons/vsc";
import SideBarMenuItemView from "./SideBarMenuItemView";
import SideBarMenuCardView from "./SideBarMenuCardView";
import { BrowserRouter as Router, Link } from "react-router-dom";

import "../../styles/SideBarMenu.scss";

interface SideBarProps {
  items: SideBarMenuItem[];
  card: SideBarMenuCard;
  bodyComponent: React.ReactNode; // Utiliza React.ReactNode como tipo para el componente del cuerpo
  footerComponent: React.ReactNode; // Utiliza React.ReactNode como tipo para el componente del cuerpo
}

export function SideBarMenu({
  items,
  card,
  bodyComponent,
  footerComponent,
}: SideBarProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Función para manejar clics fuera del menú
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  function handleClick() {
    setIsOpen(!isOpen);
  }

  const eliminarUser = () => {
    sessionStorage.removeItem("user");
  };

  return (
    <>
      <section className="layoutP">
        <div className="headerP">
          <section className="layoutHead">
            <div
              className="grow1Head"
              style={{ justifyContent: "left", paddingLeft: "35px" }}
            >
              <div className="menuButton" ref={menuRef}>
                {/* <button className="hamburgerIcon" onClick={handleClick}>
                  <VscMenu></VscMenu>
                </button> */}
                <button className="Btn" onClick={handleClick}>
                  <div className="sign">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1.25em" viewBox="0 0 448 512"><path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" /></svg>
                  </div>
                  <div className="text">Menú</div>
                </button>
              </div>
            </div>

            <div className="grow1Head" style={{ justifyContent: "center" }}>
              <div className="header-logo">
                <img src={require("../../assets/LogoBlanco.png")} />
              </div>
            </div>

            <div
              className="grow1Head"
              style={{ justifyContent: "right", paddingRight: "35px" }}
            >
              <div className="exit">
                <Link to="/inicio">
                  <button className="Btn" onClick={eliminarUser}>
                    <div className="sign">
                      <svg viewBox="0 0 512 512">
                        <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                      </svg>
                    </div>
                    <div className="text">Salir</div>
                  </button>
                </Link>
              </div>
            </div>
          </section>
        </div>
        <div className="mainP">
          <section className="layoutS">
            <div className="sidebarS">
              <div
                className={classNames(
                  "SideBarMenu",
                  isOpen ? "expanded" : "collapsed"
                )}
              >
                <SideBarMenuCardView card={card} isOpen={isOpen} />
                <div
                  className={classNames(
                    "menuScroll",
                    isOpen ? "expanded" : "collapsed"
                  )}
                >
                  {items.map((item) => (
                    <SideBarMenuItemView
                      key={item.id}
                      item={item}
                      isOpen={isOpen}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="bodyS">{bodyComponent}</div>
          </section>
        </div>
        <div className="footerP">{footerComponent}</div>
      </section>
    </>
  );
}
