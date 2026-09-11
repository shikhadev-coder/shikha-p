import { use, useEffect, useState } from 'react';
import './modal.css';
import { useDispatch, useSelector } from 'react-redux';
import { reqToReportComment } from '../../Store/Slice/comment';

const ReportModal = ({ onClose, Comment }) => {
    const dispatch = useDispatch();
    const { loginUserInfo } = useSelector(state => state.auth);
    const [submit, setSumbit] = useState(false);

    useEffect(() => {
        if (!submit) return;

        dispatch(reqToReportComment({ reportedCommentId: Comment?.id, whoReported: loginUserInfo?.id }));
        setSumbit(false);
        onClose();
    }, [submit])

    return (
        <div className="Modal">
            <div style={{ backgroundColor: "#fff", color: "#000", padding: "20px", borderRadius: "10px", width: '55%', justifySelf: 'center' }}>
                <h3 style={{ textAlign: "center" }} >Report</h3>
                <p style={{ marginBottom: '20px' }}>Are You Sure Report that comment ?</p>
                <button className="action-btn cancel-btn" onClick={onClose} >
                    Cancel
                </button>
                <button className="action-btn submit-btn" onClick={() => setSumbit(true)} >
                    Report
                </button>
            </div>
        </div>
    )
}

export default ReportModal