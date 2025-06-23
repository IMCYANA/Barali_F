import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="bg-white border-top py-4" style={{ width: "100%" }}>
      <Container>
        <Row className="align-items-center">
          {/* ซ้าย: ข้อมูลรีสอร์ท */}
          <Col md={6} className="mb-4 mb-md-0 d-flex align-items-center gap-4">
            <img
              src="https://www.baraliresort.com/images/logo.png"
              alt="Barali Logo"
              width="80"
              height="72"
            />
            <div>
              <div className="fw-bold">
                บาราลี บีช รีสอร์ท (Barali Beach Resort)
              </div>
              <div>77 หมู่คลองพร้าว เกาะช้าง ตราด 23170</div>
              <div>095-555-6666</div>
            </div>
          </Col>

          {/* ขวา: โลโก้ใบรับรอง */}
          <Col
            md={6}
            className="d-flex justify-content-md-end justify-content-center gap-4 mt-4 mt-md-0"
          >
            <img src="/src/assets/sha-plus.png" alt="SHA Plus" height="70" />
            <img
              src="/src/assets/holidayCheck.png"
              alt="HolidayCheck Award"
              height="70"
            />
            <img
              src="/src/assets/logo_unseen.png"
              alt="Unseen Paradise"
              height="70"
            />
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
