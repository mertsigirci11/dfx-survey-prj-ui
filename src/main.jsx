import { createRoot } from "react-dom/client";
import { PrimeReactProvider } from "primereact/api";
import {
  RouterProvider,
  createBrowserRouter
} from "react-router-dom";

import "primereact/resources/themes/lara-light-cyan/theme.css";
import "./index.css";
import Login from "./login/login";


const router = createBrowserRouter([
  {
    path: "/",
    element: <div>test</div>,
    children: [
      { index: true, element: <div>PlaceHolder</div>, },
      { path: "about", element: <div>PlaceHolder</div>, },
      { path: "*", element: <div>PlaceHolder</div>, }
    ]
  },
  {
    path: "/login",
    element: <div><Login></Login></div>,
    /*children: [
      { index: true, element: <div>PlaceHolder</div>, },
      { path: "about", element: <div>PlaceHolder</div>, },
      { path: "*", element: <div>PlaceHolder</div>, }
    ]*/
  }
]);

createRoot(document.getElementById("root")).render(
  <PrimeReactProvider>
    <RouterProvider router={router} />
  </PrimeReactProvider>
);
