import { useState, useEffect } from 'react';
import {
  Form,
  FormControl,
  Button,
  Row,
  Col,
  DropdownButton,
  InputGroup
} from 'react-bootstrap';
import { FaCalendarAlt, FaUserFriends } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import dayjs from 'dayjs';
import "dayjs/locale/th";
import th from 'date-fns/locale/th';
import { registerLocale } from 'react-datepicker';
registerLocale('th', th);

export default function SearchBar({
  initialCheckInDate = null,
  initialCheckOutDate = null,
  initializeAdults = 1,
  initializeChildren = 0,
  initializeRooms = 1,
}) {
  const navigate = useNavigate();
  const [checkInDate, setCheckInDate] = useState(initialCheckInDate);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOutDate);
  const [adults, setAdults] = useState(initializeAdults);
  const [children, setChildren] = useState(initializeChildren);
  const [rooms, setRooms] = useState(1);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate("/search-results");
  };

  const CustomInput = ({ value, onClick, placeholder }) => (
    <InputGroup onClick={onClick}>
      <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
      <FormControl
        placeholder={placeholder}
        value={value}
        readOnly
        className="bg-white"
      />
    </InputGroup>
  );

  return (
    <Form
      className="p-4 rounded bg-opacity-75 shadow-sm mx-auto"
      style={{ maxWidth: '900px',
        backgroundColor: '#18abdb',
       }}
      onSubmit={handleSearch}
    >
      <div className="bg-white p-2 rounded shadow-sm">
        <Row className="align-items-end g-3">

          {/* Check-in */}
          <Col md>
            <DatePicker
              selected={checkInDate}
              onChange={(date) => setCheckInDate(date)}
              selectsStart
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              locale="th"
              placeholderText="เลือกวันที่เช็คอิน"
              customInput={<CustomInput
                value={checkInDate ? dayjs(checkInDate).format("DD/MM/YYYY") : ""}
                placeholder="เลือกวันที่เช็คอิน"
              />}
              popperContainer={({ children }) => (
                <div style={{ zIndex: 2000, position: "relative" }}>{children}</div>
              )}
            />
          </Col>

          {/* Check-out */}
          <Col md>
            <DatePicker
              selected={checkOutDate}
              onChange={(date) => setCheckOutDate(date)}
              selectsEnd
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={checkInDate || new Date()}
              dateFormat="dd/MM/yyyy"
              locale="th"
              placeholderText="เลือกวันที่เช็คเอาท์"
              customInput={<CustomInput
                value={checkOutDate ? dayjs(checkOutDate).format("DD/MM/YYYY") : ""}
                placeholder="เลือกวันที่เช็คเอาท์"
              />}
              popperContainer={({ children }) => (
                <div style={{ zIndex: 2000, position: "relative" }}>{children}</div>
              )}
            />
          </Col>

          {/* Guests and Rooms Dropdown */}
          <Col md>
            <DropdownButton
              id="dropdown-guests"
              title={
                <span>
                  <FaUserFriends className="me-2" />
                  จำนวนผู้ใหญ่ และ เด็ก
                </span>
              }
              variant="outline-secondary"
            >
              <div className="px-3 py-2" style={{ minWidth: '220px' }}>
                <Form.Group className="mb-2">
                  <Form.Label>ผู้ใหญ่ (สูงสุด 4)</Form.Label>
                  <Form.Select value={adults} onChange={e => setAdults(Number(e.target.value))}>
                    {[1, 2, 3, 4].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>เด็ก (สูงสุด 2)</Form.Label>
                  <Form.Select value={children} onChange={e => setChildren(Number(e.target.value))}>
                    {[0, 1, 2].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* <Form.Group>
                  <Form.Label>ห้องพัก (สูงสุด 5)</Form.Label>
                  <Form.Select value={rooms} onChange={e => setRooms(Number(e.target.value))}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </Form.Select>
                </Form.Group> */}
              </div>
            </DropdownButton>
          </Col>

          {/* Search Button */}
          <Col xs="auto">
            <Button type="submit" className="w-100 px-4 text-white" style={{ backgroundColor: '#18abdb', borderColor: '#18abdb' }}>
              ค้นหา
            </Button>
          </Col>
        </Row>
      </div>
    </Form>
  );
}