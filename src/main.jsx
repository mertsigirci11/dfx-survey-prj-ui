import { createRoot } from "react-dom/client";
import { PrimeReactProvider } from "primereact/api";
import {
  RouterProvider,
  createBrowserRouter
} from "react-router-dom";

import AdminLayout from "./admin/layouts/AdminLayout";
import Surveys from "./admin/pages/Surveys";
import SurveyDetails from "./admin/pages/SurveyDetails";

import "primereact/resources/themes/lara-light-cyan/theme.css";
import "./index.css";
import Logout from "./admin/pages/Logout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>PlaceHolder</div>,
    children: [
      { index: true, element: <div>PlaceHolder</div>, },
    ]
  },
  {
    path: "/admin",
    children: [
      { path: "login", element: <div>Login</div>, },
      { path: "logout", element: <Logout />, }
    ]
  },
  {
    path: "/admin/survey",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Surveys />, },
      { path: ":id", element: <SurveyDetails />, }
    ]
  }
]);

createRoot(document.getElementById("root")).render(
  <PrimeReactProvider>
    <RouterProvider router={router} />
  </PrimeReactProvider>
);
