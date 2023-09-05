import { Switch, Route, Redirect } from "react-router-dom";
import { Login } from "./login/Login";

export function AuthRouter() {
  return (
    /* Switch: Renderiza solamente la primera ruta que coincide con la URL actual, lo que significa que solo se mostrará un componente a la vez. */
    <Switch>
      {/* Route: Nos lleva al Componente Login */}
      <Route exact path="/auth/login">
        <Login />
      </Route>
      {/* Redirect: Nos lleva al Componente Login */}
      <Redirect to="/auth/login" />
    </Switch>
  );
}
