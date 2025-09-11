import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "react-datepicker/dist/react-datepicker.css";
import App from "./App.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Navbar />
    <App />
    <Footer />
  </StrictMode>
);
