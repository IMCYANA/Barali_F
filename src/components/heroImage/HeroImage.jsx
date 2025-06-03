import SearchBar from "../../layouts/common/SearchBox";

const HeroImage = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const heroImage = `${BASE_URL}/uploads/heroimages/`;
  const imageStyle = {
    width: "100%",
    height: "90vh",
    objectFit: "cover",
    objectPosition: "center",
  };
  return (
    <div>
      {/* Hero Carousel */}
      <div
        id="heroCarousel"
        className="carousel slide carousel-slide"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img
              src={`${heroImage}/hero1.jpg`}
              className="d-block w-100"
              alt="Resort 1"
              style={imageStyle}
            />
            <div className="carousel-caption d-none d-md-block"></div>
          </div>
        </div>

        {/* ✅ Overlay กล่อง + SearchBar */}
        <div
          style={{
            position: "absolute",
            bottom: "25%", // ขยับจากล่างขึ้นมาเล็กน้อย
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            width: "75%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* กล่องข้อความ */}
          <div
            style={{
              width: "750px",
              height: "250px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 0 10px rgba(0,0,0,0.2)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "-40px", // ✅ ดึงให้ SearchBar ทับกล่องนิดหน่อย
              zIndex: 2,
              opacity: 0.9,
            }}
          >
            <h1 className="text-center mb-0">
              ยินดีต้อนรับสู่ <br />
              <span style={{ color: "#b58d26" }}>
                บารารี บีช รีสอร์ท เกาะช้าง
              </span>
            </h1>
          </div>

          {/* SearchBar */}
          <div
            style={{
              width: "100%",
              zIndex: 3,
            }}
          >
            <SearchBar />
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroImage;
