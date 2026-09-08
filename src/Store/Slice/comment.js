import { createSlice } from "@reduxjs/toolkit";

const getLocalData = (key, defaultValue) => {
    const data = localStorage.getItem(key);
    try {
        return data ? JSON.parse(data) : defaultValue;
    } catch {
        return defaultValue;
    }
};

const initialState = {
    commentList: getLocalData('comment') || [],
};

const addReplyNested = ({ comments, commentId, reply }) => {

    const queue = [...comments];

    while (queue.length > 0) {
        const currentComment = queue.shift();

        if (currentComment.id === commentId) {
            if (!currentComment.replies) {
                currentComment.replies = [];
            }
            currentComment.replies.push(reply);
            break;
        }

        if (currentComment.replies && currentComment.replies.length > 0) {
            queue.push(...currentComment.replies);
        }
    }

    return comments;

    // return comments.map((comment) => {
    //     if (comment.id === commentId) {
    //         return {
    //             ...comment,
    //             replies: [...(comment.replies || []), reply],
    //         };
    //     }

    //     if (comment.replies && comment.replies.length > 0) {
    //         return {
    //             ...comment,
    //             replies: addReplyNested({
    //                 comments: comment.replies,
    //                 commentId,
    //                 reply
    //             }),
    //         };
    //     }

    //     return comment;
    // });
};

const deleteReplyNested = ({ comments, commentId, replyId }) => {
    const queue = [...comments];

    while (queue.length > 0) {
        const currentComment = queue.shift();

        if (currentComment.id === commentId) {
            if (!currentComment.replies) {
                currentComment.replies = [];
            }
            currentComment.replies = currentComment.replies.filter(reply => reply.id !== replyId);
            break;
        }

        if (currentComment.replies && currentComment.replies.length > 0) {
            queue.push(...currentComment.replies);
        }
    }

    return comments;
    // return comments.map((comment) => {
    //     if (comment.id === commentId) {
    //         return {
    //             ...comment,
    //             replies: comment.replies.filter((reply) => reply.id !== replyId),
    //         };
    //     }

    //     if (comment.replies && comment.replies.length > 0) {
    //         return {
    //             ...comment,
    //             replies: deleteReplyNested({
    //                 comments: comment.replies,
    //                 commentId,
    //                 replyId
    //             }),
    //         };
    //     }

    //     return comment;
    // });
};

const updateReplyNested = ({ comments, commentId, replyId, content }) => {
    const queue = [...comments];

    while (queue.length > 0) {
        const currentComment = queue.shift();

        if (currentComment.id === commentId) {
            if (!currentComment.replies) {
                currentComment.replies = [];
            }
            currentComment.replies = currentComment.replies.map((reply) => reply.id === replyId ? { ...reply, content, isEdited: true } : reply);
            break;
        }

        if (currentComment.replies && currentComment.replies.length > 0) {
            queue.push(...currentComment.replies);
        }
    }

    return comments;
    // return comments.map((comment) => {
    //     if (comment.id === commentId) {
    //         return {
    //             ...comment,
    //             replies: comment.replies.map((reply) => reply.id === replyId ? { ...reply, content, isEdited: true } : reply),
    //         };
    //     }

    //     if (comment.replies && comment.replies.length > 0) {
    //         return {
    //             ...comment,
    //             replies: updateReplyNested({
    //                 comments: comment.replies,
    //                 commentId,
    //                 replyId,
    //                 content
    //             }),
    //         };
    //     }

    //     return comment;
    // });
};


const addLikeNested = ({ comment, commentId }) => {
    const queue = [...comment];
    // console.log(JSON.parse(JSON.stringify(queue)))
    while (queue.length > 0) {
        const currentComment = queue.shift();

        if (currentComment.id === commentId) {
            if (!currentComment.replies) {
                currentComment.replies = [];
            }

            if (currentComment.like === true) {
                currentComment.like = false;
            } else {
                currentComment.like = true;
            }

            if (currentComment.dislike === true) {
                currentComment.dislike = false
            }
            break;
        }

        if (currentComment.replies && currentComment.replies.length > 0) {
            queue.push(...currentComment.replies);
        }
    }

    return comment;
    // if (!Array.isArray(comment)) return [];
    // return comment.map((comment) => {
    //     if (comment.id === commentId) {
    //         return {
    //             ...comment,
    //             like: true
    //         }
    //     }

    //     if (Array.isArray(comment.replies) && comment.replies.length > 0) {
    //         return {
    //             ...comment,
    //             replies: addLikeNested({
    //                 comment: comment.replies,
    //                 commentId,
    //             }),
    //         };
    //     }
    //     return comment
    // })
}

const addDislikeNested = ({ comment, commentId }) => {
    const queue = [...comment];

    while (queue.length > 0) {
        const currentComment = queue.shift();

        if (currentComment.id === commentId) {
            if (!currentComment.replies) {
                currentComment.replies = [];
            }

            if (currentComment.dislike === true) {
                currentComment.dislike = false
            } else {
                currentComment.dislike = true;
            }

            if (currentComment.like === true) {
                currentComment.like = false
            }
            break;
        }

        if (currentComment.replies && currentComment.replies.length > 0) {
            queue.push(...currentComment.replies);
        }
    }

    return comment;
    // if (!Array.isArray(comment)) return [];
    // return comment.map((comment) => {
    //     if (comment.id === commentId) {
    //         return {
    //             ...comment,
    //             dislike: true
    //         }
    //     }

    //     if (Array.isArray(comment.replies) && comment.replies.length > 0) {
    //         return {
    //             ...comment,
    //             replies: addLikeNested({
    //                 comment: comment.replies,
    //                 commentId,
    //             }),
    //         };
    //     }
    //     return comment
    // })
}


// const addLikeNested = (comments, commentId) => {
//     if (!Array.isArray(comments)) return null;

//     const hasReplies = (replies, id) => {
//         if (!Array.isArray(replies)) return false;
//         return replies.some(reply => reply?.id === id || hasReplies(reply?.replies, id));
//     };

//     for (const comment of comments) {
//         if (comment?.id === commentId || hasReplies(comment?.replies, commentId)) {
//             return comment.id;
//         }
//     }

//     return null;
// };

const nestedReplies = (comments, commentId) => {
    if (!Array.isArray(comments)) return null;

    const queue = comments.map(comment => ({ comment: comment, rootId: comment.id }));

    while (queue.length > 0) {
        // console.log(JSON.parse(JSON.stringify(queue)))
        const current = queue.shift();
        // console.log(JSON.parse(JSON.stringify(current)));
        if (!current || !current.comment) continue;

        const { comment, rootId } = current;

        if (comment.id === commentId) {
            return rootId;
        }

        if (Array.isArray(comment.replies)) {
            const replies = comment.replies.map(reply => ({ comment: reply, rootId: rootId }));
            queue.push(...replies);
        }
    }

    return null;
};

const ReportComment = ({ comments, commentId, whoReported }) => {
    const queue = [...(comments || [])];

    while (queue.length > 0) {
        const currentComment = queue.shift();
        console.log(JSON.parse(JSON.stringify(currentComment)) , 'currentComment')

        if (currentComment.id === commentId) {
            const data = {whoReported: whoReported}
            currentComment.isReported = [...currentComment.isReported , data];

            break;
        }

        if (currentComment.replies?.length > 0) {
            queue.push(...currentComment.replies);
        }
    }

    return comments;
};

const commentSlice = createSlice({
    name: 'comment',
    initialState,
    reducers: {
        reqToAddComment: (state, action) => {
            const currentComments = Array.isArray(state.commentList) ? state.commentList : [];
            state.commentList = [...currentComments, action.payload];
            localStorage.setItem('comment', JSON.stringify(state.commentList));
        },
        reqToDeleteComment: (state, action) => {
            const { commentId, replyId } = action.payload;
            if (replyId) {
                state.commentList = deleteReplyNested({ comments: state.commentList, commentId, replyId });
            } else {
                state.commentList = state.commentList.filter((comment) => comment.id !== commentId);
            }
            localStorage.setItem('comment', JSON.stringify(state.commentList));
        },
        reqToUpdateComment: (state, action) => {
            const { commentId, replyId, content } = action.payload;
            if (replyId) {
                state.commentList = updateReplyNested({ comments: state.commentList, commentId, replyId, content });
            } else {
                state.commentList = state.commentList.map((comment) => comment.id === commentId ? { ...comment, content, isEdited: true } : comment);
            }
            localStorage.setItem('comment', JSON.stringify(state.commentList));
        },
        reqToReplyToComment: (state, action) => {
            const { commentId, reply } = action.payload;

            state.commentList = addReplyNested({ comments: state.commentList, commentId, reply });


            localStorage.setItem("comment", JSON.stringify(state.commentList));
        },
        reqToAddLike: (state, action) => {
            const { commentId , whoLike } = action.payload;
            // state.commentList = addLikeNested({ comment: state.commentList, commentId: commentId })
            // console.log(JSON.parse(JSON.stringify(state.commentList)))

            const exist = nestedReplies(state.commentList, commentId)

            state.commentList = state.commentList.map((comment) => {
                if (comment?.id !== exist) {
                    return comment;
                }

                const like = {commentId : commentId ,  whoLike : whoLike}

                const currentLikes = comment?.likeId || [];
                const currentDislikes = comment?.disLikeId || [];
                const hasLiked = currentLikes.some((comment) => comment.commentId === commentId && comment?.whoLike === whoLike);
                const hasDisliked = currentDislikes.some((comment) => comment.commentId === commentId && comment?.whoDislike === whoLike);

                return {
                    ...comment,
                    likeId: hasLiked ? currentLikes.filter((like) => like?.commentId !== commentId || like?.whoLike !== whoLike) : [...currentLikes, like],
                    disLikeId: hasDisliked ? currentDislikes.filter((dislike) => dislike?.commentId !== commentId || dislike?.whoDislike !== whoLike) : currentDislikes,
                };

            })

            localStorage.setItem("comment", JSON.stringify(state.commentList));
        },
        reqToAddDislike: (state, action) => {
            const { commentId , whoDislike} = action.payload;

            // state.commentList = addDislikeNested({ comment: state.commentList, commentId: commentId })
            // console.log(JSON.parse(JSON.stringify(state.commentList)))

            const exist = nestedReplies(state.commentList, commentId)

            state.commentList = state.commentList.map((comment) => {
                if (comment?.id !== exist) {
                    return comment;
                }

                const dislike = {commentId : commentId ,  whoDislike : whoDislike}

                const currentLikes = comment?.likeId || [];
                const currentDislikes = comment?.disLikeId || [];
                const hasLiked = currentLikes.some((comment) => comment.commentId === commentId && comment?.whoLike === whoDislike);
                const hasDisliked = currentDislikes.some((comment) => comment.commentId === commentId && comment?.whoDislike === whoDislike);

                return {
                    ...comment,
                    likeId: hasLiked ? currentLikes.filter((like) => like?.commentId !== commentId || like?.whoLike !== whoDislike) : currentLikes,
                    disLikeId: hasDisliked ? currentDislikes.filter((dislike) => dislike?.commentId !== commentId || dislike?.whoDislike !== whoDislike) : [...currentDislikes, dislike],
                };
            });

            localStorage.setItem("comment", JSON.stringify(state.commentList));
        },
        reqToReportComment: (state, action) => {
            const { reportedCommentId, whoReported } = action.payload;
            state.commentList = ReportComment({comments : state.commentList , commentId : reportedCommentId , whoReported : whoReported});
            localStorage.setItem("comment", JSON.stringify(state.commentList));
        }
    }
});

export default commentSlice.reducer;
export const { reqToAddComment, reqToDeleteComment, reqToUpdateComment, reqToReplyToComment, reqToAddLike, reqToAddDislike , reqToReportComment} = commentSlice.actions;