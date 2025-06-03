import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Icon } from "@iconify/react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getThaiRoomTypeName = (typeName) => {
  const typeMap = {
    "Deluxe Villa": "ดีลักซ์วิลล่า",
    "Premier Deluxe Villa": "พรีเมียร์ดีลักซ์วิลล่า",
    "BeachFront Villa": "วิลล่าริมหาด",
    "Pool Villa": "พูลวิลล่า",
    "Junior Suite Villa": "จูเนียร์สวีทวิลล่า",
  };

  return typeMap[typeName] || typeName;
};

const AccommodationCard = ({ accommodation, availabilityRooms, promotion }) => {
  const fullImageUrl = `${BASE_URL}/uploads/accommodations/${accommodation.image_name}`;
  const originalPrice = accommodation.price_per_night;
  const discountPercent = promotion?.discount ?? 0;

  const discountedPrice =
    originalPrice && discountPercent
      ? Math.round(originalPrice * (1 - discountPercent / 100))
      : parseInt(originalPrice);

  const roomTypeDisplay = accommodation.type?.name
    ? `${getThaiRoomTypeName(accommodation.type.name)} (${
        accommodation.type.name
      })`
    : "ไม่ระบุประเภท";

  return (
    <div className="border rounded p-3 shadow-sm h-100">
      <Row>
        <Col xs={12} md={5}>
          <div
            style={{
              width: "100%",
              height: "clamp(150px, 25vw, 230px)",
              overflow: "hidden",
              borderRadius: "0.5rem",
            }}
          >
            <img
              src={fullImageUrl}
              alt={accommodation.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </Col>

        <Col md={7} style={{ paddingLeft: "2rem" }}>
          <div className="d-flex flex-column h-100 justify-content-between">
            <div>
              <h5 className="fs-4">
                {accommodation.name}
                <small className="text-dark"> {roomTypeDisplay}</small>
              </h5>
              <p className="mb-1 text-dark">
                {availabilityRooms > 0
                  ? `เหลือ ${availabilityRooms} ห้อง`
                  : "ขณะนี้ไม่มีห้องว่าง"}
              </p>

              <Row>
                <Col xs={8}>
                  <ul className="list-unstyled mb-2">
                    <li>
                      <Icon icon="ix:width" width="24" height="24" /> ขนาดห้อง:{" "}
                      {accommodation.type?.room_size} ตร.ม.
                    </li>
                    <li>
                      <Icon icon="cil:window" width="24" height="24" /> วิว:{" "}
                      {accommodation.type?.view}
                    </li>
                    <li>
                      <Icon icon="la:bed" width="24" height="24" /> เตียง:{" "}
                      {accommodation.type?.bed_type}
                    </li>
                  </ul>
                </Col>

                <Col
                  xs={4}
                  className="d-flex flex-column justify-content-center align-items-center"
                >
                  <span
                    className={`h4 ${
                      discountPercent ? "text-danger" : "text-dark"
                    }`}
                  >
                    {discountedPrice?.toLocaleString()}&nbsp;บาท
                  </span>
                  <small style={{ fontSize: "11px" }}>
                    รวมค่าธรรมเนียมและภาษี
                  </small>
                </Col>
              </Row>
            </div>

            <div className="mt-3 d-flex gap-2">
              <Button variant="outline-secondary" size="sm">
                <Icon
                  icon="hugeicons:folder-details"
                  width="24"
                  height="24"
                  className="me-1"
                />
                รายละเอียดห้องพัก
              </Button>
              <Button
                size="sm"
                className="border-0 shadow-none"
                style={{ backgroundColor: "#00BAF2", color: "white" }}
              >
                <Icon
                  icon="mynaui:click"
                  width="24"
                  height="24"
                  className="me-1"
                />
                จองเลย
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AccommodationCard;
