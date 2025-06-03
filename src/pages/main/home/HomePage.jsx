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
        style={{ marginTop: isDesktop ? "2rem" : "2rem"}}
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
    </>
  );
};

export default HomePage;
