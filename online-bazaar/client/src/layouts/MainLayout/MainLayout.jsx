import { Outlet } from "react-router-dom";
import "./MainLayout.css";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

function MainLayout() {
  return (
    <>
      <Navbar />

      <main className="main-layout-content">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default MainLayout;
