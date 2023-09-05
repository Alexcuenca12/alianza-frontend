import { Redirect, Route } from "react-router-dom";

interface Props {
  loggedIn: boolean | undefined;
  component: any;
}

export function PrivateRouter({ loggedIn, component }: Props) {
  return (
    <>
    {/* Si nos encontramos logueados nos permite ingresar a los componentes, si no fuera el caso
    nos direcciona a el inicio.  */}
      {loggedIn ? <Route component={component} /> : <Redirect to="/inicio" />}
    </>
  );
}
