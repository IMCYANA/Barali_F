import { useEffect, useState } from "react";
import Popular from "../../../components/accommodation/Popular";
import Promotion from "../../../components/accommodation/Promotion";
import Activity from "../../../components/activity/Activity";
import HeroImage from "../../../components/heroImage/HeroImage";
import SearchBox from "../../../layouts/common/SearchBox";

const HomePage = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* ภาพ Hero */}
      <HeroImage />

      {/* รายการที่พักยอดนิยม */}
      <section
        className="container mb-4"
        style={{ marginTop: isDesktop ? "2rem" : "2rem" }}
      >
        <h3 className="fw-bold" style={{ marginBottom: "2rem" }}>
          <span className="border-bottom border-3 border-primary">
            ห้องพักยอดนิยม
          </span>
        </h3>
        <Popular />
      </section>

      {/* โปรโมชัน */}
      <section className="container my-4">
        <h3 className="fw-bold">
          <span className="border-bottom border-3 border-primary">
            โปรโมชันพิเศษ
          </span>
        </h3>
        <Promotion />
      </section>

      {/* กิจกรรมแนะนำ */}
      <section className="container my-5">
        <h3 className="text-center fw-bold">
          <span className="border-bottom border-3 border-primary">
            เพลิดเพลินกับกิจกรรมชายหาดของเรา
          </span>
        </h3>
        <Activity />
      </section>

      {/* ส่วน Footer แบบเรียบง่ายตามภาพ */}
      <section style={{ backgroundColor: "#e8f8fb", padding: "2rem 0" }}>
        <div className="container">
          <div className="row">
            <div className="col-md-3 col-6 mb-3">
              <h6 className="fw-bold">เกี่ยวกับเรา</h6>
              <ul className="list-unstyled">
                <li>หน้าหลัก</li>
                <li>ห้องพักเรา</li>
                <li>สิ่งอำนวยความสะดวก</li>
                <li>การบริการอาหาร</li>
                <li>แกลเลอรี่</li>
                <li>โปรโมชั่น</li>
                <li>ติดต่อเรา</li>
              </ul>
            </div>
            <div className="col-md-3 col-6 mb-3">
              <h6 className="fw-bold">ห้องพักและห้องชุด</h6>
              <ul className="list-unstyled">
                <li>ดีลักซ์ วิวสระ</li>
                <li>พรีเมียม ซีวิวส์</li>
                <li>วิลลา วิวทะเล</li>
                <li>พูล วิลลา</li>
                <li>วิลลา จูเนียร์สวีต</li>
              </ul>
            </div>
            <div className="col-md-3 col-6 mb-3">
              <h6 className="fw-bold">จุดหมายปลายทางและกิจกรรม</h6>
              <ul className="list-unstyled">
                <li>เที่ยวในสถานที่ใกล้</li>
                <li>Spa</li>
              </ul>
            </div>
            <div className="col-md-3 col-6 mb-3">
              <h6 className="fw-bold">กิจกรรม</h6>
              <ul className="list-unstyled">
                <li>งานแต่ง</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
