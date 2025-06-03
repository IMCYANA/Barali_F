import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginModal from "../../pages/main/auth/LoginModal";
import { Icon } from "@iconify/react/dist/iconify.js";
// import { updateAccommodation } from "../../utils/AccommodationUtils";

const MainNavbar = ({ isUser, logOut }) => {
  const [selectedAccommodation, setSelectedAccommodation] = useState([]);
  const navigate = useNavigate();
  // const paymentId = null;

  console.log(isUser);

  useEffect(() => {
    const loadAccommodation = () => {
      const stored = localStorage.getItem("selectedAccommodation");
      if (stored) {
        try {
          setSelectedAccommodation(JSON.parse(stored));
        } catch (error) {
          console.error("Failed to parse selected accommodation:", error);
          setSelectedAccommodation([]);
        }
      } else {
        setSelectedAccommodation([]);
      }
    };

    // โหลดครั้งแรก
    loadAccommodation();

    // ฟัง custom event
    const handleAccommodationChanged = () => {
      loadAccommodation();
    };

    window.addEventListener("accommodationChanged", handleAccommodationChanged);

    return () => {
      window.removeEventListener("accommodationChanged", handleAccommodationChanged);
    };
  }, []);



  const handleCartClick = async (e) => {
    e.preventDefault();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // เสร็จแล้ว navigate
    navigate("/booking-list");

  }

  const [showLogin, setShowLogin] = useState(false);
  return (
    <>
      <Navbar
        expand="lg"
        bg="light"
        variant="light"
        className="shadow-sm border-bottom"
        sticky="top"
      >
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img
              src="https://www.baraliresort.com/images/logo.png"
              alt="Logo"
              width="60"
              height="54"
              className="d-inline-block align-text-top"
            />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/" className="text-dark">
                หน้าแรก
              </Nav.Link>
              <Nav.Link as={Link} to="/search-results" className="text-dark">
                วิลล่า
              </Nav.Link>

              <Nav.Link href="#location" className="text-dark">
                โลเคชั่น
              </Nav.Link>
              <Nav.Link href="#specials" className="text-dark">
                ข้อเสนอพิเศษ
              </Nav.Link>
            </Nav>

            <Nav className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="btn btn-light position-relative"
                onClick={handleCartClick}
              >
                <Icon icon="mdi-light:cart" width="24" height="24" />

                {selectedAccommodation.length > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: "0.6rem", minWidth: "1.2rem" }}
                  >
                    {selectedAccommodation.length}
                    <span className="visually-hidden">รายการในรถเข็น</span>
                  </span>
                )}
              </button>

              {isUser && (
                <Button
                  type="button"
                  variant="light"
                  className="position-relative"
                  onClick={() => navigate(`/booking-confirmation`)}
                >
                  <Icon icon="material-symbols-light:receipt-outline" width="24" height="24" />
                  <span className="ms-2">การชำระเงิน</span>
                </Button>
              )}

              {/* ธงภาษา */}
              <div className="d-flex align-items-center gap-1">
                <img
                  src="https://img.freepik.com/free-vector/illustration-thailand-flag_53876-27145.jpg?semt=ais_hybrid&w=740"
                  alt="TH"
                  width="24"
                  height="16"
                />
                <span className="text-dark small">TH</span>
              </div>

              {/* เงื่อนไขแสดงผลผู้ใช้ */}
              {isUser ? (
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
                    style={{ width: 32, height: 32 }}
                  >
                    <Button
                    variant=""
                    className="rounded-circle"
                    size="sm"
                    onClick={logOut}
                    data-toggle="tooltip"
                    data-placement="top"
                    title="ออกจากระบบ"
                    style={{
                      backgroundColor: "#18abdb",
                      borderColor: "#18abdb",
                      color: "white",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor =
                        "#1491b0"; /* สีอ่อนลงเมื่อ hover */
                      e.target.style.borderColor =
                        "#1491b0"; /* ขอบอ่อนลงเมื่อ hover */
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor =
                        "#18abdb"; /* กลับเป็นสีเดิม */
                      e.target.style.borderColor =
                        "#18abdb"; /* กลับเป็นสีขอบเดิม */
                    }}
                  >
                    <i className="bi bi-person rounded"></i>
                  </Button>
                  </div>
                  <Navbar.Text className="text-dark fw-medium bg-secondary bg-opacity-25 px-2 py-1 rounded">
                    {isUser.name} {isUser.lastname}
                  </Navbar.Text>
                  
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowLogin(true)}
                    style={{
                      backgroundColor: "#18abdb",
                      borderColor: "#18abdb",
                      color: "white",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor =
                        "#1491b0"; /* สีอ่อนลงเมื่อ hover */
                      e.target.style.borderColor =
                        "#1491b0"; /* ขอบอ่อนลงเมื่อ hover */
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor =
                        "#18abdb"; /* สีพื้นหลังกลับมาเหมือนเดิม */
                      e.target.style.borderColor =
                        "#18abdb"; /* ขอบกลับมาเหมือนเดิม */
                    }}
                  >
                    เข้าสู่ระบบ
                  </Button>

                  <LoginModal
                    show={showLogin}
                    onHide={() => setShowLogin(false)}
                  />
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default MainNavbar;