import { useSelector } from 'react-redux';
import './modal.css';
import { useEffect, useMemo, useState } from "react";


const ShowReportedUserModal = ({ onClose, reportedUser, onUnreport }) => {

    const [reportedUserList, setReportedUserList] = useState(reportedUser);
    const { loginUserInfo, userData } = useSelector(state => state.auth);
    const loginUserData = useMemo(() => userData?.find((user) => user?.id === loginUserInfo?.id), [userData, loginUserInfo?.id]);

    const handleUnReportedUser = (userId) => {
        const reportedList = Array.isArray(loginUserData?.reportedUserDetail) ? loginUserData.reportedUserDetail.filter((report) => Number(report?.whoReported) === Number(loginUserInfo?.id)) : [];
        const filterList = reportedUserList?.filter((item) => item?.id !== userId && loginUserInfo?.id !== item?.whoReported);
        const previousLikeId = reportedList?.filter((item) => item.reportedUser === userId && loginUserInfo?.id === item?.whoReported)?.flatMap((data) => data?.previousLikeId)
        const previousDislikeId = reportedList?.filter((item) => item.reportedUser === userId && loginUserInfo?.id === item?.whoReported)?.flatMap((data) => data?.previousDislikeId)
        setReportedUserList(filterList);
        onUnreport(userId, previousLikeId?.flat(), previousDislikeId?.flat());
    }

    useEffect(() => {
        if (reportedUserList.length === 0) {
            onClose();
        }
    }, [reportedUserList, onClose]);

    return (
        <div className="Modal">
            <div className="reported-user-modal">
                <h3>Reported User</h3>

                <table className="reported-user-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>User</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {reportedUserList.length > 0 ? (
                            reportedUserList.map((user, index) => (
                                <tr key={user.id || index}>
                                    <td>{index + 1}</td>
                                    <td>{user.firstName} {user.lastName}</td>
                                    <td>
                                        <button className="action-btn unreport-btn" onClick={() => handleUnReportedUser(user.id)}>
                                            Unreport
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="no-user">
                                    No reported users
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="modal-footer">
                    <button className="action-btn cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShowReportedUserModal;