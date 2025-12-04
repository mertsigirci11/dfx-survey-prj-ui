import { createRoot } from "react-dom/client";
import { PrimeReactProvider } from "primereact/api";
import {
  RouterProvider,
  createBrowserRouter
} from "react-router-dom";

import AdminLayout from "./admin/layouts/AdminLayout";
import Surveys from "./admin/pages/Surveys";
import SurveyDetails from "./admin/pages/SurveyDetails";
import SurveyRunner from "./survey/pages/SurveyRunner";
import ThankYouPage from "./survey/pages/ThankYouPage"; 

import "primereact/resources/themes/lara-light-cyan/theme.css";
import "./index.css";

import Logout from "./admin/pages/Logout";
import Login from "./login/login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>test</div>,
    children: [
      { index: true, element: <div>PlaceHolder</div> },
    ]
  },

  {
    path: "/admin",
    children: [
      { path: "logout", element: <Logout /> }
    ]
  },

  {
    path: "/admin/survey",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Surveys /> },
      { path: ":id", element: <SurveyDetails /> }
    ]
  },

  {
    path: "/survey/:token",
    element: <SurveyRunner />
  },


  {
    path: "/admin/login",
    element: <div><Login /></div>,
  },
    {
    path: "/thank-you",  // This is where the user will be redirected after submission
    element: <ThankYouPage />,
  },

  {
    path: "*",
    element: <h2 style={{ padding: 20 }}>404 - Sayfa bulunamadı</h2>
  }
]);

createRoot(document.getElementById("root")).render(
  <PrimeReactProvider>
    <RouterProvider router={router} />
  </PrimeReactProvider>
);
