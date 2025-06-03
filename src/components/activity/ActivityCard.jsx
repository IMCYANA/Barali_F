import { useState } from 'react';
import { Modal } from 'react-bootstrap';

const ActivityCard = ({ activity }) => {
    const [showModal, setShowModal] = useState(false);

    const imageUrl = `${import.meta.env.VITE_BASE_URL}/uploads/activities/${activity.image_name}`;
    const title = activity.name || "กิจกรรม";
    // const description = activity.description || ""; // Added description support

    const handleCardClick = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    return (
        <>
            {/* Card Component */}
            <div className="activity-card-wrapper h-100">
                <button
                    className="activity-card h-100 d-flex flex-column border rounded overflow-hidden shadow-sm text-start p-0 bg-white w-100"
                    onClick={handleCardClick}
                    aria-label={`View details of ${title}`}
                    style={{ 
                        cursor: "pointer",
                        transition: "transform 0.2s ease",
                        border: "none"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                    <div className="activity-image-container position-relative" style={{ height: "320px" }}>
                        <img
                            src={imageUrl}
                            alt={title}
                            className="activity-image img-fluid w-100 h-100 object-fit-cover"
                            loading="lazy" // Added lazy loading
                        />
                        <div className="activity-overlay position-absolute w-100 h-100 d-flex align-items-end top-0 start-0">
                            <div className="overlay-content w-100 p-3 bg-dark bg-opacity-50">
                                <h5 className="activity-title mb-0 text-white text-truncate">{title}</h5>
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            {/* Modal Component */}
            <Modal
                show={showModal}
                onHide={handleCloseModal}
                centered
                size="xl"
                dialogClassName="activity-modal"
                aria-labelledby="activity-modal-title"
                backdrop="static" // Added backdrop static to prevent closing when clicking outside
            >
                <Modal.Body className="p-0">
                    <div className="position-relative bg-white rounded shadow overflow-hidden">
                        {/* Close Button */}
                        <button
                            onClick={handleCloseModal}
                            className="btn btn-close position-absolute top-0 end-0 m-2 z-3 bg-white rounded-circle p-2"
                            aria-label="Close"
                            style={{
                                opacity: 1,
                                boxShadow: "0 0 5px rgba(0,0,0,0.3)"
                            }}
                        />

                        {/* Image */}
                        <img
                            src={imageUrl}
                            alt={title}
                            className="w-100 img-fluid"
                            style={{ 
                                objectFit: 'cover', 
                                maxHeight: '60vh',
                                width: '100%'
                            }}
                        />

                        {/* Content */}
                        <div className="p-2">
                            <h4 
                                id="activity-modal-title" 
                                className="mb-3 text-center fw-bold"
                                style={{ color: "#333" }}
                            >
                                {title}
                            </h4>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ActivityCard;