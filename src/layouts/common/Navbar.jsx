import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { useState } from "react";
import LoginModal from "../../pages/main/auth/LoginModal";

const MainNavbar = ({ isUser, logout }) => {
  console.log(isUser);
  const [showLogin, setShowLogin] = useState(false);
  return (
    <>
      <Navbar
        expand="lg"
        bg="light"
        variant="light"
        className="shadow-sm border-bottom"
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
              <Nav.Link href="#villa" className="text-dark">
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
                    <i className="bi bi-person"></i>
                  </div>
                  <Navbar.Text className="text-dark fw-bold">
                    {isUser.name} {isUser.lastname}
                  </Navbar.Text>
                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={logout}
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
                    ออกจากระบบ
                  </Button>
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