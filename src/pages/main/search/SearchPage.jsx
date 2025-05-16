import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Accordion, Badge } from 'react-bootstrap';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import formatPrice from '../../../utils/formatPrice';
import SearchBox from '../../../layouts/common/SearchBox';
import AccommodationService from '../../../services/api/accommodation/accommodation.service';
import TypeService from '../../../services/api/accommodation/type.service';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import FormatToBE from '../../../utils/FormatToBE';
import GetRoomAvailability from '../../../components/common/GetRoomAvailability';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [originalResults, setOriginalResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [availabilityData, setAvailabilityData] = useState({});
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    breakfast: false,
    freeCancel: false,
    highRating: false,
    selectedTypes: [],
  });
  // สร้าง ref เพื่อเก็บค่าวันที่เคยเรียกข้อมูลไปแล้ว
  // const prevDatesRef = useRef({ checkIn: null, checkOut: null });

  const destination = searchParams.get('destination') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || 1;

  const checkInDate = checkIn ? dayjs(checkIn).toDate() : null;
  const checkOutDate = checkOut ? dayjs(checkOut).toDate() : null;

  // Group accommodations by type
  const groupByType = (accommodations) => {
    return accommodations.reduce((groups, acc) => {
      const typeName = acc.type?.name || 'Other';
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
        console.error('Error fetching accommodation types:', error);
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
          ? await AccommodationService.getSearch(destination, checkIn, checkOut, guests)
          : await AccommodationService.getAll();
        const results = res?.data || [];
        setOriginalResults(results);
        setFilteredResults(results);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [searchParams, destination, checkIn, checkOut, guests]);

  useEffect(() => {
    const applyAllFilters = () => {
      const {
        priceRange,
        breakfast,
        freeCancel,
        highRating,
        selectedTypes,
      } = filters;

      const filtered = originalResults.filter(acc => {
        const price = acc.price_per_night || 0;
        const inPriceRange = price >= priceRange[0] && price <= priceRange[1];
        const matchBreakfast = !breakfast || acc.breakfastIncluded;
        const matchFreeCancel = !freeCancel || acc.freeCancellation;
        const matchHighRating = !highRating || (acc.rating && acc.rating >= 8);
        const matchType = selectedTypes.length === 0 ||
          selectedTypes.includes(acc.type?.name);
        return inPriceRange && matchBreakfast && matchFreeCancel && matchHighRating && matchType;
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
      ? filters.selectedTypes.filter(t => t !== typeName)
      : [...filters.selectedTypes, typeName];

    setFilters(prev => ({
      ...prev,
      selectedTypes: newSelectedTypes
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

    if (typeof discountPercent === 'number' && discountPercent > 0) {
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
        {/* {typeof discountPercent === 'number' && discountPercent > 0 && (
          <>
            <span className="text-decoration-line-through text-secondary me-2">
              {originalPrice.toLocaleString()}
            </span>
            <span className="text-danger fw-bold me-3">
              Save {discountPercent}%
            </span>
          </>
        )}
        {/* <span
          className={`h5 fw-bold ${discountPercent > 0 ? 'text-danger' : 'text-success'
            }`}
        >
          {discounted.toLocaleString()} บาท
        </span> */} 
      </div>
    );
  };

  return (
    <Container className='my-4'>
      <SearchBox resetFilter={resetFilters} />
      <Row className='mt-4'>
        <Col lg={3} className='mb-4'>
          <Card className='p-3 shadow-sm border-0' style={{ background: '#EEFBFF' }}>
            <h5 className='fw-bold mb-3'>ตัวกรอง</h5>
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
          <Card className='p-3 shadow-sm border-0' style={{ background: '#fff' }}>
            <h5 className='fw-bold mb-3'>ผลการค้นหา </h5>
            <div className="mb-2" style={{ color: '#888', fontSize: '1em' }}>
              <span className="me-3">เช็คอิน: <b>{FormatToBE(checkIn) || 'ไม่ระบุ'}</b></span>
              <span className="me-3">เช็คเอาท์: <b>{FormatToBE(checkOut) || 'ไม่ระบุ'}</b></span>
              <span>จำนวนผู้เข้าพัก: <b>{guests}</b></span>
            </div>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status" />
                <div className="mt-2">กำลังโหลดข้อมูล...</div>
              </div>
            ) : Object.keys(groupedVisibleResults).length > 0 ? (
              <>
                <div className="mb-3 text-end text-secondary">พบ {visibleResults.length} รายการ</div>
                <Accordion defaultActiveKey={Object.keys(groupedVisibleResults)} alwaysOpen>
                  {Object.entries(groupedVisibleResults).map(([typeName, accommodations]) => (
                    <Accordion.Item key={typeName} eventKey={typeName}>
                      <Accordion.Header>
                        <h5 className="mb-0">{typeName}</h5>
                      </Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          {accommodations.map((acc) => (
                            <Col key={acc.id} xs={12} className="mb-4">
                              <Card className="shadow-sm border-0" style={{ borderRadius: 12, background: '#f8fafd' }}>
                                <Row className="g-0">
                                  <Col md={5} className="d-flex flex-column align-items-start justify-content-center">
                                    <div style={{ width: 326, height: 216, overflow: 'hidden', borderRadius: '10px', background: '#f4f4f4' }}>  
                                      <img
                                        src={acc.image_name ? `${BASE_URL}/uploads/accommodations/${acc.image_name}` : 'https://picsum.photos/id/57/2000/3000'}
                                        alt={acc.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      />
                                    </div>
                                    <div className="mt-2 d-flex flex-wrap align-items-center justify-content-center" style={{ fontSize: '0.97em', color: '#666' }}>
                                      <span className="me-3"><i className="bi bi-people"></i> {acc.capacity || 2} คน</span>
                                      <span className="me-3"><i className="bi bi-aspect-ratio"></i> {acc.room_size || '47 m²'}</span>
                                      <span className="me-3"><i className="bi bi-wifi"></i></span>
                                      <span className="me-3"><i className="bi bi-cup-straw"></i></span>
                                    </div>
                                  </Col>
                                  <Col md={7}>
                                    <Card.Body>
                                      <Card key={acc.id} className="mb-3 border-0" style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px #e0e0e0' }}>
                                        <Card.Body className="py-2 px-3">
                                          <div className="d-flex align-items-center mb-1">
                                            <span className="fw-bold" style={{ fontSize: '1.05em', color: '#222' }}>
                                              {acc.name}
                                            </span>
                                          </div>
                                          <div className="mb-1" style={{ fontSize: '0.98em' }}>
                                            <ul className='list-unstyled'>
                                              {/* {acc.amenities.split(",").map((amenity, index) => (
                                                <li key={index}>{amenity.trim()}</li>
                                              ))} */}
                                            </ul>
                                          </div>
                                          {/* <div className="mb-1" style={{ fontSize: '0.93em' }}>
                                            <span className="fw-bold text-decoration-underline">Booking Condition</span> <br />
                                            <span>{acc.description}</span>
                                          </div> */}
                                          <div className="d-flex align-items-center justify-content-between mt-2">
                                            <DiscountedPrice accommodation={acc} />
                                            {/* กล่องราคาจำลอง 3 กล่อง */}
                                            <div className="mt-3">
                                              {[1, 2, 3].map((i) => (
                                                <Card key={i} className="mb-2 p-3 border shadow-sm" style={{ borderRadius: 10 }}>
                                                  <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                      <h6 className="fw-bold mb-1">รวมอาหารเช้า</h6>
                                                      <div className="text-muted small mb-1">ยกเลิกฟรีก่อนวันเข้าพัก</div>
                                                      <div className="d-flex align-items-baseline flex-wrap">
                                                        <span className="text-decoration-line-through text-secondary me-2">9,000 บาท</span>
                                                        <span className="text-danger fw-bold me-2">ลด 75%</span>
                                                        <span className="fw-bold text-success">2,250 บาท</span>
                                                      </div>
                                                    </div>
                                                    <Button variant="primary" style={{ minWidth: 80, borderRadius: 10 }}>จอง</Button>
                                                  </div>
                                                </Card>
                                              ))}
                                            </div>

                                            {/* {availabilityData[acc.id] !== undefined (
                                              <Button
                                                variant="secondary"
                                                disabled
                                                style={{ minWidth: 100, borderRadius: 20 }}
                                              >
                                                ห้องเต็ม
                                              </Button>
                                            ) : (
                                              <Button
                                                variant="success"
                                                style={{ minWidth: 100, borderRadius: 20 }}
                                                onClick={""}
                                              >
                                                จองเลย
                                              </Button>
                                            )} */}
                                          </div>

                                          {/* แสดง Badge เฉพาะเมื่อห้องว่างมากกว่า 0 */}
                                          {availabilityData[acc.id] !== undefined && availabilityData[acc.id] > 0 && (
                                            <div className="mt-2">
                                              <Badge bg="info" style={{ fontSize: '1em' }}>
                                                ห้องว่าง: {availabilityData[acc.id]} ห้อง
                                              </Badge>
                                            </div>
                                          )}

                                        </Card.Body>
                                      </Card>
                                    </Card.Body>
                                  </Col>
                                </Row>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
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