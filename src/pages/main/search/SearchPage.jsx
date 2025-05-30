import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
// import dayjs from "dayjs";
import "dayjs/locale/th";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import SearchBox from "../../../layouts/common/SearchBox";
import LoginModal from "../../main/auth/LoginModal";
import AccommodationService from "../../../services/api/accommodation/accommodation.service";
import TypeService from "../../../services/api/accommodation/type.service";
import FormatToBE from "../../../utils/FormatToBE";
import { Icon } from "@iconify-icon/react";
import "/src/css/SearchPage.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [originalResults, setOriginalResults] = useState([]);

  const { isLoggedIn } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState([]);
  const [expandedFacilities, setExpandedFacilities] = useState({});

  // Get search parameters
  const destination = searchParams.get("destination") || "test";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const adults = parseInt(searchParams.get("adults")) || 1;
  const children = parseInt(searchParams.get("children")) || 0;

  // Filter states
  const [filters, setFilters] = useState({
    selectedTypes: [],
  });

  // Fetch accommodation types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await TypeService.getAll();
        if (response?.data) {
          setTypes(response.data);
        }
      } catch (error) {
        console.error("Error fetching accommodation types:", error);
      }
    };
    fetchTypes();
  }, []);

  // Fetch search results
  useEffect(() => {
    document.title = `Barali Beach Resort - ค้นหาที่พัก`;

    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = destination
          ? await AccommodationService.getSearch(
              checkIn,
              checkOut,
              adults,
              children
            )
          : await AccommodationService.getAll();

        setOriginalResults(res?.data || []);
        console.log(res.data);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูลที่พัก");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchParams, destination, checkIn, checkOut, adults, children]);

  // Apply filters to results
  const filteredResults = useMemo(() => {
    const { selectedTypes } = filters;
    const matchType = types.name?.toLowerCase();

    return originalResults.filter((acc) => {
      // Filter by type
      const typeMatch =
        selectedTypes.length === 0 || selectedTypes.includes(acc.type?.name);

      // Filter by search term
      const searchMatch =
        !matchType ||
        acc.type?.name?.toLowerCase().includes(matchType.toLowerCase());

      return typeMatch && searchMatch;
    });
  }, [originalResults, filters, types.name]);

  // Group results by type
  const groupedResults = useMemo(() => {
    return filteredResults.reduce((groups, acc) => {
      const typeName = acc.type?.name || "Other";
      if (!groups[typeName]) {
        groups[typeName] = [];
      }
      groups[typeName].push(acc);
      return groups;
    }, {});
  }, [filteredResults]);

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      selectedTypes: [],
    });
  };

  // Toggle accommodation type filter
  const handleTypeChange = (typeName) => {
    setFilters((prev) => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(typeName)
        ? prev.selectedTypes.filter((t) => t !== typeName)
        : [...prev.selectedTypes, typeName],
    }));
  };

  // Calculate discounted price
  const getDiscountedPrice = (accommodation) => {
    const originalPrice = accommodation.price_per_night || 0;
    const discountPercent = accommodation.promotions[0]?.discount || 0;
    // console.log("DEBUG: facilities object = ", accommodation.facilities);
    // console.log("DEBUG: facilities = ", accommodation.facilities.map((f, index) => f.name).join(', '));

    if (discountPercent > 0) {
      return Math.round(originalPrice * (1 - discountPercent / 100));
    }

    return originalPrice;
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  useEffect(() => {
    const storedAccommodation = localStorage.getItem("selectedAccommodation");
    if (storedAccommodation) {
      try {
        setSelectedAccommodation(JSON.parse(storedAccommodation));
      } catch (error) {
        console.error("Failed to parse stored selected accommodation:", error);
        localStorage.removeItem("selectedAccommodation"); // กรณี parse fail ก็ลบทิ้ง
      }
    }
  }, []);

  const handleAddToBooking = (acc) => {
    if (!selectedAccommodation.some((a) => a.id === acc.id)) {
      const newSelection = [...selectedAccommodation, acc];
      setSelectedAccommodation(newSelection);
      localStorage.setItem(
        "selectedAccommodation",
        JSON.stringify(newSelection)
      );
    }
  };

  const handleRemoveRoom = (roomId) => {
    const newSelection = selectedAccommodation.filter(
      (room) => room.id !== roomId
    );
    setSelectedAccommodation(newSelection);
    localStorage.setItem("selectedAccommodation", JSON.stringify(newSelection));
  };

  const getUserId = () => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      return userData.id;
    }
    return null;
  };
  const userId = getUserId();

  const handleBookingClick = (acc) => {
    if (isLoggedIn) {
      navigate("/booking", {
        state: {
          accommodation: acc,
          checkIn,
          checkOut,
          adults,
          children,
        },
      });
    } else {
      setSelectedAccommodation(acc);
      setShowLoginModal(true);
    }
  };

  // Discounted price component
  const DiscountedPrice = ({ accommodation }) => {
    const originalPrice = accommodation.price_per_night || 0;
    const discountPercent =
      parseInt(accommodation.promotions[0]?.discount) || 0;
    const discounted = parseInt(getDiscountedPrice(accommodation));

    return (
      <div className="d-flex align-items-baseline mb-2">
        {discountPercent > 0 && (
          <>
            <span className="text-decoration-line-through text-secondary me-2">
              {parseInt(originalPrice).toLocaleString()} บาท
            </span>
            <span className="text-danger fw-bold me-3">
              ลด {discountPercent}%
            </span>
          </>
        )}
        <span
          className={`h5 fw-bold ${
            discountPercent > 0 ? "text-danger" : "text-success"
          }`}
        >
          {discounted.toLocaleString()} บาท
        </span>
      </div>
    );
  };

  return (
    <Container className="my-4">
      <SearchBox resetFilter={resetFilters} />

      {selectedAccommodation.length > 0 && (
        <Card className="p-3 mb-4 shadow-sm border-0 bg-warning bg-opacity-10">
          <h5 className="fw-bold mb-3">รายการห้องที่คุณเลือก</h5>
          <ul className="list-group mb-3">
            {selectedAccommodation.map((room) => (
              <li
                key={room.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {room.name}
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveRoom(room.id)}
                >
                  ลบ
                </Button>
              </li>
            ))}
          </ul>
          <Button
            variant="primary"
            disabled={!isLoggedIn}
            onClick={() => {
              navigate("/booking", {
                state: {
                  userId,
                  accommodation: selectedAccommodation,
                  checkIn,
                  checkOut,
                  adults,
                  children,
                },
              });
              localStorage.removeItem("selectedAccommodation");
            }}
          >
            ยืนยันการจองทั้งหมด ({selectedAccommodation.length} ห้อง)
          </Button>
          {!isLoggedIn && (
            <div className="text-danger mt-2">กรุณาเข้าสู่ระบบก่อนทำการจอง</div>
          )}
        </Card>
      )}

      <Row className="mt-4">
        {/* Filters Sidebar */}
        <Col lg={3} className="mb-4">
          <Card
            className="p-3 shadow-sm border-0"
            style={{ background: "#EEFBFF" }}
          >
            <h5 className="fw-bold mb-3">ตัวกรอง</h5>

            {types.length > 0 && (
              <Form.Group className="mb-4">
                <Form.Label>ประเภทที่พัก</Form.Label>
                {types.map((type) => (
                  <Form.Check
                    key={`type-${type.name}`}
                    id={`type-${type.name}`}
                    type="checkbox"
                    label={type.name}
                    checked={filters.selectedTypes.includes(type.name)}
                    onChange={() => handleTypeChange(type.name)}
                  />
                ))}
              </Form.Group>
            )}

            <Button variant="outline-secondary" onClick={resetFilters}>
              ล้างตัวกรองทั้งหมด
            </Button>
          </Card>
        </Col>

        {/* Results Section */}
        <Col lg={9}>
          <Card
            className="p-3 shadow-sm border-0"
            style={{ background: "#fff" }}
          >
            <h5 className="fw-bold mb-3">ผลการค้นหา</h5>

            <div className="mb-2" style={{ color: "#888", fontSize: "1em" }}>
              <span className="me-3">
                เช็คอิน: <b>{FormatToBE(checkIn) || "ไม่ระบุ"}</b>
              </span>
              <span className="me-3">
                เช็คเอาท์: <b>{FormatToBE(checkOut) || "ไม่ระบุ"}</b>
              </span>
              <span>
                จำนวนผู้เข้าพัก:{" "}
                <b>
                  ผู้ใหญ่: {adults} คน, เด็ก: {children} คน
                </b>
              </span>
            </div>

            {error && (
              <Alert variant="danger" className="my-3">
                {error}
              </Alert>
            )}

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="success" />
                <div className="mt-2">กำลังโหลดข้อมูล...</div>
              </div>
            ) : Object.keys(groupedResults).length > 0 ? (
              <>
                <div className="mb-3 text-end text-secondary">
                  พบ {filteredResults.length} รายการ
                </div>

                {Object.entries(groupedResults).map(
                  ([typeName, accommodations]) => (
                    <div key={typeName} className="mb-5">
                      <hr className="h-2" />
                      <h2 className="mb-0 mt-2">{typeName}</h2>

                      <div className="container mt-4 p-3 border rounded bg-light">
                        {accommodations.map((acc) => (
                          <div key={acc.id} className="row mb-4">
                            {/* Room Images */}
                            <div className="col-md-4">
                              <img
                                src={
                                  acc.image_name
                                    ? `${BASE_URL}/uploads/accommodations/${acc.image_name}`
                                    : "https://picsum.photos/id/57/2000/3000"
                                }
                                alt={acc.name}
                                className="img-fluid rounded mb-2"
                                style={{
                                  maxHeight: "200px",
                                  objectFit: "cover",
                                }}
                              />
                              <div className="d-flex flex-wrap gap-2">
                                {[1, 2].map((i) => (
                                  <img
                                    key={i}
                                    src="https://via.placeholder.com/90"
                                    className="img-thumbnail"
                                    alt={`Thumb ${i}`}
                                  />
                                ))}
                              </div>

                              <ul className="feature-list mt-3">
                                <li>
                                  <Icon icon="la:bed" width="24" height="24" />
                                  <span>1 เตียงควีนไซส์</span>
                                </li>
                                <li>
                                  <Icon
                                    icon="fluent:table-resize-column-16-regular"
                                    width="27"
                                    height="27"
                                  />
                                  ขนาดห้อง: 47 ตารางเมตร
                                </li>
                                <li>
                                  <Icon
                                    icon="cil:window"
                                    width="27"
                                    height="27"
                                  />
                                  วิว: สวน
                                </li>
                              </ul>
                            </div>

                            {/* Facilities */}
                            <div className="col-md-4">
                              <ul
                                className={`feature-list ${
                                  expandedFacilities[acc.id]
                                    ? "expanded"
                                    : "collapsed"
                                }`}
                              >
                                {acc.facilities
                                  .slice(
                                    0,
                                    expandedFacilities[acc.id]
                                      ? acc.facilities.length
                                      : 5
                                  )
                                  .map((facility, index) => (
                                    <li key={`acc-${acc.id}-fac-${index}`}>
                                      <Icon
                                        icon={facility.icon_name}
                                        width="24"
                                        height="24"
                                      />

                                      {facility.name}
                                    </li>
                                  ))}

                                {acc.facilities.length > 5 && (
                                  <li
                                    onClick={() => {
                                      setExpandedFacilities((prev) => ({
                                        ...prev,

                                        [acc.id]: !prev[acc.id],
                                      }));
                                    }}
                                    style={{ cursor: "pointer" }}
                                    className="dropdown-toggle-icon"
                                  >
                                    <Icon
                                      icon={
                                        expandedFacilities[acc.id]
                                          ? "mdi:chevron-up"
                                          : "mdi:chevron-down"
                                      }
                                      width="24"
                                      height="24"
                                    />
                                  </li>
                                )}
                              </ul>
                            </div>

                            {/* Prices & Booking */}
                            <div className="col-md-4">
                              <div className="border rounded p-3 mb-3 bg-white">
                                {acc.discount > 0 && (
                                  <div className="text-success mb-2">
                                    มีคูปองส่วนลด {acc.promotions[0]?.discount}%
                                  </div>
                                )}

                                <DiscountedPrice accommodation={acc} />

                                <div className="text-muted small mb-2">
                                  ราคาต่อคืน (ก่อนรวมภาษีและค่าธรรมเนียม)
                                </div>

                                <Button
                                  variant="success"
                                  onClick={() => handleAddToBooking(acc)}
                                  disabled={selectedAccommodation.some(
                                    (a) => a.id === acc.id
                                  )}
                                >
                                  {selectedAccommodation.some(
                                    (a) => a.id === acc.id
                                  )
                                    ? "เพิ่มแล้ว"
                                    : "เพิ่มห้องนี้"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </>
            ) : (
              <div className="text-center text-muted py-5">
                <Icon icon="mdi:emotion-sad" width={40} height={40} />
                <div className="mt-2">ไม่พบที่พักตามเงื่อนไขที่คุณระบุ</div>
                <Button
                  variant="outline-primary"
                  className="mt-3"
                  onClick={resetFilters}
                >
                  ล้างตัวกรองทั้งหมด
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <LoginModal
        show={showLoginModal}
        handleClose={handleCloseModal}
        onLoginSuccess={() => {
          handleCloseModal();
          setTimeout(() => window.location.reload(), 300); // reload หลังปิด modal
        }}
      />
    </Container>
  );
};

export default SearchPage;
