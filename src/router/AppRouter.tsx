import { useContext } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { AuthRouter } from "../views/auth/Authrouter";
import { PrivateRouter } from "../router/PrivateRouter";
import { AuthContext } from "../reducers/AuthContext";
import { DashboardRouter } from "../views/dashboard/DashboardRouter";
import Bienvenida from "../views/VentanaInicial/Bienvenida";

interface Context {
  dispatchUser?: any;
  user?: User;
}

interface User {
  loggedIn: boolean;
}

export function AppRouter() {
  const { user } = useContext<Context>(AuthContext);

  return (
    // Es el componente que envuelve toda la aplicación y le permite manejar la navegación mediante la actualización de la URL en el navegador.
    <Router>
      <Switch>
        {/* Renderiza solamente la primera ruta que coincide con la URL actual, lo que significa que solo se mostrará un componente a la vez. */}
        <Route exact path="/inicio">
          {/* Ruta para direccionarse a Bienvenida */}
          <Bienvenida />
        </Route>
        <Route path="/auth">
          {/* Ruta para direccionarse al router de login */}
          <AuthRouter />
        </Route>
        {/* Acceso a las rutas privadas del sistema solamente cuando este logueado */}
        <PrivateRouter loggedIn={user?.loggedIn} component={DashboardRouter} />
        {/* Si no se encuentra logueado se direcciona al Inicio */}
        <Redirect to="/dashboard/home" />
      </Switch>
    </Router>
  );
}
