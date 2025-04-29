import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./app.css";
import "@szhsin/react-menu/dist/core.css";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/theme-dark.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import { CustomProvider } from "rsuite";

createRoot(document.getElementById("root")).render(
  <CustomProvider theme="dark">
    <App />
  </CustomProvider>
);
