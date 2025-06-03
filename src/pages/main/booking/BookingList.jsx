import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AuthService from "../../../services/auth/auth.service";

const BookingList = () => {
  const [selectedAccommodation, setSelectedAccommodation] = useState([]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [userId, setUserId] = useState(""); // สมมุติว่าได้มาจาก auth
  const isLoggedIn = Boolean(userId);
  const navigate = useNavigate();
  

  useEffect(() => {
    const storedAccommodation = localStorage.getItem("selectedAccommodation");
    const bookingInfo = localStorage.getItem("bookingInfo");
    const storedUserId = AuthService.getCurrentUser()?.id;


    if (storedAccommodation) {
      try {
        const parsed = JSON.parse(storedAccommodation);
        setSelectedAccommodation(parsed);
      } catch (error) {
        console.error("Failed to parse selectedAccommodation:", error);
        localStorage.removeItem("selectedAccommodation");
      }
    }

    if (bookingInfo) {
      try {
        const parsed = JSON.parse(bookingInfo);
        setCheckIn(parsed.checkIn);
        setCheckOut(parsed.checkOut);
        setAdults(parsed.adults);
        setChildren(parsed.children);
      } catch (error) {
        console.error("Failed to parse bookingInfo:", error);
        localStorage.removeItem("bookingInfo");
      }
    }

    
    if (storedUserId) setUserId(storedUserId);
  }, []);

  console.log(`CheckIn: ${checkIn} CheckOut: ${checkOut}`);

  const handleRemoveRoom = (roomId) => {
    const updatedRooms = selectedAccommodation.filter((room) => room.id !== roomId);
    setSelectedAccommodation(updatedRooms);
    localStorage.setItem("selectedAccommodation", JSON.stringify(updatedRooms));
    window.dispatchEvent(new Event("accommodationChanged"));
  };

  const getDiscountedPrice = (room) => {
    const price = room.price_per_night || 0;
    const discount = room.promotions?.[0]?.discount || 0;
    return price - (price * discount) / 100;
  };

  return (
  <>
    {selectedAccommodation.length > 0 ? (
      <Card className="mb-4 shadow-sm border-1 bg-light bg-opacity-10 w-50 mt-3 mx-auto">
        <h5 className="fw-bold px-3 pt-4">รายการห้องที่คุณเลือก</h5>
        <ul className="list-group mb-3">
          {selectedAccommodation.map((room) => (
            <li
              key={room.id}
              className="list-group-item d-flex justify-content-between align-items-center bg-info bg-opacity-10"
            >
              <div className="d-flex flex-wrap align-items-center gap-2">
                <span className="fw-semibold">{room.type?.name}</span>
                <span>|</span>
                <span className="text-success">
                  {parseInt(getDiscountedPrice(room)).toLocaleString()} บาท
                </span>
                {room.promotions?.[0]?.discount > 0 && (
                  <span className="text-danger">
                    ลด {parseInt(room.promotions[0].discount)}%
                  </span>
                )}
              </div>
              <Button
                className="ms-2"
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
          variant="outline-secondary"
          className="mt-2 me-2"
          onClick={() => {
            const queryParams = new URLSearchParams({
              checkIn,
              checkOut,
              adults,
              children,
            }).toString();
            navigate(`/search-results?${queryParams}`);
          }}
        >
          เลือกห้องพักเพิ่ม
        </Button>
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
          }}
        >
          ยืนยันการจองทั้งหมด ({selectedAccommodation.length} ห้อง)
        </Button>
        {!isLoggedIn && (
          <div className="text-danger mt-2">กรุณาเข้าสู่ระบบก่อนทำการจอง</div>
        )}
      </Card>
    ) : (
      <Card className="text-center p-4 mt-5 mb-5 mx-auto w-50 bg-light bg-opacity-10 shadow-sm">
        <h5 className="mb-5 mt-5 text-secondary ">ยังไม่มีรายการห้องพักที่คุณเลือก</h5>
        <Button
          variant="outline-secondary"
          className="mt-1 me-2 mb-5"
          onClick={() => {
            const queryParams = new URLSearchParams({
              checkIn,
              checkOut,
              adults,
              children,
            }).toString();
            navigate(`/search-results?${queryParams}`);
          }}
        >
          เลือกห้องพักเพิ่ม
        </Button>
      </Card>
    )}
  </>
);

};

export default BookingList;
