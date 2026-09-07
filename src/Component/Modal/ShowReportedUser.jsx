import './modal.css';
import { useEffect, useState } from "react";


const ShowReportedUserModal = ({ onClose , reportedUser , onUnreport}) => {

    const [reportedUserList, setReportedUserList] = useState(reportedUser);


    const handleUnReportedUser = (userId) => {
        const reportedList = JSON.parse(localStorage.getItem('reportedUser')) || [];
        const filterData = reportedList?.filter((item) => item.reportedUser !== userId);
        const filterList = reportedUserList?.filter((item) =>item?.id !== userId);
        setReportedUserList(filterList);
        localStorage.setItem('reportedUser' , JSON.stringify(filterData));
        onUnreport(userId);
    }

    useEffect(() => {
        if (reportedUserList.length === 0) {
            onClose();
        }
    }, [reportedUserList, onClose]);

    return (

        <div className="Modal">
            <div style={{backgroundColor:"#fff" , color:"#000" , padding:"20px" , borderRadius:"10px" , width:'55%' , justifySelf:'center'}}>
                <h3 style={{textAlign:"center"}} >Reported User</h3>
            <table className="table">
                <tbody>
                    <tr>
                        <th>#</th>
                        <th>User</th>
                        <th>Action</th>
                    </tr>
                    {reportedUserList.length > 0 ? reportedUserList?.map((user, index) => (
                        <tr key={index}>
                            <th>{index + 1}</th>
                            <th>{user.firstName + " " + user.lastName}</th>
                            <th><button className="action-btn" onClick={() => handleUnReportedUser(user.id)}>Unreported</button></th>
                        </tr>
                    )) : <tr><td colSpan='2'>No User</td></tr>}
                </tbody>
            </table>
            <button className="action-btn cancel-btn" onClick={onClose} >
                    Cancel
            </button>
            </div>
        </div>
    );
};

export default ShowReportedUserModal;