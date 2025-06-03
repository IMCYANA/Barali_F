import LoginPage from './LoginPage'
import { Modal } from 'react-bootstrap';

const LoginModal = ({ show, onHide, onLoginSuccess }) => {
  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <LoginPage onLoginSuccess={onLoginSuccess} />
      </Modal.Body>
    </Modal>
  )
}

export default LoginModal