import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
import { Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const MainLayout = () => {
    const { isUser, logOut } = useAuth();
    return (
        <>
            <Navbar isUser={isUser} logOut={logOut} />
            <Outlet />
            <Footer />
        </>
    )
}
export default MainLayout