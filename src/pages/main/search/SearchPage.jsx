import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Accordion,
  Badge,
} from "react-bootstrap";
import dayjs from "dayjs";
import "dayjs/locale/th";
import formatPrice from "../../../utils/formatPrice";
import SearchBox from "../../../layouts/common/SearchBox";
import AccommodationService from "../../../services/api/accommodation/accommodation.service";
import TypeService from "../../../services/api/accommodation/type.service";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import FormatToBE from "../../../utils/FormatToBE";
import GetRoomAvailability from "../../../components/common/GetRoomAvailability";
import { Icon } from "@iconify-icon/react";
import "/src/css/SearchPage.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [originalResults, setOriginalResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [availabilityData, setAvailabilityData] = useState({});
  const [filters, setFilters] = useState({
    selectedTypes: [],
  });
  // สร้าง ref เพื่อเก็บค่าวันที่เคยเรียกข้อมูลไปแล้ว
  // const prevDatesRef = useRef({ checkIn: null, checkOut: null });

  const destination = searchParams.get("destination") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || 1;

  const checkInDate = checkIn ? dayjs(checkIn).toDate() : null;
  const checkOutDate = checkOut ? dayjs(checkOut).toDate() : null;

  // Group accommodations by type
  const groupByType = (accommodations) => {
    return accommodations.reduce((groups, acc) => {
      const typeName = acc.type?.name || "Other";
      if (!groups[typeName]) {
        groups[typeName] = [];
      }
      groups[typeName].push(acc);
      return groups;
    }, {});
  };

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

  useEffect(() => {
    document.title = `Barali Beach Resort`;
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const res = destination
          ? await AccommodationService.getSearch(
              destination,
              checkIn,
              checkOut,
              guests
            )
          : await AccommodationService.getAll();
        const results = res?.data || [];
        setOriginalResults(results);
        setFilteredResults(results);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [searchParams, destination, checkIn, checkOut, guests]);

  useEffect(() => {
    const applyAllFilters = () => {
      const { priceRange, breakfast, freeCancel, highRating, selectedTypes } =
        filters;

      const filtered = originalResults.filter((acc) => {
        const price = acc.price_per_night || 0;
        const matchType =
          selectedTypes.length === 0 || selectedTypes.includes(acc.type?.name);
        return (
          matchType
        );
      });

      setFilteredResults(filtered);
    };

    applyAllFilters();
  }, [filters, originalResults]);

  // Fetch availability data when checkInDate or checkOutDate changes
  useEffect(() => {
    const fetchData = async () => {
      if (checkInDate && checkOutDate) {
        const result = await GetRoomAvailability(checkInDate, checkOutDate);
        setAvailabilityData(result);
      }
    };

    fetchData();
  }, [checkInDate, checkOutDate]);

  const resetFilters = () => {
    setFilters({
      priceRange: [0, 10000],
      breakfast: false,
      freeCancel: false,
      highRating: false,
      selectedTypes: [],
    });
    setFilteredResults(originalResults);
  };

  const handleTypeChange = (typeName) => {
    const newSelectedTypes = filters.selectedTypes.includes(typeName)
      ? filters.selectedTypes.filter((t) => t !== typeName)
      : [...filters.selectedTypes, typeName];

    setFilters((prev) => ({
      ...prev,
      selectedTypes: newSelectedTypes,
    }));
  };

  const matchesSearchTerm = (acc) => {
    if (!destination) return true;
    const term = destination.toLowerCase();
    return (
      acc.name?.toLowerCase().includes(term) ||
      acc.city?.toLowerCase().includes(term) ||
      acc.province?.toLowerCase().includes(term) ||
      acc.type?.name?.toLowerCase().includes(term)
    );
  };

  const visibleResults = filteredResults.filter(matchesSearchTerm);
  const groupedVisibleResults = groupByType(visibleResults);

  const getDiscountedPrice = (accommodation) => {
    const originalPrice = accommodation.price_per_night;
    const discountPercent = accommodation.discount;

    if (typeof discountPercent === "number" && discountPercent > 0) {
      return Math.round(originalPrice * (1 - discountPercent / 100));
    }

    return originalPrice;
  };

  const DiscountedPrice = ({ accommodation }) => {
    const originalPrice = accommodation.price_per_night;
    const discountPercent = accommodation.discount;
    const discounted = getDiscountedPrice(accommodation);

    return (
      <div className="d-flex align-items-baseline mb-2">
        {typeof discountPercent === "number" && discountPercent > 0 && (
          <>
            <span className="text-decoration-line-through text-secondary me-2">
              {originalPrice.toLocaleString()}
            </span>
            <span className="text-danger fw-bold me-3">
              Save {discountPercent}%
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
      <Row className="mt-4">
        <Col lg={3} className="mb-4">
          <Card
            className="p-3 shadow-sm border-0 "
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
          </Card>
        </Col>
        <Col lg={9}>
          <Card
            className="p-3 shadow-sm border-0"
            style={{ background: "#fff" }}
          >
            <h5 className="fw-bold mb-3">ผลการค้นหา </h5>
            <div className="mb-2" style={{ color: "#888", fontSize: "1em" }}>
              <span className="me-3">
                เช็คอิน: <b>{FormatToBE(checkIn) || "ไม่ระบุ"}</b>
              </span>
              <span className="me-3">
                เช็คเอาท์: <b>{FormatToBE(checkOut) || "ไม่ระบุ"}</b>
              </span>
              <span>
                จำนวนผู้เข้าพัก: <b>{guests}</b>
              </span>
            </div>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status" />
                <div className="mt-2">กำลังโหลดข้อมูล...</div>
              </div>
            ) : Object.keys(groupedVisibleResults).length > 0 ? (
              <>
                <div className="mb-3 text-end text-secondary">
                  พบ {visibleResults.length} รายการ
                </div>
                {Object.entries(groupedVisibleResults).map(
                  ([typeName, accommodations]) => (
                    <>
                      <hr className="h-2" />
                      <h2 className="mb-0 mt-2">{typeName}</h2>
                      <div className="container mt-4 p-3 border rounded bg-light">
                        {accommodations.map((acc) => (
                          <div className="row">
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
                              />
                              <div className="d-flex flex-wrap gap-2">
                                <img
                                  src="https://via.placeholder.com/90"
                                  className="img-thumbnail"
                                  alt="Thumb 1"
                                />
                                <img
                                  src="https://via.placeholder.com/90"
                                  className="img-thumbnail"
                                  alt="Thumb 2"
                                />
                              </div>
                              <ul className="feature-list">
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
                                <li>
                                  <Icon
                                    icon="mdi:bathroom"
                                    width="27"
                                    height="27"
                                  />
                                  ฝักบัวและอ่างอาบน้ำ
                                </li>
                                <li>
                                  <Icon icon="fa:tv" width="27" height="27" />
                                  โทรทัศน์
                                </li>
                              </ul>
                            </div>

                            {/* Facilities */}
                            <div className="col-md-4">
                              <h5 className="text-success mb-3">
                                สิ่งอำนวยความสะดวก
                              </h5>
                              <ul className="feature-list">
                                <li>
                                  <Icon icon="fa:tv" width="20" height="20" />
                                  รวมอาหารเช้า
                                </li>
                                <li>
                                  <Icon
                                    icon="hugeicons:hair-dryer"
                                    width="20"
                                    height="20"
                                  />
                                  ไดร์เป่าผม
                                </li>
                                <li>
                                  <Icon
                                    icon="streamline:parking-sign"
                                    width="20"
                                    height="20"
                                  />
                                  ที่จอดรถ
                                </li>
                                <li>
                                  <Icon
                                    icon="mage:wifi"
                                    width="20"
                                    height="20"
                                  />
                                  อินเทอร์เน็ตไร้สาย (Wi-Fi)
                                </li>
                                <li>
                                  <Icon
                                    icon="cil:fridge"
                                    width="20"
                                    height="20"
                                  />
                                  ตู้เย็น
                                </li>
                                <li>
                                  <Icon
                                    icon="iconoir:sandals"
                                    width="20"
                                    height="20"
                                  />
                                  รองเท้าเเตะ
                                </li>
                                <li>
                                  <Icon
                                    icon="iconoir:home-table"
                                    width="20"
                                    height="20"
                                  />
                                  โต๊ะทำงาน
                                </li>
                                <li>
                                  <Icon
                                    icon="hugeicons:tissue-paper"
                                    width="20"
                                    height="20"
                                  />
                                  กระดาษชำระ
                                </li>
                                <li>
                                  <Icon
                                    icon="hugeicons:umbrella"
                                    width="20"
                                    height="20"
                                  />
                                  ร่ม
                                </li>
                              </ul>
                            </div>

                            {/* Prices & Booking */}
                            <div className="col-md-4">
                              <div className="border rounded p-3 mb-3 bg-white">
                                {acc.discount > 0 && (
                                  <div className="text-success mb-2">
                                    มีคูปองส่วนลด {acc.discount}%
                                  </div>
                                )}

                                <DiscountedPrice accommodation={acc} />

                                <div className="text-muted">
                                  ราคาต่อคืน (ก่อนรวมภาษีและค่าธรรมเนียม)
                                </div>
                                <button className="btn btn-primary mt-2 w-100">
                                  จอง
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )
                )}
              </>
            ) : (
              <div className="text-center text-muted py-5">
                <i className="bi bi-emoji-frown" style={{ fontSize: 40 }}></i>
                <div className="mt-2">ไม่พบที่พักตามเงื่อนไขที่คุณระบุ</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SearchPage;
