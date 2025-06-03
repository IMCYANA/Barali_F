import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthService from "../../../services/auth/auth.service";

const LoginPage = ({onLoginSuccess}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    // ตรวจสอบข้อมูล
    if (!email) {
      newErrors.email = "โปรดกรอกข้อมูลให้ครบ";
    } else if (!isValidEmail(email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!password) {
      newErrors.password = "โปรดกรอกข้อมูลให้ครบ";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      setLoginError("");

      try {
        const user = await AuthService.login(email, password);
        if (user) {
          // แสดง toast notification แทน alert
          const successToast = document.getElementById("successToast");
          if (successToast) {
            successToast.classList.add("show");
            // ตั้งเวลาซ่อน toast หลังจาก 3 วินาที
            setTimeout(() => {
              successToast.classList.remove("show");
            }, 3000);
          }

          // เรียก callback ที่ parent ส่งมา
        if (onLoginSuccess) {
    onLoginSuccess();
  } else {
    // fallback เดิม
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }

        }
      } catch (error) {
        console.error("Login error:", error);
        setLoginError(
          error.response?.data?.message ||
          "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="py-2">
      <div className="row justify-content-center">
        <div className="col-12">
          <div className="card border-0">
            <div className="card-body p-3">
              <h2 className="mb-4">เข้าสู่ระบบ</h2>
              <p>กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ</p>

              {loginError && (
                <div
                  className="alert alert-danger alert-dismissible fade show"
                  role="alert"
                >
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {loginError}
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="alert"
                    aria-label="Close"
                    onClick={() => setLoginError("")}
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    className={`form-control form-control-lg faded-placeholder ${errors.email ? "is-invalid" : ""}`}
                    id="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    รหัสผ่าน
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control form-control-lg faded-placeholder ${errors.password ? "is-invalid" : ""
                        }`}
                      id="password"
                      placeholder="กรอกรหัสผ่าน"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={toggleShowPassword}
                    >
                      <i
                        className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"
                          }`}
                      ></i>
                    </button>
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-info btn-lg text-white w-100 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    <>เข้าสู่ระบบ</>
                  )}
                </button>

                <div className="text-center mt-3"></div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 11 }}>
        <div
          id="successToast"
          className="toast align-items-center text-white bg-success border-0"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">
              <i className="bi bi-check-circle-fill me-2"></i>
              เข้าสู่ระบบสำเร็จ!
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast"
              aria-label="Close"
            ></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
