import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  ButtonGroup,
} from "react-bootstrap";
import dayjs from "dayjs";
import SearchBox from "../../../layouts/common/SearchBox";
import LoginModal from "../../main/auth/LoginModal";
import AccommodationService from "../../../services/api/accommodation/accommodation.service";
import AuthService from "../../../services/auth/auth.service";
import BookingService from "../../../services/api/booking/booking.service";
import { Icon } from "@iconify/react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const BookingPage = () => {
  const { state } = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [expandedFacilities, setExpandedFacilities] = useState({});
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    currentUser = AuthService.getCurrentUser(),
    userId = currentUser?.id,
    accommodation = [],
    checkIn = searchParams.get("checkIn") || "",
    checkOut = searchParams.get("checkOut") || "",
    adults = parseInt(searchParams.get("adults")) || 1,
    children = parseInt(searchParams.get("children")) || 0,
  } = state || {};

  console.log(accommodation, checkIn, checkOut);

  useEffect(() => {
    if (!state || !state.accommodation) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  const [specialRequest, setSpecialRequest] = useState("");
  const [subscribeLatestOffers, setSubscribeLatestOffers] = useState(false);

  const handleBackToSearch = () => {
    const queryParams = new URLSearchParams();

    if (searchParams.get("destination")) {
      queryParams.append("destination", searchParams.get("destination"));
    }
    if (checkIn) {
      queryParams.append("checkIn", checkIn);
    }
    if (checkOut) {
      queryParams.append("checkOut", checkOut);
    }
    if (adults) {
      queryParams.append("adults", adults);
    }
    if (children) {
      queryParams.append("children", children);
    }

    navigate(`/search-results?${queryParams.toString()}`);
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    try {
      return dayjs(checkOut).diff(dayjs(checkIn), "day");
    } catch (error) {
      console.error("Error calculating nights:", error);
      return 0;
    }
  };

  const nights = calculateNights();


  const calculatePrices = () => {
    if (!Array.isArray(accommodation) || accommodation.length === 0) {
      return { discountedPrice: 0, totalPrice: 0 };
    }

    let total = 0;

    accommodation.forEach((room) => {
      const basePrice = room.price_per_night;
      const discount = room.promotions[0]?.discount || 0;
      const discounted = discount > 0
        ? Math.round(basePrice * (1 - discount / 100))
        : basePrice;

      total += discounted * nights;
    });

    return {
      discountedPrice: "-", // ไม่สามารถสรุปราคาเดียวได้ในกรณีหลายห้อง
      totalPrice: total,
    };
  };

  const { discountedPrice, totalPrice } = calculatePrices();
  const handleCloseModal = () => {
    setShowLoginModal(false);
  };
  const handleConfirmBooking = async () => {
    if (!checkIn || !checkOut) {
      setError("กรุณาระบุวันที่เช็คอินและเช็คเอาท์");
      return;
    }

    if (nights <= 0) {
      setError("วันที่เช็คเอาท์ต้องมากกว่าวันที่เช็คอิน");
      return;
    }
    const isUser = AuthService.getCurrentUser();
    if (!isUser) {
      setShowLoginModal(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setLoading(true);

    const bookingData = {
      userId,
      roomIds: accommodation.map((room) => room.id),
      checkIn,
      checkOut,
      adults,
      children,
      specialRequest,
      // subscribeLatestOffers,
      totalPrice,
    };
    console.log("ยืนยันการจอง:", bookingData);

    try {

      bookingData ? await BookingService.MakeBooking(
        userId,
        accommodation.map((room) => room.id),
        checkIn,
        checkOut,
        adults,
        children,
        specialRequest,
        totalPrice
      )
        : setError("เกิดข้อผิดพลาดในการจอง กรุณาลองอีกครั้ง");
      setLoading(false);

      console.log("ยืนยันการจอง:", bookingData);
      localStorage.removeItem("selectedAccommodation");
      navigate("/booking-confirmation", { state: bookingData });


    } catch (err) {
      console.error("การจองล้มเหลว:", err);
      setError("เกิดข้อผิดพลาดในการจอง กรุณาลองอีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!state || !state.accommodation || !Array.isArray(state.accommodation)) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger" className="mb-4">
          ไม่พบข้อมูลการจอง กรุณาเริ่มต้นจากหน้าค้นหาอีกครั้ง
        </Alert>
        <Button variant="primary" onClick={() => navigate("/")}>
          กลับไปหน้าหลัก
        </Button>
      </Container>
    );
  }

  return (
    <div className="booking-page">
      <style jsx="true">{`
        .booking-page {
          background-color: #f8f9fa;
          min-height: 100vh;
          padding: 20px 0;
        }
        
        .main-content-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
        }
        
        .accommodation-image {
          width: 100%;
          height: 300px;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .accommodation-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #2c3e50;
          margin: 25px 0 15px 0;
        }
        
        .accommodation-details {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          align-items: center;
          margin-bottom: 25px;
          font-size: 0.95rem;
          color: #6c757d;
        }
        
        .accommodation-details span {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .amenities-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 20px;
        }
        
        .amenity-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #495057;
        }
        
        .amenity-icon {
          width: 18px;
          height: 18px;
          color: #17a2b8;
        }
        
        .booking-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border: none;
          position: sticky;
          top: 20px;
          margin-bottom: 20px;
        }
        
        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          font-size: 0.95rem;
        }
        
        .price-original {
          text-decoration: line-through;
          color: #6c757d;
          font-size: 0.85rem;
        }
        
        .discount-badge {
          background: #dc3545;
          color: white;
          padding: 3px 10px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-left: 10px;
        }
        
        .total-price {
          font-size: 1.8rem;
          font-weight: 700;
          color: #007bff;
        }
        
        .booking-buttons {
          display: flex;
          gap: 12px;
          margin-top: 25px;
        }
        
        .btn-back {
          flex: 1;
          padding: 12px;
          border: 2px solid #007bff;
          background: white;
          color: #007bff;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .btn-back:hover {
          background: #007bff;
          color: white;
        }
        
        .btn-confirm {
          flex: 2;
          padding: 12px;
          background: #007bff;
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }
        
        .btn-confirm:hover {
          background: #0056b3;
        }
        
        .special-request-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border: none;
          margin-top: 25px;
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 18px;
        }
        
        @media (max-width: 992px) {
          .booking-card {
            position: static;
            margin-top: 30px;
          }
          
          .amenities-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Container fluid className="px-0">
        <div className="main-content-container">
          <SearchBox
            defaultValues={{
              destination: searchParams.get("destination") || "",
              checkIn,
              checkOut,
              adults,
              children,
            }}
            resetFilter={() => { }}
          />

          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}

          <Row className="mt-4 gx-4">
            <Col lg={8}>
              {accommodation.map((room) => (
                <Card key={room.id} className="mb-3">
                  <Card.Img
                    variant="top"
                    src={room.image_name
                      ? `${BASE_URL}/uploads/accommodations/${room.image_name}`
                      : "https://via.placeholder.com/600x400?text=No+Image"}
                  />
                  <Card.Body>
                    <Card.Title>{room.type?.name}</Card.Title>
                    <ul className={`feature-list ${expandedFacilities[room.id] ? "expanded" : "collapsed"}`}>
                      {room.facilities.slice(0, expandedFacilities[room.id] ? room.facilities.length : 5).map((facility, index) => (
                        <li key={`acc-${room.id}-fac-${index}`}>
                          <Icon icon={facility.icon_name} width="24" height="24" />
                          {facility.name}
                        </li>
                      ))}
                      {room.facilities.length > 5 && (
                        <li
                          onClick={() => {
                            setExpandedFacilities((prev) => ({
                              ...prev,
                              [room.id]: !prev[room.id],
                            }));
                          }}
                          style={{ cursor: "pointer" }}
                          className="dropdown-toggle-icon"
                        >
                          <Icon
                            icon={expandedFacilities[room.id] ? "mdi:chevron-up" : "mdi:chevron-down"}
                            width="24"
                            height="24"
                          />
                        </li>
                      )}
                    </ul>
                    <Card.Text>
                      ราคาต่อคืน: {parseInt(room.price_per_night).toLocaleString()} บาท
                      {room.promotions[0]?.discount > 0 && (
                        <>
                          <br />
                          ส่วนลด: {parseInt(room.promotions[0]?.discount)}% → ราคา:{" "}
                          {Math.round(room.price_per_night * (1 - room.promotions[0]?.discount / 100)).toLocaleString()} บาท
                        </>

                      )}
                    </Card.Text>

                  </Card.Body>
                </Card>
              ))}

              <Card className="special-request-card">
                <Card.Body>
                  <h3 className="section-title">คำขอพิเศษ</h3>
                  <p style={{ fontSize: '0.95rem', color: '#6c757d', marginBottom: '18px' }}>
                    กรุณาระบุคำขอพิเศษของคุณ (หากมี)
                  </p>

                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: '500' }}>คำขอพิเศษของคุณ</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="เช่น ไดร์เปล่าผม, สถานที่รับหรือส่งโลเคชั่น"
                        value={specialRequest}
                        onChange={(e) => setSpecialRequest(e.target.value)}
                        style={{ borderRadius: '8px' }}
                      />
                      <Form.Text className="text-muted" style={{ fontSize: '0.85rem' }}>
                        * ไม่มีการรับประกันคำขอพิเศษ
                        แต่เราจะดำเนินการตามคำขอของคุณให้ดีที่สุด
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-0">
                      <Form.Check
                        type="checkbox"
                        label="ส่งข้อเสนอล่าสุดมาให้ฉัน"
                        checked={subscribeLatestOffers}
                        onChange={(e) => setSubscribeLatestOffers(e.target.checked)}
                        style={{ fontSize: '0.95rem' }}
                      />
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="booking-card">
                <Card.Body style={{ padding: '25px' }}>
                  <h3 className="section-title" style={{ marginBottom: '20px' }}>สรุปการจอง</h3>

                  {accommodation.map((room, index) => {
                    const pricePerNight = parseFloat(room.price_per_night);
                    const discount = parseFloat(room.promotions[0]?.discount || 0);
                    const discountedPrice = pricePerNight * (1 - discount / 100);

                    return (
                      <div key={room.id} style={{ marginBottom: '20px' }}>
                        <div className="price-row">
                          <span>ห้อง {index + 1}: {room.description}</span>
                        </div>

                        <div className="price-row">
                          <span>ราคาที่พัก (ต่อห้อง / ต่อคืน)</span>
                          <span className="price-original">
                            {pricePerNight.toLocaleString()} บาท
                          </span>
                        </div>

                        {discount > 0 && (
                          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                            <span className="discount-badge">
                              ส่วนลด {parseInt(discount)}%
                            </span>
                          </div>
                        )}

                        <div className="price-row">
                          <span>ราคาหลังหักส่วนลด</span>
                          <span style={{ fontWeight: '600' }}>
                            {discountedPrice.toLocaleString()} บาท/คืน
                          </span>
                        </div>

                        <hr style={{ margin: '15px 0' }} />
                      </div>
                    );
                  })}

                  <div className="price-row">
                    <span>จำนวนคืน</span>
                    <span style={{ fontWeight: '600' }}>{nights} คืน</span>
                  </div>

                  <div className="price-row">
                    <span>ค่าธรรมเนียมการจอง</span>
                    <span style={{ color: '#28a745', fontWeight: '600' }}>ฟรี</span>
                  </div>

                  <hr style={{ margin: '20px 0' }} />

                  <div className="price-row" style={{ marginBottom: '25px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>รวมทั้งหมด</span>
                    <span className="total-price">
                      {totalPrice.toLocaleString()} บาท
                    </span>
                  </div>

                  <div className="booking-buttons">
                    <button
                      className="btn-back"
                      onClick={handleBackToSearch}
                    >
                      ย้อนกลับ
                    </button>

                    <button
                      className="btn-confirm"
                      onClick={handleConfirmBooking}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "กำลังดำเนินการ..." : "ยืนยันการจอง"}
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>

      <LoginModal
        show={showLoginModal}
        handleClose={(handleCloseModal)}
        onLoginSuccess={() => {
          handleCloseModal();
          setTimeout(() => window.location.reload(), 300); // reload หลังปิด modal
        }}
      />
    </div>
  );
};

export default BookingPage;