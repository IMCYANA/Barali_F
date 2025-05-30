import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Alert,
  Row,
  Col,
  Badge,
} from "react-bootstrap";

function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state) {
      navigate("/");
    }
  }, [location.state, navigate]);

  if (!location.state) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="info">กำลังโหลดข้อมูลการจอง...</Alert>
      </Container>
    );
  }

  const {
    accommodation = [],
    checkIn,
    checkOut,
    adults,
    children,
    specialRequest,
    totalPrice,
    nights,
  } = location.state;

  if (!accommodation || accommodation.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">ไม่พบข้อมูลห้องพัก กรุณาทำการจองใหม่</Alert>
        <Button variant="primary" onClick={() => navigate("/")}>
          กลับสู่หน้าหลัก
        </Button>
      </Container>
    );
  }

  const roomSummaries = accommodation.map((room) => {
    const discount = room.promotions?.discount || 0;
    const pricePerNight = room.price_per_night || 0;
    const discountedPrice =
      discount > 0
        ? Math.round(pricePerNight * (1 - discount / 100))
        : pricePerNight;
    const totalRoomPrice = discountedPrice * nights;

    return {
      id: room.id,
      name: room.name,
      original: pricePerNight,
      discount,
      discounted: discountedPrice,
      total: totalRoomPrice,
    };
  });

  const formatDate = (date) => dayjs(date).format("D MMMM YYYY");

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="p-4">
            <div className="text-center mb-4">
              <h5 className="fw-bold">สรุปข้อมูลการจอง</h5>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold bg-light px-3 py-2">ข้อมูลผู้เข้าพัก</h6>
              <div className="px-3 py-2">
                <Row className="mb-2">
                  <Col md={3} className="fw-bold">
                    ชื่อผู้เข้าพัก
                  </Col>
                  <Col>John Doe</Col>
                </Row>
                <Row>
                  <Col md={3} className="fw-bold">
                    อีเมล
                  </Col>
                  <Col>john.doe@email.com</Col>
                </Row>
              </div>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold bg-light px-3 py-2">รายละเอียดการจอง</h6>
              <div className="px-3 py-2">
                <Row className="mb-2">
                  <Col md={4} className="fw-bold">
                    ประเภทห้องพัก
                  </Col>
                  <Col>ดีลักซ์วิลล่า</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={4} className="fw-bold">
                    เช็คอิน
                  </Col>
                  <Col>{formatDate(checkIn)}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={4} className="fw-bold">
                    เช็คเอาท์
                  </Col>
                  <Col>{formatDate(checkOut)}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={4} className="fw-bold">
                    จำนวนวันเข้าพัก (คืน)
                  </Col>
                  <Col>{nights}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={4} className="fw-bold">
                    ผู้ใหญ่
                  </Col>
                  <Col>{adults}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={4} className="fw-bold">
                    เด็ก
                  </Col>
                  <Col>{children}</Col>
                </Row>
                <Row>
                  <Col md={4} className="fw-bold">
                    จำนวนห้อง
                  </Col>
                  <Col>1</Col>
                </Row>
              </div>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold bg-light px-3 py-2">รายละเอียดราคา</h6>
              <div className="px-3 py-2">
                <Row className="mb-2">
                  <Col md={6}>ยอดรวม</Col>
                  <Col className="text-end">
                    {(totalPrice + 49).toLocaleString()} บาท
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}>ส่วนลด</Col>
                  <Col className="text-end"> 0 </Col>
                </Row>
                <Row className="fw-bold">
                  <Col md={6}>ยอดชำระทั้งหมด (Online Banking)</Col>
                  <Col className="text-end">
                    {totalPrice.toLocaleString()} บาท
                  </Col>
                </Row>
              </div>
            </div>

            <p className="text-center text-muted mt-4">
              กรุณาตรวจสอบข้อมูลของท่าน
            </p>
          </Card>
        </Col>
      </Row>
      <div className="text-center mt-4">
        <Button
          variant="outline-secondary"
          size="lg"
          className="me-3 px-4"
          onClick={() => navigate(-1)}
        >
          ย้อนกลับ
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="px-4"
          onClick={() => navigate("/payment")}
        >
          ชำระเงิน
        </Button>
      </div>
    </Container>
  );
}

export default BookingConfirmation;
