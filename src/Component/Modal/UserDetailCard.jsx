import './modal.css';
const UserDetailCard = ({ handleReportUser, user, handleFollow, onClose , userId , follow , handleBlocked , blocked}) => {
    return (
        <div className="Modal">
            <div className='user-card'>
                <span className='user-name'>{user.firstName + " " + user.lastName}</span>
                <div>
                    User Status : <span className={`status-${user.status}`}>{user.status}</span>
                </div>
                <div className='action-container'>
                    <button className='action-btn unreport-btn' onClick={() => handleReportUser(user?.id)}>{userId === user.id ? "Active User" : "Report"}</button>
                    {userId !== user.id && 
                    <>
                    {!blocked?.includes(user?.id) && <button className='action-btn submit-btn' onClick={() => handleFollow(user?.id)}>{follow?.includes(user?.id) ? 'Following' : 'Follow'}</button>}
                    <button className='action-btn cancel-btn' onClick={() => handleBlocked(user?.id)}>{blocked?.includes(user?.id )? 'UnBlocked' : 'Blocked' }</button>
                    </>
                    }
                    <button className='action-btn cancel-btn' onClick={onClose}>Cancel</button>
                </div>
            </div>

        </div>
    )
}

export default UserDetailCard;