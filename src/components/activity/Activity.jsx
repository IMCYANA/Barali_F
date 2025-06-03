import { useEffect, useState } from "react";
import ActivityService from "../../services/api/activity/activity.service";
import ActivityCard from "./activityCard";
import { Spinner, Row, Col } from "react-bootstrap";

const Activity = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);
                const res = await ActivityService.getAll();
                setActivities(res?.data?.slice(0, 2) || []); 
            } catch (error) {
                console.error("Error fetching activities:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    return (
        <div className="my-5">
            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <Row className="justify-content-center g-4 px-3">
                    {activities.map(activity => (
                        <Col key={activity.id} xs={12} md={6}>
                            <ActivityCard activity={activity} />
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default Activity;
