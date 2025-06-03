import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Row, Col, Table, Spinner, Alert, Form } from 'react-bootstrap';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const BookingConfirmation = () => {
  const { state } = useLocation();
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const [paymentData, setPaymentData] = useState(state || null);
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(!!paymentId);
  const [error, setError] = useState(null);
  const [inputPaymentId, setInputPaymentId] = useState('');
  const [isFetchingById, setIsFetchingById] = useState(false);

  // โหลด user จาก localStorage แค่ครั้งเดียว
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // โหลด payment data หากมี paymentId หรือ state
  useEffect(() => {
    if (paymentId) {
      fetchPayment(paymentId);
    } else if (state) {
      setPaymentData(state);
    }
  }, [paymentId, state]);

  const fetchPayment = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/payment/${id}`);
      setPaymentData(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching payment:', err);
      setPaymentData(null);
      setError('ไม่พบข้อมูลการชำระเงินสำหรับ ID นี้');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!inputPaymentId.trim()) return;

    setIsFetchingById(true);
    await fetchPayment(inputPaymentId);
    setIsFetchingById(false);
  };

  if (loading || isFetchingById) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <p className="mt-3">กำลังโหลดข้อมูล...</p>
      </Container>
    );
  }

  if (!paymentData) {
    return (
      <Container className="my-5" style={{ maxWidth: 500 }}>
        <h5 className="mb-4 text-center">กรอกรหัสการชำระเงิน</h5>
        {error && <Alert variant="danger" dismissible>{error}</Alert>}
        <Form onSubmit={handleManualSearch}>
          <Form.Group controlId="paymentId">
            <Form.Label>Payment ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="เช่น 123456"
              value={inputPaymentId}
              onChange={(e) => setInputPaymentId(e.target.value)}
            />
          </Form.Group>
          <div className="mt-3 d-flex justify-content-between">
            <Button variant="secondary" onClick={() => navigate('/')}>กลับหน้าหลัก</Button>
            <Button variant="primary" type="submit" disabled={isFetchingById}>ค้นหา</Button>
          </div>
        </Form>
      </Container>
    );
  }

  const {
    roomIds,
    checkIn,
    checkOut,
    adults,
    children,
    totalPrice,
    dueDate
  } = paymentData;

  const handleMockPayment = async () => {
  try {
    const res = await axios.post(`${BASE_URL}/api/payment/confirm/${paymentData._id}`);
    console.log('Payment confirmed:', res.data);
    alert('อัปเดตสถานะเป็น "ชำระเงินแล้ว" สำเร็จ');
    setPaymentData({ ...paymentData, status: 'paid' }); // จำลองการอัปเดตสถานะ
  } catch (err) {
    console.error(err);
    alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
  }
};

  const formatDate = (dateStr) =>
    dateStr ? dayjs(dateStr).locale('th').format('DD MMMM YYYY') : '-';

  return (
    <Container className="my-5 p-4 border rounded shadow-sm bg-white" style={{ maxWidth: 700 }}>
      <div className="text-center mb-4">
        <img src="https://www.baraliresort.com/images/logo.png" alt="Barali Logo" style={{ height: 80 }} />
        <h5 className="mt-3">สรุปข้อมูลการจอง</h5>
      </div>

      <Row className="mb-3">
        <Col><strong>ข้อมูลผู้จอง</strong></Col>
      </Row>
      <Table bordered>
        <tbody>
          <tr>
            <td>ชื่อผู้จอง</td>
            <td>{user?.name || '-'}</td>
          </tr>
          <tr>
            <td>อีเมล</td>
            <td>{user?.email || '-'}</td>
          </tr>
        </tbody>
      </Table>

      <Row className="mt-4 mb-3">
        <Col><strong>รายละเอียดการจอง</strong></Col>
      </Row>
      <Table bordered>
        <tbody>
          <tr>
            <td>วันที่เช็คอิน</td>
            <td>{formatDate(checkIn)}</td>
          </tr>
          <tr>
            <td>วันที่เช็คเอาท์</td>
            <td>{formatDate(checkOut)}</td>
          </tr>
          <tr>
            <td>จำนวนห้อง</td>
            <td>{Array.isArray(roomIds) ? roomIds.length : '-'}</td>
          </tr>
          <tr>
            <td>ผู้ใหญ่</td>
            <td>{adults ?? '-'}</td>
          </tr>
          <tr>
            <td>เด็ก</td>
            <td>{children ?? '-'}</td>
          </tr>
        </tbody>
      </Table>

      <Row className="mt-4 mb-3">
        <Col><strong>ราคาทั้งหมด</strong></Col>
      </Row>
      <Table bordered>
        <tbody>
          <tr>
            <td>ยอดรวม</td>
            <td>{!isNaN(parseInt(totalPrice)) ? parseInt(totalPrice).toLocaleString() : '-'} บาท</td>
          </tr>
          <tr>
            <td>ครบกำหนดชำระ</td>
            <td>{formatDate(dueDate)}</td>
          </tr>
        </tbody>
      </Table>

      {paymentData?.status !== 'paid' ? (
  <>
    <Row className="mt-4 mb-3">
      <Col><strong>QR Code สำหรับชำระเงิน (จำลอง)</strong></Col>
    </Row>
    <div className="text-center mb-3">
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.youtube.com/watch?v=8WCmS9fIlZo`}
        alt="QR Code"
        style={{ border: '1px solid #ccc', padding: 10, background: '#fff' }}
      />
      <div className="text-muted mt-2" style={{ fontSize: '0.9em' }}>
        สแกนเพื่อชำระเงิน (ปลอม ๆ 😆)
      </div>
    </div>

    <div className="text-center">
      <Button variant="success" onClick={handleMockPayment}>
        ฉันได้ชำระเงินแล้ว (จำลอง)
      </Button>
    </div>
  </>
) : (
  <Alert variant="success" className="mt-4 text-center">
    ✅ ชำระเงินเรียบร้อยแล้ว
  </Alert>
)}
    </Container>
  );
};

export default BookingConfirmation;
