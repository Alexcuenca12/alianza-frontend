import "./App.css";
import { useReducer } from "react";
import { AppRouter } from "./router/AppRouter";

import { authReducer } from "./reducers/authReducer";
import { AuthContext } from "./reducers/AuthContext";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
const init = () => {
  let sessionUser: any = sessionStorage.getItem("user");
  let user: any;
  if (!sessionUser) {
    user = sessionUser;
  } else {
    user = JSON.parse(sessionUser);
  }
  return user;
};

function App() {
  const [user, dispatchUser] = useReducer(authReducer, {}, init);

  return (
    <AuthContext.Provider value={{ user, dispatchUser }}>
      <AppRouter />
    </AuthContext.Provider>
  );
}

export default App;
