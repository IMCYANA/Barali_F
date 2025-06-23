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
  InputGroup,
} from "react-bootstrap";
import "dayjs/locale/th";
import SearchBox from "../../../layouts/common/SearchBox";
import LoginModal from "../../main/auth/LoginModal";
import AccommodationService from "../../../services/api/accommodation/accommodation.service";
import TypeService from "../../../services/api/accommodation/type.service";
import FormatToBE from "../../../utils/FormatToBE";
import { Icon } from "@iconify-icon/react";
import "/src/css/SearchPage.css";
import roomImageMap from "./roomImageMap";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [originalResults, setOriginalResults] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState([]);
  const [expandedFacilities, setExpandedFacilities] = useState({});
  const [quantityMap, setQuantityMap] = useState({});

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

    if (discountPercent > 0) {
      return Math.round(originalPrice * (1 - discountPercent / 100));
    }

    return originalPrice;
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  useEffect(() => {
    localStorage.setItem(
      "bookingInfo",
      JSON.stringify({
        checkIn,
        checkOut,
        adults,
        children,
      })
    );
  }, [checkIn, checkOut, adults, children]);

  useEffect(() => {
    const storedAccommodation = localStorage.getItem("selectedAccommodation");
    if (storedAccommodation) {
      try {
        setSelectedAccommodation(JSON.parse(storedAccommodation));
      } catch (error) {
        console.error("Failed to parse stored selected accommodation:", error);
        localStorage.removeItem("selectedAccommodation");
      }
    }
  }, []);

  const handleAddToBooking = (acc) => {
    const totalSelected = selectedAccommodation.filter(
      (a) => a.id === acc.id
    ).length;
    const quantity = quantityMap[acc.id] || 1;

    if (totalSelected + quantity > 9) {
      alert("คุณสามารถเลือกห้องพักได้ไม่เกิน 9 ห้องเท่านั้น");
      return;
    }

    const newSelection = [...selectedAccommodation];
    for (let i = 0; i < quantity; i++) {
      newSelection.push(acc);
    }

    setSelectedAccommodation(newSelection);
    localStorage.setItem("selectedAccommodation", JSON.stringify(newSelection));
    window.dispatchEvent(new Event("accommodationChanged"));
  };

  const handleRemoveFromBooking = (accId) => {
    const newSelection = selectedAccommodation.filter((a) => a.id !== accId);
    setSelectedAccommodation(newSelection);
    localStorage.setItem("selectedAccommodation", JSON.stringify(newSelection));
    window.dispatchEvent(new Event("accommodationChanged"));
  };

  const handleQuantityChange = (accId, value) => {
    setQuantityMap((prev) => ({
      ...prev,
      [accId]: Math.max(1, Math.min(9, value)),
    }));
  };

  // Discounted price component
  const DiscountedPrice = ({ accommodation }) => {
    const originalPrice = parseInt(accommodation.price_per_night) || 0;
    const discountPercent =
      parseInt(accommodation.promotions[0]?.discount) || 0;
    const discounted = parseInt(getDiscountedPrice(accommodation));

    return (
      <>
        <div className="d-flex align-items-baseline mb-2">
          {discountPercent > 0 && (
            <>
              <span
                className="text-decoration-line-through text-secondary me-2 small"
                style={{ whiteSpace: "nowrap" }}
              >
                {parseInt(originalPrice).toLocaleString()} บาท
              </span>
              <span
                className="text-danger fw-bold me-1"
                style={{ whiteSpace: "nowrap" }}
              >
                -{discountPercent}%
              </span>
            </>
          )}
        </div>
        <span
          className={`h5 fw-bold ${
            discountPercent > 0 ? "text-danger" : "text-success"
          }`}
          style={{ whiteSpace: "nowrap" }}
        >
          {discounted.toLocaleString()} บาท
        </span>
      </>
    );
  };

  // Room card component
  const RoomCard = ({ room }) => {
    const isSelected = selectedAccommodation.some((a) => a.id === room.id);
    const selectedCount = selectedAccommodation.filter(
      (a) => a.id === room.id
    ).length;
    const quantity = quantityMap[room.id] || 1;
    const roomTypeName = room.type?.name || "Standard";

    return (
      <div className="room-card mb-4 p-3 border rounded bg-white">
        <Row>
          {/* ส่วนซ้าย - รูปภาพและข้อมูลห้อง */}
          <Col md={5}>
            {/* รูปหลัก */}
            <div className="mb-3">
              <img
                src={
                  room.image_name
                    ? `${BASE_URL}/uploads/accommodations/${room.image_name}`
                    : "https://picsum.photos/id/57/2000/3000"
                }
                alt={room.name}
                className="img-fluid rounded mb-2"
                style={{
                  aspectRatio: "4 / 3",
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                }}
              />
            </div>

            {/* Thumbnail Images */}
            <div className="d-flex flex-wrap gap-2 mb-3">
              {(roomImageMap[roomTypeName] || []).map((img, idx) => (
                <img
                  key={idx}
                  src={`/images/rooms/${img}`}
                  alt={`${roomTypeName} thumbnail ${idx + 1}`}
                  className="rounded-2 object-fit-cover"
                  style={{
                    aspectRatio: "4 / 3",
                    width: "80px",
                    height: "60px",
                    objectFit: "cover",
                    border: "1px solid #ddd",
                  }}
                  onError={(e) => {
                    e.target.src = "/images/rooms/default-thumb.jpg";
                  }}
                />
              ))}
            </div>

            {/* ข้อมูลห้องพัก */}
            <div className="room-features-container p-3 bg-light rounded">
              <h5 className="mb-2">ข้อมูลห้องพัก</h5>
              {room.description ? (
                <p style={{ whiteSpace: "pre-line" }}>{room.description}</p>
              ) : (
                <p className="text-muted">ไม่มีข้อมูลห้องพัก</p>
              )}
            </div>
          </Col>

          {/* ส่วนกลาง - สิ่งอำนวยความสะดวก */}
          <Col md={4}>
            <div className="facilities-container h-100">
              <h5 className="mb-3">สิ่งอำนวยความสะดวก</h5>
              <ul
                className={`feature-listS ${
                  expandedFacilities[room.id] ? "expanded" : "collapsed"
                }`}
              >
                {room.facilities
                  .slice(
                    0,
                    expandedFacilities[room.id] ? room.facilities.length : 5
                  )
                  .map((facility, index) => (
                    <li key={`acc-${room.id}-fac-${index}`}>
                      <Icon icon={facility.icon_name} width="20" height="20" />
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
                      icon={
                        expandedFacilities[room.id]
                          ? "mdi:chevron-up"
                          : "mdi:chevron-down"
                      }
                      width="20"
                      height="20"
                    />
                    {expandedFacilities[room.id]
                      ? "แสดงน้อยลง"
                      : "แสดงเพิ่มเติม"}
                  </li>
                )}
              </ul>
            </div>
          </Col>

          {/* ส่วนขวา - ราคาและการจอง */}
          <Col md={3} className="border-start">
            <div className="d-flex flex-column h-100">
              <div className="mb-3">
                <DiscountedPrice accommodation={room} />
                <div className="text-muted small">
                  ราคาต่อคืน (ก่อนรวมภาษีและค่าธรรมเนียม)
                </div>
              </div>

              <div className="mt-auto">
                {!isSelected ? (
                  <div className="d-flex align-items-center">
                    <InputGroup size="sm" style={{ width: "120px" }}>
                      <Button
                        variant="outline-secondary"
                        onClick={() =>
                          handleQuantityChange(room.id, quantity - 1)
                        }
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <Form.Control
                        type="number"
                        min="1"
                        max="9"
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            room.id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="text-center"
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() =>
                          handleQuantityChange(room.id, quantity + 1)
                        }
                        disabled={quantity >= 9}
                      >
                        +
                      </Button>
                    </InputGroup>
                    <Button
                      variant="info"
                      size="sm"
                      className="text-white ms-2"
                      onClick={() => handleAddToBooking(room)}
                    >
                      เพิ่ม
                    </Button>
                  </div>
                ) : (
                  <div className="d-flex flex-column align-items-end">
                    <span className="text-success small mb-1">
                      {selectedCount} ห้องที่เลือก
                    </span>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveFromBooking(room.id)}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Container className="my-4">
      <SearchBox resetFilter={resetFilters} />

      <Row className="">
        {/* Filters Sidebar */}
        <Col lg={3} className="mb-4">
          <Card
            className="my-3 p-4 shadow-sm border-0 "
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
                      <h2 className="mb-4">{typeName}</h2>

                      {accommodations.map((room) => (
                        <RoomCard key={room.id} room={room} />
                      ))}
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
          setTimeout(() => window.location.reload(), 300);
        }}
      />
    </Container>
  );
};

export default SearchPage;
