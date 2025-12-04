import { createRoot } from "react-dom/client";
import { PrimeReactProvider } from "primereact/api";
import {
  RouterProvider,
  createBrowserRouter
} from "react-router-dom";

import "primereact/resources/themes/lara-light-cyan/theme.css";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>PlaceHolder</div>,
    children: [
      { index: true, element: <div>PlaceHolder</div>, },
      { path: "about", element: <div>PlaceHolder</div>, },
      { path: "*", element: <div>PlaceHolder</div>, }
    ]
  }
]);

createRoot(document.getElementById("root")).render(
  <PrimeReactProvider>
    <RouterProvider router={router} />
  </PrimeReactProvider>
);
