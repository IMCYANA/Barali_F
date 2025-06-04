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
import "dayjs/locale/th";
// import { useNavigate } from "react-router-dom";
// import useAuth from "../../../hooks/useAuth";
import SearchBox from "../../../layouts/common/SearchBox";
import LoginModal from "../../main/auth/LoginModal";
import AccommodationService from "../../../services/api/accommodation/accommodation.service";
import TypeService from "../../../services/api/accommodation/type.service";
import FormatToBE from "../../../utils/FormatToBE";
import { Icon } from "@iconify-icon/react";
import "/src/css/SearchPage.css";
import roomImageMap from "./roomImageMap";
import { Medium } from "react-bootstrap-icons";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SearchPage = () => {
  // const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [originalResults, setOriginalResults] = useState([]);

  // const { isLoggedIn } = useAuth();
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
    if (!selectedAccommodation.some((a) => a.id === acc.id)) {
      const newSelection = [...selectedAccommodation, acc];
      setSelectedAccommodation(newSelection);
      localStorage.setItem(
        "selectedAccommodation",
        JSON.stringify(newSelection)
      );
      window.dispatchEvent(new Event("accommodationChanged"));
    }
  };

  // const getUserId = () => {
  //   const user = localStorage.getItem("user");
  //   if (user) {
  //     const userData = JSON.parse(user);
  //     return userData.id;
  //   }
  //   return null;
  // };

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
                  ([typeName, accommodations]) => {
                    const representativeAcc = accommodations[0];

                    return (
                      <div key={typeName} className="mb-5">
                        <hr className="h-2" />
                        <h2 className="mb-0 mt-2">{typeName}</h2>

                        <div className="container mt-4 border rounded bg-light">
                          <div className="row">
                            {/* ส่วนที่ 1: รูปภาพและข้อมูลห้อง */}
                            <div className="col-md-4 bg-info bg-opacity-10 py-3 border-end">
                              <img
                                src={
                                  representativeAcc.image_name
                                    ? `${BASE_URL}/uploads/accommodations/${representativeAcc.image_name}`
                                    : "https://picsum.photos/id/57/2000/3000"
                                }
                                alt={representativeAcc.name}
                                className="img-fluid rounded mb-2"
                                style={{
                                  aspectRatio: "4 / 3",
                                  maxWidth: "100%",
                                  maxHeight: "220px",
                                  objectFit: "cover",
                                }}
                              />

                              {/* Thumbnail Images */}
                              <div className="d-flex flex-wrap gap-2 mb-2">
                                {(
                                  roomImageMap[representativeAcc.type?.name] ||
                                  []
                                ).map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={`/images/rooms/${img}`}
                                    alt={`${
                                      representativeAcc.type?.name
                                    } thumbnail ${idx + 1}`}
                                    className="rounded-2 object-fit-cover"
                                    style={{
                                      aspectRatio: "4 / 3",
                                      maxWidth: "115px",
                                      maxHeight: "100px",
                                      objectFit: "cover",
                                      borderRadius: "1rem",
                                    }}
                                    onError={(e) => {
                                      e.target.src =
                                        "/images/rooms/default-thumb.jpg";
                                    }}
                                  />
                                ))}
                              </div>

                              {/* Room Features */}
                              <ul className="feature-list mt-3">
                                <li>
                                  <Icon icon="la:bed" width="24" height="24" />
                                  <span>1 เตียงควีนไซส์</span>
                                </li>
                                <li>
                                  <Icon
                                    icon="ri:custom-size"
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

                            {/* ส่วนที่ 2: สิ่งอำนวยความสะดวก */}
                            <div className="col-md-4 mt-3 ps-0">
                              <h5
                                className="mb-3 rounded-end fw-light"
                                style={{
                                  backgroundColor: "rgba(113, 191, 68, 1)",
                                  color: "white",
                                  padding: "0.5rem 1rem",
                                }}
                              >
                                สิ่งอำนวยความสะดวก
                              </h5>

                              <ul
                                className={`feature-listS ${
                                  expandedFacilities[representativeAcc.id]
                                    ? "expanded"
                                    : "collapsed"
                                }`}
                              >
                                {representativeAcc.facilities
                                  .slice(
                                    0,
                                    expandedFacilities[representativeAcc.id]
                                      ? representativeAcc.facilities.length
                                      : 5
                                  )
                                  .map((facility, index) => (
                                    <li
                                      key={`acc-${representativeAcc.id}-fac-${index}`}
                                    >
                                      <Icon
                                        icon={facility.icon_name}
                                        width="24"
                                        height="24"
                                      />
                                      {facility.name}
                                    </li>
                                  ))}
                                {representativeAcc.facilities.length > 5 && (
                                  <li
                                    onClick={() => {
                                      setExpandedFacilities((prev) => ({
                                        ...prev,
                                        [representativeAcc.id]:
                                          !prev[representativeAcc.id],
                                      }));
                                    }}
                                    style={{ cursor: "pointer" }}
                                    className="dropdown-toggle-icon"
                                  >
                                    <Icon
                                      icon={
                                        expandedFacilities[representativeAcc.id]
                                          ? "mdi:chevron-up"
                                          : "mdi:chevron-down"
                                      }
                                      width="24"
                                      height="24"
                                    />
                                    {expandedFacilities[representativeAcc.id]
                                      ? "แสดงน้อยลง"
                                      : "แสดงเพิ่มเติม"}
                                  </li>
                                )}
                              </ul>
                            </div>

                            {/* ส่วนที่ 3: ตัวเลือกราคา */}
                            <div className="col-md-4 border-start bg-white">
                              <div className="price-options-container ">
                                {accommodations.map((acc) => (
                                  <div
                                    key={acc.id}
                                    className="price-option-card mb-3 mt-3 p-3 border-bottom bg-white"
                                  >
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        {acc.promotions?.[0]?.discount > 0}
                                        <DiscountedPrice accommodation={acc} />
                                        <div className="text-muted small">
                                          ราคาต่อคืน
                                          (ก่อนรวมภาษีและค่าธรรมเนียม)
                                        </div>
                                      </div>
                                      <Button
                                        variant="info"
                                        size="sm"
                                        className="text-white mt-auto"
                                        onClick={() => handleAddToBooking(acc)}
                                        disabled={selectedAccommodation.some(
                                          (a) => a.id === acc.id
                                        )}
                                      >
                                        {selectedAccommodation.some(
                                          (a) => a.id === acc.id
                                        )
                                          ? "เพิ่มแล้ว"
                                          : "เพิ่ม"}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
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
