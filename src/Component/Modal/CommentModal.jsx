import { use, useEffect, useMemo, useRef, useState } from "react";
import './modal.css';
import { useDispatch, useSelector } from "react-redux";
import {
    reqToAddComment,
    reqToAddDislike,
    reqToAddLike,
    reqToDeleteComment,
    reqToReplyToComment,
    reqToUpdateComment
} from "../../Store/Slice/comment";
import { DeleteIcon, DislikeIcon, EditIcon, ExpandLess, ExpandMore, LikeIcon, ReplyIcon, ReportIcon } from "../icon";
import ReportModal from "./ReportModal";

const MAX_DEPTH = 3;
const depthColors = {
    1: '#3b82f6',
    2: '#10b981',
    3: '#f59e0b'
};

const CommentItem = ({ comments, depth, handleReply, handleDelete, setEdit, loginUserInfo, expandReplies, setExpandReplies, inputRef, handleToggleExpand, handleLike, likeId, handleDislike, disLikeId, disLikeCounts, likeCounts ,setOpenReportModal , setSelectedComment}) => {


    return (
        <>
            {comments?.replies?.map((item) => {
                const hasReplies = item?.replies?.length > 0 && item.replies[0]?.isReported?.every((comment) => comment?.whoReported !== loginUserInfo?.id);
                const isExpanded = expandReplies[item?.id];
                return (
                    <div key={item.id}>

                        <div
                            className="replies"
                            style={{
                                marginLeft: `calc(50px + (${Math.min(depth, MAX_DEPTH)} * 50px))`,
                                borderLeft: depth > 0 ? `2px solid ${depthColors[Math.min(depth, MAX_DEPTH)]}` : `2px solid ${depthColors[1]}`
                            }}
                        >
                            <div className="reply-item">

                                <div className="comment-avatar reply-avatar">
                                    {item?.author?.username?.charAt(0)?.toUpperCase()}
                                </div>

                                <div className="comment-body">

                                    <div className="comment-user">
                                        {item?.author?.username}
                                    </div>

                                    <div className="comment-text">
                                        {item?.content}
                                    </div>

                                    <div className="comment-action-container">
                                        <div style={{ cursor: "pointer" }}>
                                            <span onClick={() => handleLike(item?.id)} style={{ color: likeId.includes(item?.id) ? 'red' : 'black', fontSize: '15px' }}><LikeIcon width={15} height={15} style={{ color: likeId.includes(item?.id) ? 'red' : 'black' }} />{Math.max(likeCounts[item?.id] || 0, 0)}</span>
                                            {/*  item?.like === true*/}
                                        </div>
                                        <div style={{ cursor: "pointer" }}>
                                            <span onClick={() => handleDislike(item?.id)} style={{ color: disLikeId.includes(item?.id) ? 'red' : 'black', fontSize: '15px' }}><DislikeIcon width={15} height={15} style={{ color: disLikeId.includes(item?.id) ? 'red' : 'black' }} />{Math.max(disLikeCounts[item?.id] || 0 , 0)}</span>
                                            {/*  item?.dislike === true*/}
                                        </div>
                                        <div className="comment-actions">
                                            <button
                                                onClick={() => {
                                                    handleReply(item);
                                                    inputRef.current?.focus();
                                                }}
                                            >
                                                <ReplyIcon />
                                                Reply
                                            </button>
                                        </div>

                                        {item?.author?.user_id === loginUserInfo?.id && (
                                            <>
                                                <div className="comment-actions">
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                comments.id,
                                                                item.id
                                                            )
                                                        }
                                                    >
                                                        <DeleteIcon />
                                                        Delete
                                                    </button>
                                                </div>

                                                {!hasReplies && (
                                                    <div className="comment-actions">
                                                        <button
                                                            onClick={() => {
                                                                setEdit(item);
                                                                inputRef.current?.focus();
                                                            }}
                                                        >
                                                            <EditIcon />
                                                            Edit
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {item?.author?.user_id !== loginUserInfo?.id &&
                                            <div className="comment-actions">
                                                <button onClick={() => {setOpenReportModal(true); setSelectedComment(item)}}><ReportIcon width={15} height={15} />Report</button>
                                            </div>
                                        }

                                    </div>

                                </div>
                            </div>

                            {hasReplies && (
                                <div className="view-replies-container">
                                    <span
                                        className="view-replies"
                                        onClick={() => handleToggleExpand(item)}
                                    >
                                        {isExpanded ? <ExpandLess /> : <ExpandMore />}

                                        {isExpanded ? "Hide replies" : "View replies"}
                                    </span>
                                </div>
                            )}

                        </div>

                        {hasReplies && isExpanded && (
                            <CommentItem
                                comments={item}
                                depth={depth + 1}
                                handleReply={handleReply}
                                handleDelete={handleDelete}
                                setEdit={setEdit}
                                loginUserInfo={loginUserInfo}
                                expandReplies={expandReplies}
                                setExpandReplies={setExpandReplies}
                                inputRef={inputRef}
                                handleToggleExpand={handleToggleExpand}
                                handleLike={handleLike}
                                likeId={likeId}
                                handleDislike={handleDislike}
                                disLikeId={disLikeId}
                                disLikeCounts={disLikeCounts}
                                likeCounts={likeCounts}
                                setOpenReportModal={setOpenReportModal}
                                setSelectedComment={setSelectedComment}
                            />
                        )}

                    </div>
                );
            })}
        </>
    );
};

export default function CommentsModal({ isOpen, onClose, candidate }) {
    const dispatch = useDispatch();

    const [comment, setComment] = useState("");
    const [reply, setReply] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [edit, setEdit] = useState('');
    const [expandReplies, setExpandReplies] = useState({});
    const [openReportModal , setOpenReportModal] = useState(false)
    const [selectedComment , setSelectedComment] = useState({});

    const inputRef = useRef(null);

    const { loginUserInfo } = useSelector(state => state.auth);
    const { commentList} = useSelector(state => state.comment);

    const filterComment = Array.isArray(commentList) ? commentList.filter((comment) => comment?.candidate_id === candidate?.id) : [];

    const filterReportedComments = (comments) => {
        return comments.filter(comment => {
            return !comment?.isReported?.some(report => report?.whoReported === loginUserInfo?.id)}).map(comment => ({ ...comment, replies: filterReportedComments(comment?.replies || [])}));
    };

    const visibleComments = useMemo(() => {
        return filterReportedComments(filterComment);
    }, [filterComment, loginUserInfo?.id]);


    // const visibleComments = useMemo(() => {
    //     return filterComment.filter(comment => {
    //         const isReportedByMe = comment?.isReported?.some(
    //             report => report?.whoReported === loginUserInfo?.id
    //         );

    //         return !isReportedByMe;
    //     });
    // }, [commentList, candidate?.id, loginUserInfo?.id]);

    const like = filterComment?.flatMap((comment) => comment?.likeId)?.map((commentArray) => commentArray?.commentId || 0);

    const likeCounts = like.reduce((acc, id) => { acc[id] = (acc[id] || 0) + 1;
        return acc;
    }, {});

    const disLike = filterComment?.flatMap((comment) => comment?.disLikeId)?.map((commentArray) => commentArray?.commentId || 0)

    const disLikeCounts = disLike.reduce((acc, id) => { acc[id] = (acc[id] || 0) + 1;
        return acc;
    }, {});

    const loginUserLike = filterComment.flatMap((comment) => comment?.likeId?.filter((like) => like?.whoLike === loginUserInfo?.id) || []);
    const likeId = loginUserLike?.map((like) => like?.commentId)

    const loginUserDislike = filterComment.flatMap((comment) => comment?.disLikeId?.filter((like) => like?.whoDislike === loginUserInfo?.id) || []);
    const disLikeId = loginUserDislike?.map((dislike) => dislike?.commentId);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        inputRef.current?.focus();
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen])

    const collapseChildren = (replies, updatedState) => {
        replies?.forEach((reply) => {
            updatedState[reply.id] = false;
            if (reply?.replies?.length > 0) {
                collapseChildren(reply.replies, updatedState);
            }
        });
    };

    const handleToggleExpand = (comment) => {
        setExpandReplies((prev) => {
            const isCurrentlyExpanded = prev[comment.id];
            const updatedState = { ...prev, [comment.id]: !isCurrentlyExpanded };

            if (isCurrentlyExpanded) {
                collapseChildren(comment.replies, updatedState);
            }

            return updatedState;
        });
    };


    // const addReplyCounts = (comments) => {
    //     if (!comments || !Array.isArray(comments)) return [];

    //     return comments.map(comment => {
    //         const updatedReplies = comment.replies && comment.replies.length > 0
    //             ? addReplyCounts(comment.replies)
    //             : [];
    //         const totalComment = comment.replies.length + updatedReplies.reduce((total, reply) => {
    //             return total + 1 + (reply.replyCount || 0);
    //         }, 0);

    //         const replyCount = updatedReplies.reduce((total, reply) => {
    //             return total + 1 + (reply.replyCount || 0);
    //         }, 0);

    //         return {
    //             ...comment,
    //             replies: updatedReplies,
    //             replyCount: replyCount,
    //             totalComment: totalComment
    //         };
    //     });
    // };
    // const processedComments = addReplyCounts(filterComment);

    const handleSend = (e) => {
        e.preventDefault();

        if (!comment.trim()) return;

        const commentData = {
            id: commentList.length ? commentList[commentList.length - 1].id + 1 : 1,
            content: comment.trim(),
            author: {
                user_id: loginUserInfo.id,
                username: loginUserInfo.firstName
            },
            candidate_id: candidate?.id,
            createdAt: new Date().toISOString(),
            replies: [],
            isReported : [],
            likeId: [],
            disLikeId: [],
            // like : false,
            // dislike : false ,
        };
        dispatch(reqToAddComment(commentData));
        setComment("");
    };

    const handleReply = (comments) => {
        setReplyingTo(comments);
        setReply("");
    };

    const handleSendReply = (e) => {
        e.preventDefault();

        if (!reply.trim() || !replyingTo) return;
        const replyData = {
            commentId: replyingTo.id,
            reply: {
                id: Date.now(),
                parent_id: replyingTo.id,
                content: reply.trim(),
                author: {
                    user_id: loginUserInfo.id,
                    username: loginUserInfo.firstName
                },
                replies: [],
                isReported : [],
                // like : false,
                // dislike : false, 
                createdAt: new Date().toISOString()
            }
        };
        dispatch(reqToReplyToComment(replyData));
        setReply("");
        setReplyingTo(null);
        setExpandReplies(prev => ({ ...prev, [replyingTo.id]: true }));
    };

    const handleDelete = (commentId, replyId) => {
        dispatch(reqToDeleteComment({ commentId, replyId }));
    }

    const handleEdit = (e) => {
        e.preventDefault();
        dispatch(reqToUpdateComment({
            commentId: edit?.parent_id || edit?.id,
            content: edit?.content,
            replyId: edit?.parent_id ? edit?.id : null
        }))
        setEdit('');
    }

    const handleLike = (commentId) => {
        dispatch(reqToAddLike({ commentId: commentId, whoLike: loginUserInfo?.id }));
    }

    const handleDislike = (commentId) => {
        dispatch(reqToAddDislike({ commentId: commentId, whoDislike: loginUserInfo?.id }))
    }

    return (
        <div className="Modal">
            <div className="modal-overlay">
                <div className="modal-content comment-modal">
                    <div className="modal-header">
                        <h3> Comments
                            {/* <span className="comment-count">
                                {filterComment?.length || 0}
                            </span> */}
                        </h3>

                        <button
                            className="close-btn"
                            onClick={onClose}
                        >
                            ×
                        </button>
                    </div>
                    <div className="comment-list">
                        {visibleComments?.length > 0 ? (
                            visibleComments.map((comments) => (
                                <div
                                    className="comment-item-container"
                                    key={comments.id}
                                >
                                    <div className="comment-item">
                                        <div className="comment-avatar">
                                            {comments?.author?.username?.charAt(0)?.toUpperCase()}
                                        </div>

                                        <div className="comment-body">
                                            <div className="comment-user">
                                                {comments?.author?.username}
                                            </div>
                                            <div className="comment-text">
                                                {comments?.content}
                                            </div>
                                            <div className="comment-action-container">
                                                <div style={{ cursor: "pointer" }}>
                                                    <span onClick={() => handleLike(comments?.id)} style={{ color: likeId.includes(comments?.id) ? 'red' : 'black', fontSize: '15px' }}><LikeIcon width={15} height={15} style={{ color: likeId.includes(comments?.id) ? 'red' : 'black' }} />{Math.max(likeCounts[comments?.id] || 0, 0)}</span>
                                                    {/* comments?.like === true */}
                                                </div>
                                                <div style={{ cursor: "pointer" }}>
                                                    <span onClick={() => handleDislike(comments?.id)} style={{ color: disLikeId.includes(comments?.id) ? 'red' : 'black', fontSize: '15px' }}><DislikeIcon width={15} height={15} style={{ color: disLikeId.includes(comments?.id) ? 'red' : 'black' }} />{Math.max(disLikeCounts[comments?.id] || 0 , 0)}</span>
                                                    {/* comments?.dislike === true */}
                                                </div>
                                                <div className="comment-actions">
                                                    <button onClick={() => { handleReply(comments); inputRef.current?.focus(); }}>
                                                        <ReplyIcon />
                                                        Reply
                                                    </button>
                                                </div>
                                                {comments?.author?.user_id === loginUserInfo?.id && (
                                                    <>
                                                        <div className="comment-actions">
                                                            <button onClick={() => handleDelete(comments.id)}>
                                                                <DeleteIcon />
                                                                Delete
                                                            </button>
                                                        </div>
                                                        {comments?.replies?.length === 0 && (
                                                            <div className="comment-actions">
                                                                <button onClick={() => { setEdit(comments); inputRef.current?.focus(); }}>
                                                                    <EditIcon />
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                {comments?.author?.user_id !== loginUserInfo?.id &&
                                                    <div className="comment-actions">
                                                        <button onClick={() =>{ setOpenReportModal(true); setSelectedComment(comments)}}><ReportIcon width={15} height={15} />Report</button>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    {comments?.replies?.length > 0 && comments?.replies?.length > 0 && comments.replies[0]?.isReported?.every((comment) => comment?.whoReported !== loginUserInfo?.id) &&
                                        <div className="view-replies-container">
                                            <span
                                                className="view-replies"
                                                onClick={() => handleToggleExpand(comments)}
                                            >
                                                {expandReplies[comments?.id] ? <ExpandLess /> : <ExpandMore />}
                                                {expandReplies[comments?.id] ? 'Hide replies' : 'View replies'}
                                            </span>
                                        </div>
                                    }

                                    {/* {comments.replies[0]?.isReported?.every((comment) => comment?.whoReported !== loginUserInfo?.id) &&
                                        <span>Some comments may be hidden</span>
                                    } */}

                                    {expandReplies[comments?.id] && comments?.replies?.length > 0 && (
                                        <CommentItem
                                            comments={comments}
                                            depth={0}
                                            handleReply={handleReply}
                                            handleDelete={handleDelete}
                                            setEdit={setEdit}
                                            loginUserInfo={loginUserInfo}
                                            setExpandReplies={setExpandReplies}
                                            expandReplies={expandReplies}
                                            inputRef={inputRef}
                                            handleToggleExpand={handleToggleExpand}
                                            handleLike={handleLike}
                                            likeId={likeId}
                                            handleDislike={handleDislike}
                                            disLikeId={disLikeId}
                                            disLikeCounts={disLikeCounts}
                                            likeCounts={likeCounts}
                                            setOpenReportModal={setOpenReportModal}
                                            setSelectedComment={setSelectedComment}
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="no-comment">
                                <h4>No comments yet</h4>
                                <p>Be the first one to comment on this candidate.</p>
                                {/* <p>If a comment count is displayed, some comments may be hidden because they were reported or removed.</p> */}
                            </div>
                        )}
                    </div>

                    {replyingTo && (
                        <div className="reply-preview">
                            <div>Replying to {" "} <strong> {replyingTo?.author?.username} </strong></div>
                            <button onClick={() => setReplyingTo(null)}> × </button>
                        </div>

                    )}

                    <div className="comment-footer">
                        <form onSubmit={replyingTo ? handleSendReply : (edit ? handleEdit : handleSend)}>
                            <textarea
                                ref={inputRef}
                                value={replyingTo ? reply : (edit ? edit?.content : comment)}
                                onChange={(e) => {

                                    if (replyingTo) {
                                        setReply(e.target.value);
                                    } else if (edit) {
                                        setEdit({ ...edit, content: e.target.value });
                                    } else {
                                        setComment(e.target.value);
                                    }

                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        replyingTo ? handleSendReply(e) : (edit ? handleEdit(e) : handleSend(e));
                                    }
                                }}
                                placeholder={replyingTo ? `Reply to ${replyingTo?.author?.username}...` : "Write a comment..."}
                                rows={2}
                                required
                                autoFocus
                            />
                            <button type="submit" className="send-comment-btn">
                                {replyingTo ? "Reply" : "Send"}
                            </button>
                        </form>

                    </div>

                </div>

            </div>
            {openReportModal &&
                <ReportModal
                    onClose={() => setOpenReportModal(false)}
                    Comment={selectedComment}
                />
            }

        </div>
    );
}