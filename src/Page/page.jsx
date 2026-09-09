import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import './page.css'
import { useDispatch, useSelector } from 'react-redux';
import { reqToDeleteCandidate, reqToLogoutUserDetail, reqToUpdateDefaultData, reqToUpdateUserData } from '../Store/Slice/auth';
import { useNavigate } from 'react-router-dom';
import { CommentsIcon, DislikeIcon, LikeIcon, PinIcon } from '../Component/icon';
import { upsertUserIntoStorage } from '../Component/CommonFunction';
import AddCandidateModal from '../Component/Modal/AddCandidate';
import ShowReportedUserModal from '../Component/Modal/ShowReportedUser';
import CommentsModal from '../Component/Modal/CommentModal';
import { toast } from 'react-toastify';


// const CandidatesDetail = [
//     { id: 1, candidates: 'John', party: 'Party A', votes: 0, like: 0, dislike: 0 },
//     { id: 2, candidates: 'Alice', party: 'Party B', votes: 0, like: 0, dislike: 0 },
//     { id: 3, candidates: 'Bob', party: 'Party C', votes: 0, like: 0, dislike: 0 },
//     { id: 4, candidates: 'Rob', party: 'Party B', votes: 0, like: 0, dislike: 0 },
//     { id: 5, candidates: 'Jerry', party: 'Party A', votes: 0, like: 0, dislike: 0 },
// ]

const initialUndicidedVoted = 0;

export default function Page() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { userDetail, loginUserInfo, userData, defaultData, report } = useSelector(state => state.auth);
    const { commentList } = useSelector(state => state.comment);

    const userId = loginUserInfo?.id;
    const loginUserData = useMemo(() => userData?.find((user) => user?.id === userId), [userData, userId]);

    const InitialData = Array.isArray(defaultData?.candidates) && defaultData.candidates.length > 0 ? defaultData.candidates : [];
    const InitialUndicidedVote = defaultData?.undecidedVote ?? loginUserData?.undecidedVote ?? initialUndicidedVoted;
    const InitialUserVotes = loginUserData?.votedCandidateId ? loginUserData?.votedCandidateId : loginUserData?.votedCandidateId ?? null;
    const InitialLike = loginUserData?.likeId ?? null;
    const InitialDisLike = loginUserData?.dislikeId ?? null;

    const [candidates, setCandidates] = useState(InitialData);
    const [undecidedVote, setUndecidedVote] = useState(InitialUndicidedVote);
    const [votedCandidateId, setVotedCandidateId] = useState(InitialUserVotes);
    const [likeId, setLikeId] = useState(InitialLike);
    const [disLikeId, setDislikeId] = useState(InitialDisLike);

    const [pinCandidate, setPinCandidate] = useState(() => {
        const pinnedList = JSON.parse(localStorage.getItem('PinnedCandidate')) || [];

        return pinnedList.filter(user => user?.whoPinned === loginUserInfo?.id).map(user => user.pinnedCandidateId);
    });

    const [pinUser, setPinUser] = useState(() => {
        const pinnedList = JSON.parse(localStorage.getItem('PinnedUser')) || [];

        return pinnedList.filter(user => user?.whoPinned === loginUserInfo?.id).map(user => user.pinnedUserId);
    });

    const [userList, setUsersList] = useState([]);

    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [showTopTwo, setShowTopTwo] = useState(false);
    const [sortBy, setSortBy] = useState('high-low');
    const [reportedCandidateId, setReportedCandidateId] = useState(null);
    const [searchUser, setSearchUser] = useState('');
    const [reportedUser, setReportedUser] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectCandidate, setSelectCandidate] = useState('');
    const [openReportedUserModal, setOpenReportedUserModal] = useState(false);
    const [openCommentModal, setOpenCommentModal] = useState(false);

    const [reportedUserIds, setReportedUserIds] = useState(() => {
        const reportedList = JSON.parse(localStorage.getItem('reportedUser')) || [];

        return reportedList.filter(user => user?.whoReported === loginUserInfo?.id).map(user => user.reportedUser);
    });

    const [filteredCandidates, setFilteredCandidates] = useState(candidates);

    const totalVotes = useMemo(() => {
        return candidates.reduce((total, candidate) => total + Number(candidate.votes || 0), 0);
    }, [candidates]);

    const totalCandidates = candidates.length;
    const totalUser = userDetail.length;
    const finalResult = Array.isArray(candidates) && candidates.length > 0 ? candidates.reduce((winner, candidate) => (candidate.votes > winner.votes) ? candidate : winner) : [];

    const reportedList = JSON.parse(localStorage.getItem('reportedUser')) || [];
    const RepotedUserId = reportedList.filter(user => user?.whoReported === loginUserInfo?.id).map((user) => user.reportedUser);
    const reportedUsers = useMemo(() => userDetail?.filter((user) => reportedUserIds?.includes(user.id)), [userDetail, reportedUserIds]);

    const addedCandidates = defaultData?.candidates?.length > 0 && defaultData?.candidates.filter((user) => Number(user.whoAdded) === Number(loginUserInfo?.id));

    const ties = useMemo(() => {
        if (!finalResult || totalVotes === 0) return [];
        return candidates.filter((candidate) => candidate.votes === finalResult.votes);
    }, [candidates, finalResult, totalVotes]);

    useEffect(() => {
        if (!userId) return;

        if (defaultData?.candidates?.length === 0) {
            setCandidates([]);
        } else {
            setCandidates(InitialData);
        }
        setUndecidedVote(InitialUndicidedVote);
        setVotedCandidateId(InitialUserVotes);
        setLikeId(InitialLike);
        setDislikeId(InitialDisLike);
    }, [userId, defaultData, userData]);

    const saveUserData = (newCandidates, newUndecided, newUserVotes, undecidedVotesDistributed = false, likeId = null, disLikeId = null, reportedCandidateId = null) => {

        const currentUserDataEntry = {
            id: userId,
            undecidedVotesDistributed: undecidedVotesDistributed,
            votedCandidateId: newUserVotes,
            likeId: likeId,
            dislikeId: disLikeId,
        };

        const updatedAllUsersStorage = upsertUserIntoStorage(currentUserDataEntry, 'userData');

        dispatch(reqToUpdateUserData(updatedAllUsersStorage));

        let updatedReports = [...report];

        if (reportedCandidateId !== null) {
            const newReportItem = { reportedCandidateId: reportedCandidateId, whoReported: userId };
            const alreadyExists = report.some((item) => item.reportedCandidateId === reportedCandidateId && item.whoReported === userId);
            updatedReports = alreadyExists ? report : [...report, newReportItem];
        }
        dispatch(
            reqToUpdateDefaultData({
                candidates: newCandidates,
                undecidedVote: newUndecided,
                report: updatedReports,
            })
        );

    };

    useEffect(() => {
        let result = [...candidates];

        if (filter !== 'All') {
            result = result.filter((candidate) => candidate.party === filter);
        }

        if (search.trim()) {
            const searchValue = search.trim();

            result = result.filter((candidate) =>
                candidate.candidates.includes(searchValue)
            );
        }

        if (showTopTwo) {
            // const med = totalCandidates / 2 ;
            // result = result.sort((a, b) => b.votes - a.votes).slice(Math.ceil(med - 1),  Math.floor(med + 1));
            result = result.sort((a, b) => b.votes - a.votes).slice(0, 2);
            const hasTopTwo = result.some(topCand =>
                filteredCandidates.some(filterCand => filterCand.id === topCand.id)
            );
            if (!hasTopTwo) {
                toast.info('The top two candidates are not on this list.');
                setShowTopTwo(false);
                return;
            }
        }

        switch (sortBy) {
            case 'high-low':
                result.sort((a, b) => b.votes - a.votes);
                break;
            case 'low-high':
                result.sort((a, b) => a.votes - b.votes);
                break;
            case 'name-asc':
                result.sort((a, b) => a.candidates.localeCompare(b.candidates));
                break;
            case 'name-desc':
                result.sort((a, b) => b.candidates.localeCompare(a.candidates));
                break;
            default:
                break;
        }


        if (pinCandidate) {
            result.sort((a, b) => {
                if (pinCandidate.includes(a.id)) return -1;
                if (pinCandidate.includes(b.id)) return 1;
                return 0;
            });
        }

        const reportedCandidateIds = defaultData?.report?.filter((item) => item.whoReported === userId)?.map((item) => item.reportedCandidateId) || [];
        result = result.filter((candidate) => !reportedCandidateIds.includes(candidate.id));

        setFilteredCandidates(result);

    }, [candidates, filter, search, sortBy, showTopTwo, reportedCandidateId, pinCandidate]);

    const handleReport = (candidateId) => {
        setReportedCandidateId(candidateId);
        saveUserData(updateCandidate, undecidedVote, votedCandidateId, loginUserData?.undecidedVotesDistributed, likeId, disLikeId, candidateId)
    };

    const handleSort = (value) => {
        setSortBy(value);
        setShowTopTwo(false);
    };

    const handleSearch = (value) => {
        setSearch(value);
        setShowTopTwo(false);
    };

    const handleFilterParty = (party) => {
        setFilter(party);
        setSearch('');
        setShowTopTwo(false);
    };

    const handleTopTwo = () => {
        const filteredVotes = filteredCandidates.reduce((total, candidate) => total + Number(candidate.votes || 0), 0);

        if (totalVotes === 0 || filteredVotes === 0) {
            toast.error("No votes have been cast yet. Cannot determine top candidates.");
            setShowTopTwo(false);
            return;
        }
        // if (filteredCandidates.length <= 2) {
        //     alert("Not enough candidates to determine top candidates.");
        //     setShowTopTwo(false);
        //     return;
        // }
        if (ties.length > 2) {
            toast.info("It's a tie between the candidates!");
            setShowTopTwo(false);
            return;
        }
        setSortBy('high-low');
        setShowTopTwo(true);
    };

    const handleLike = (candidateId) => {
        if (likeId === candidateId) return;

        const previousLikeId = likeId;
        const previousDislikeId = disLikeId;
        const beforeDistributedVotes = localStorage.getItem('BeforeDistributedVotes');

        if (beforeDistributedVotes) {

            const parsedData = JSON.parse(beforeDistributedVotes);
            const restoredCandidates = parsedData.candidates;

            const updateCandidates = restoredCandidates.map((candidate) => {
                let updatedCandidate = { ...candidate };

                if (candidate.id === loginUserData?.likeId) {
                    updatedCandidate.like = Math.max(0, Number(candidate.like || 0) - 1);
                }

                if (candidate.id === loginUserData?.dislikeId) {
                    updatedCandidate.dislike = Math.max(0, Number(candidate.dislike || 0) - 1);
                }

                if (candidate.id === candidateId) {
                    updatedCandidate.like = Number(candidate.like || 0) + 1;
                }

                return updatedCandidate;
            });

            setCandidates(updateCandidates);
            localStorage.setItem('BeforeDistributedVotes', JSON.stringify({ ...parsedData, candidates: updateCandidates }));
            saveUserData(updateCandidates, undecidedVote, votedCandidateId, loginUserData?.undecidedVotesDistributed, candidateId, null, null);
        }

        const updateCandidates = candidates.map((candidate) => {
            let updatedCandidate = { ...candidate };

            if (candidate.id === previousLikeId) {
                updatedCandidate.like = Math.max(0, Number(candidate.like || 0) - 1);
            }

            if (candidate.id === previousDislikeId) {
                updatedCandidate.dislike = Math.max(0, Number(candidate.dislike || 0) - 1);
            }

            if (candidate.id === candidateId) {
                updatedCandidate.like = Number(candidate.like || 0) + 1;
            }

            return updatedCandidate;
        });

        setCandidates(updateCandidates);

        setLikeId(candidateId);
        setDislikeId(null);

        saveUserData(updateCandidates, undecidedVote, votedCandidateId, loginUserData?.undecidedVotesDistributed, candidateId, null, null);
    };


    const handleDislike = (candidateId) => {
        if (disLikeId === candidateId) return;

        const previousLikeId = likeId;
        const previousDislikeId = disLikeId;
        const beforeDistributedVotes = localStorage.getItem('BeforeDistributedVotes');

        if (beforeDistributedVotes) {

            const parsedData = JSON.parse(beforeDistributedVotes);
            const restoredCandidates = parsedData.candidates;

            const updateCandidates = restoredCandidates.map((candidate) => {
                let updatedCandidate = { ...candidate };

                if (candidate.id === loginUserData.dislikeId) {
                    updatedCandidate.dislike = Math.max(0, Number(candidate.dislike || 0) - 1);
                }

                if (candidate.id === loginUserData.likeId) {
                    updatedCandidate.like = Math.max(0, Number(candidate.like || 0) - 1);
                }

                if (candidate.id === candidateId) {
                    updatedCandidate.dislike = Number(candidate.dislike || 0) + 1;
                }

                return updatedCandidate;
            });

            localStorage.setItem('BeforeDistributedVotes', JSON.stringify({ ...parsedData, candidates: updateCandidates }));
            setCandidates(updateCandidates);
            saveUserData(updateCandidates, undecidedVote, votedCandidateId, loginUserData?.undecidedVotesDistributed, null, candidateId, null);
        }


        const updateCandidates = candidates.map((candidate) => {
            let updatedCandidate = { ...candidate };

            if (candidate.id === previousLikeId) {
                updatedCandidate.like = Math.max(0, Number(candidate.like || 0) - 1);
            }

            if (candidate.id === previousDislikeId) {
                updatedCandidate.dislike = Math.max(0, Number(candidate.dislike || 0) - 1);
            }

            if (candidate.id === candidateId) {
                updatedCandidate.dislike = Number(candidate.dislike || 0) + 1;
            }

            return updatedCandidate;
        });

        setCandidates(updateCandidates);

        setDislikeId(candidateId);
        setLikeId(null);

        saveUserData(updateCandidates, undecidedVote, votedCandidateId, loginUserData?.undecidedVotesDistributed, null, candidateId, null);
    };

    const handleVotes = (candidateId) => {
        if (candidateId === votedCandidateId) {
            return;
        }
        const previousVoteId = votedCandidateId;
        const hasDistributedVotes = localStorage.getItem('BeforeDistributedVotes');
        const voteId = candidateId;

        if (hasDistributedVotes && (loginUserData?.undecidedVotesDistributed === true && loginUserData?.votedCandidateId === 'undecided' || loginUserData?.votedCandidateId !== 'undecided')) {

            const parsedData = JSON.parse(hasDistributedVotes);
            const restoredCandidates = parsedData.candidates;
            const updateCandidates = restoredCandidates.map((candidate) => {
                if (candidate?.id === loginUserData?.votedCandidateId && loginUserData?.undecidedVotesDistributed === false) {
                    return {
                        ...candidate,
                        votes: Math.max(0, candidate.votes - 1)
                    }
                }
                if (candidate?.id === candidateId) {
                    return {
                        ...candidate,
                        votes: candidate.votes + 1
                    }
                }
                return candidate;
            });
            setCandidates(updateCandidates);
            setVotedCandidateId(candidateId);
            localStorage.setItem('BeforeDistributedVotes', JSON.stringify({ ...parsedData, candidates: updateCandidates, undecidedVote: Math.max(0, loginUserData?.undecidedVotesDistributed === true ? parsedData?.undecidedVote - 1 : parsedData?.undecidedVote) }));
            saveUserData(updateCandidates, undecidedVote, candidateId, loginUserData?.undecidedVotesDistributed, likeId, disLikeId, null, loginUserData?.undecidedVotesDistributed);

        }

        const updateCandidates = candidates.map((candidate) => {

            if (candidate.id === previousVoteId) {
                return {
                    ...candidate,
                    votes: Math.max(0, candidate.votes - 1)
                };
            }

            if (candidate.id === candidateId) {
                return {
                    ...candidate,
                    votes: candidate.votes + 1
                };
            }

            return candidate;
        });
        const updatedUndecided = previousVoteId === 'undecided' ? Math.max(0, undecidedVote - 1) : undecidedVote;

        setCandidates(updateCandidates);
        setUndecidedVote(updatedUndecided);
        setVotedCandidateId(candidateId);
        saveUserData(updateCandidates, updatedUndecided, voteId, false, likeId, disLikeId, null);
    };

    const handleUndicidedVoted = () => {

        const beforeDistributedVotes = localStorage.getItem('BeforeDistributedVotes');
        if (beforeDistributedVotes) {
            const parsedData = JSON.parse(beforeDistributedVotes);
            const restoredCandidates = parsedData.candidates;
            const isCurrentUserDistributed = loginUserData?.undecidedVotesDistributed === true;
            const undecidedVotes = Math.max(0, isCurrentUserDistributed ? parsedData.undecidedVote : parsedData.undecidedVote + 1);
            // console.log(loginUserData?.votedCandidateId , isCurrentUserDistributed)
            const updateCandidates = restoredCandidates.map((candidate) => {
                if (!isCurrentUserDistributed && loginUserData?.votedCandidateId !== 'undecided' && candidate.id === loginUserData?.votedCandidateId) {
                    return {
                        ...candidate,
                        undecidedVotesDistributed: false,
                        votes: Math.max(0, candidate.votes - 1)
                    };
                }
                return candidate;
            });
            userDetail.forEach((user) => {
                const userInfo = userData?.find((u) => u?.id === user?.id);
                if (userInfo) {
                    const shouldBeUndecided =
                        userInfo?.undecidedVotesDistributed === true

                    upsertUserIntoStorage({
                        ...userInfo,
                        undecidedVotesDistributed: false,
                        votedCandidateId: shouldBeUndecided ? 'undecided' : userInfo?.votedCandidateId,
                    });
                }
            });
            setCandidates(updateCandidates);
            setUndecidedVote(undecidedVotes);
            setVotedCandidateId('undecided');
            saveUserData(updateCandidates, undecidedVotes, 'undecided', false, likeId, disLikeId, null, false);

            localStorage.removeItem('BeforeDistributedVotes');

            return;
        }

        if (votedCandidateId === 'undecided') return;

        const newUndecided = Math.max(0, undecidedVote + 1);
        const updateCandidates = candidates.map((candidate) => {
            if (candidate.id === votedCandidateId) {
                return {
                    ...candidate,
                    votes: Math.max(0, candidate.votes - 1)
                };
            }
            return candidate;
        });
        setCandidates(updateCandidates);
        setUndecidedVote(newUndecided);
        setVotedCandidateId('undecided');
        saveUserData(updateCandidates, newUndecided, 'undecided', false, likeId, disLikeId);
    }

    const handlePercentage = (vote) => {
        if (totalVotes === 0 || vote === 0) return "0.0";
        return ((vote / totalVotes) * 100).toFixed(1);
    }

    const handleDisributeVoteUndecided = () => {
        if (undecidedVote === 0) {
            toast.error('No undecided votes left!');
            return
        };

        let updateCandidates = [...candidates];


        const allUsers = Array.isArray(userData) ? userData : [];

        const undecidedUsers = userDetail.map(user => {
            const userInfo = allUsers.find(u => Number(u.id) === Number(user.id));
            return { user: user, userInfo: userInfo || null }
        }).filter(({ userInfo }) => userInfo?.votedCandidateId === 'undecided');

        const reportedCandidateIds = defaultData?.report?.filter((item) => item.whoReported === userId)?.map((item) => item.reportedCandidateId) || [];
        const activeCandidates = updateCandidates.filter((candidate) => !reportedCandidateIds.includes(candidate.id));

        if (activeCandidates.length === 0) {
            toast.error('No active candidates available for vote distribution!');
            return;
        }

        switch (sortBy) {
            case 'high-low':
                activeCandidates.sort((a, b) => b.votes - a.votes);
                break;

            case 'low-high':
                activeCandidates.sort((a, b) => a.votes - b.votes);
                break;

            case 'name-asc':
                activeCandidates.sort((a, b) =>
                    a.candidates.localeCompare(b.candidates)
                );
                break;

            case 'name-desc':
                activeCandidates.sort((a, b) =>
                    b.candidates.localeCompare(a.candidates)
                );
                break;

            default:
                break;
        }

        if (pinCandidate) {
            activeCandidates.sort((a, b) => {
                if (pinCandidate.includes(a.id)) return -1;
                if (pinCandidate.includes(b.id)) return 1;
                return 0;
            });
        }

        const RepotedUser = activeCandidates.filter((c) => !RepotedUserId?.includes(Number(c?.whoAdded)))

        if (RepotedUser.length === 0) {
            toast.error('All candidate owners have been reported by you! so cannot distribute votes');
            return;
        }

        loginUserData?.undecidedVotesDistributed !== true && localStorage.setItem('BeforeDistributedVotes', JSON.stringify({ candidates, undecidedVote, votedCandidateId, userId }));

        // const updatedAllUsers = [];
        // for (const user of allUsers) {
        //     const undecidedIndex = undecidedUsers.findIndex(item => Number(item.user.id) === Number(user.id));

        //     if (undecidedIndex === -1) {
        //         updatedAllUsers.push(user);
        //         continue;
        //     }

        //     const candidateIndex = undecidedIndex % activeCandidates.length;
        //     const candidateId = activeCandidates[candidateIndex].id;

        //     updatedAllUsers.push({
        //         ...user,
        //         undecidedVotesDistributed: true,
        //         votedCandidateId: candidateId
        //     });
        // }

        const updatedAllUsers = allUsers.map(user => {
            const undecidedIndex = undecidedUsers.findIndex(item => Number(item.user.id) === Number(user.id));

            if (undecidedIndex === -1) {
                return user;
            }

            const candidateIndex = undecidedIndex % RepotedUser.length;

            const candidateId = RepotedUser[candidateIndex].id;

            return {
                ...user,
                undecidedVotesDistributed: true,
                votedCandidateId: candidateId,
            };
        });

        undecidedUsers.forEach((_, index) => {
            const candidateIndex = index % RepotedUser.length;
            const candidateId = RepotedUser[candidateIndex].id;

            updateCandidates = updateCandidates.map((candidate) => {

                if (candidate.id === candidateId) {
                    return {
                        ...candidate,
                        undecidedVotesDistributed: true,
                        votes: Math.max(0, candidate.votes + 1)
                    };
                }
                return candidate;

            });
        });


        // for (const [index] of undecidedUsers.entries()) {
        //     const candidateIndex = index % activeCandidates.length;
        //     const candidateId = activeCandidates[candidateIndex].id;

        //     const idx = updateCandidates.findIndex(c => c.id === candidateId);
        //     if (idx !== -1) {
        //         updateCandidates[idx] = {
        //             ...updateCandidates[idx],
        //             undecidedVotesDistributed: true,
        //             votes: Math.max(0, updateCandidates[idx].votes + 1),
        //         };
        //     }
        // }

        dispatch(reqToUpdateUserData(updatedAllUsers));
        setCandidates(updateCandidates);
        setUndecidedVote(0);

        const currentUser = updatedAllUsers.find((user) => user.id === userId);
        const currentUserVote = currentUser ? currentUser?.votedCandidateId : votedCandidateId;

        setVotedCandidateId(currentUserVote ?? votedCandidateId);
        saveUserData(updateCandidates, 0, currentUserVote ?? votedCandidateId, votedCandidateId === 'undecided' ? true : false, likeId, disLikeId);

    };

    const handleLogout = () => {
        dispatch(reqToLogoutUserDetail(loginUserInfo?.email));
        navigate('/login');
    }

    const handleReportUser = (userId) => {
        const ReportedUserDetail = { whoReported: loginUserInfo?.id, reportedUser: userId, previousLikeId: loginUserData?.likeId ?? null, previousDislikeId: loginUserData?.dislikeId ?? null };

        const canReportSelf = ReportedUserDetail.whoReported === ReportedUserDetail.reportedUser;

        if (canReportSelf) {
            toast.error("You can't report yourself!");
            return
        }

        let reported = [];
        const reportedUser = localStorage.getItem('reportedUser');
        reported = reportedUser ? JSON.parse(reportedUser) : [];
        setReportedUser(userId);

        const exists = reported.some((r) => r.reportedUser === ReportedUserDetail.reportedUser && r.whoReported === ReportedUserDetail.whoReported);
        if (exists) return;
        reported.push(ReportedUserDetail);
        localStorage.setItem('reportedUser', JSON.stringify(reported));

        const data = defaultData?.candidates?.find((candidate) => candidate.id === votedCandidateId)
        const beforeDistributedVotes = JSON.parse(localStorage.getItem('BeforeDistributedVotes'));
        const userCandidates = defaultData?.candidates?.filter((candidate) => Number(candidate?.whoAdded) === Number(userId));

        if (data?.whoAdded === userId || userCandidates?.length > 0) {

            const hasLikedCandidate = userCandidates.some((candidate) => Number(candidate.id) === Number(loginUserData?.likeId));
            const hasDislikedCandidate = userCandidates.some((candidate) => Number(candidate.id) === Number(loginUserData?.dislikeId));

            const updatecandidate = defaultData?.candidates.map((candidate) => {
                if (candidate.id === votedCandidateId || hasLikedCandidate || hasDislikedCandidate) {
                    if (Number(candidate?.whoAdded) !== Number(userId)) {
                        return candidate;
                    }
                    return {
                        ...candidate,
                        votes: candidate.id === votedCandidateId ? Math.max(0, candidate.votes - 1) : candidate.votes,
                        like: hasLikedCandidate && Number(candidate.id) === Number(loginUserData?.likeId) ? Math.max(0, Number(candidate.like || 0) - 1) : Number(candidate.like || 0),
                        dislike: hasDislikedCandidate && Number(candidate.id) === Number(loginUserData?.dislikeId) ? Math.max(0, Number(candidate.dislike || 0) - 1) : Number(candidate.dislike || 0),

                    };
                }
                return candidate;
            });
            const updatedDefaultData = {
                ...defaultData,
                candidates: updatecandidate,
                undecidedVote: defaultData?.undecidedVote + 1
            }
            setCandidates(updatecandidate);
            setLikeId(hasLikedCandidate ? null : loginUserData?.likeId);
            setDislikeId(hasDislikedCandidate ? null : loginUserData?.dislikeId);
            setUndecidedVote(updatedDefaultData?.undecidedVote);

            const userInfo = userData?.find((u) => u?.id === loginUserInfo?.id);
            if (userInfo) {
                upsertUserIntoStorage({
                    ...userInfo,
                    undecidedVotesDistributed: true,
                    votedCandidateId: 'undecided',
                });
            }

            saveUserData(updatecandidate, updatedDefaultData?.undecidedVote, 'undecided', true, hasLikedCandidate ? null : loginUserData?.likeId, hasDislikedCandidate ? null : loginUserData?.dislikeId, null);

            if (beforeDistributedVotes) {
                const updateBeforeDistributedVotes = beforeDistributedVotes?.candidates.map((candidate) => {
                    if (candidate.id === votedCandidateId || hasLikedCandidate || hasDislikedCandidate) {
                        return {
                            ...candidate,
                            votes: candidate.id === votedCandidateId ? Math.max(0, candidate.votes - 1) : candidate.votes,
                            like: hasLikedCandidate && Number(candidate.id) === Number(loginUserData?.likeId) ? Math.max(0, Number(candidate.like || 0) - 1) : Number(candidate.like || 0),
                            dislike: hasDislikedCandidate && Number(candidate.id) === Number(loginUserData?.dislikeId) ? Math.max(0, Number(candidate.dislike || 0) - 1) : Number(candidate.dislike || 0),
                        };
                    }
                    return candidate;
                });
                const updatedBeforeDistributedData = {
                    ...beforeDistributedVotes,
                    candidates: updateBeforeDistributedVotes,
                    undecidedVote: loginUserData?.undecidedVotesDistributed !== true ? beforeDistributedVotes.undecidedVote + 1 : beforeDistributedVotes.undecidedVote
                }
                localStorage.setItem('BeforeDistributedVotes', JSON.stringify(updatedBeforeDistributedData));
            }
        }

        setReportedUserIds((prev) => [...prev, userId]);

    }

    const updateUserDetail = useCallback(() => {
        const reportedUser = localStorage.getItem('reportedUser');
        if (!reportedUser) {
            return userDetail;
        }

        let reportedList;
        try {
            reportedList = JSON.parse(reportedUser);
            if (!Array.isArray(reportedList) || reportedList.length === 0) {
                return userDetail;
            }
        } catch (e) {
            return userDetail;
        }

        const reportedUsers = reportedList.filter(user => user?.whoReported === userId)
        const reportedUserIds = reportedUsers.map(user => user?.reportedUser);

        if (reportedUserIds.length === 0) return userDetail;

        const result = userDetail.filter(user => !reportedUserIds.includes(user.id));
        return result;
    }, [userDetail, reportedUser]);

    useEffect(() => {
        const filteredUsers = updateUserDetail().filter((user) => {
            const searchValue = searchUser.trim();
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`;
            return fullName.includes(searchValue);
        });

        if (pinUser) {
            filteredUsers.sort((a, b) => {
                const aPinned = pinUser.includes(a.id);
                const bPinned = pinUser.includes(b.id);

                if (aPinned && !bPinned) return -1;
                if (!aPinned && bPinned) return 1;
                return 0;
            });
        }
        setUsersList(filteredUsers);

    }, [searchUser, userDetail, reportedUserIds, pinUser]);

    const handleRemoveCandidate = (userId) => {
        dispatch(reqToDeleteCandidate(userId));
    }

    const handlePinUnpin = (Id, type) => {
        const currentUserId = loginUserInfo?.id;
        if (!currentUserId) return;

        const config = {
            user: {
                storageKey: "PinnedUser",
                idKey: "pinnedUserId",
                setPins: setPinUser,
            }, candidate: {
                storageKey: "PinnedCandidate",
                idKey: "pinnedCandidateId",
                setPins: setPinCandidate,
            },
        };

        const { storageKey, idKey, setPins } = config[type];

        const newPin = { [idKey]: Id, whoPinned: currentUserId };

        const storedPins = localStorage.getItem(storageKey);
        let pinnedList = storedPins ? JSON.parse(storedPins) : [];
        if (!Array.isArray(pinnedList)) pinnedList = [];


        const isAlreadyPinned = pinnedList.some((pin) => pin[idKey] === newPin[idKey] && pin.whoPinned === newPin.whoPinned);

        if (isAlreadyPinned) {
            const updatedList = pinnedList.filter((pin) => !(pin[idKey] === newPin[idKey] && pin.whoPinned === newPin.whoPinned));
            const update = updatedList.filter((pin) => pin.whoPinned === newPin.whoPinned).map((pin) => pin[idKey])
            setPins(update);

            localStorage.setItem(storageKey, JSON.stringify(updatedList));
            return;
        }

        const userPins = pinnedList.filter((pin) => pin.whoPinned === newPin.whoPinned);
        if (userPins.length >= 3) {
            toast.error('Maximum of 3 pins allowed. Please unpin an item before pinning a new one.');
            return;
        }

        pinnedList.push(newPin);
        localStorage.setItem(storageKey, JSON.stringify(pinnedList));
        setPins((prev) => [...prev, Id])

    }

    return (
        <>
            <div className="voting-dashboard">
                <div className="voting-header">
                    <div className="poll-info">
                        <h3 className="poll-title">Election / Poll Analyser</h3>
                        <h4 className="poll-description">
                            Analyser Votes, filter, search, sort and distribute undecided votes.
                        </h4>
                    </div>

                    <div className="user-info">
                        <strong className="user-name">
                            {loginUserInfo?.firstName + " " + loginUserInfo?.lastName}
                        </strong>

                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    </div>
                </div>

                <div className='user-management'>
                    <div className='user-search'>
                        {/* <p>Search User</p> */}
                        <input
                            className='search-input'
                            type="text"
                            placeholder='Search by name...'
                            value={searchUser}
                            onChange={(e) => setSearchUser(e.target.value || '')}
                        />
                    </div>
                    <table>
                        <tbody>
                            <tr>
                                <th>#</th>
                                <th>User</th>
                                <th>status</th>
                                <th>Action</th>
                            </tr>
                            {userList.length > 0 ? userList?.map((user, index) => (
                                <tr key={index}>
                                    <th>{index + 1}</th>
                                    <th>
                                        <div className='user-profile'>
                                            <span className='user-avatar'>{user.firstName?.charAt(0)?.toUpperCase()}</span>
                                            <span >{user.firstName + " " + user.lastName}</span>
                                        </div>
                                    </th>
                                    <th><span className={`status-${user.status}`}>{user.status}</span></th>
                                    <th className='user-actions'>
                                        <span style={{ cursor: 'pointer' }} onClick={() => handlePinUnpin(user.id, 'user')} className='pin-button'><PinIcon color={'black'} fill={(Array.isArray(pinUser) && pinUser.includes(user.id)) ? 'black' : 'none'} /></span>
                                        <button className={`${userId === user.id ? "active-user-button" : "report-button"}`} onClick={() => userId === user.id ? '' : handleReportUser(user.id)} style={{ cursor: userId === user.id ? "default" : "pointer" }}>{userId === user.id ? "Active User" : "Report"}</button>
                                    </th>
                                </tr>
                            )) : <tr><td colSpan='6'>No User</td></tr>}
                        </tbody>
                    </table>

                    <div className='vote-summary'>
                        <div className='summary-card'>
                            <p>Total User</p>
                            <p style={{ fontSize: '20px' }}>{totalUser}</p>
                        </div>
                        <div className='summary-card'>
                            <p>Total Candidates</p>
                            <p style={{ fontSize: '20px' }}>{totalCandidates}</p>
                        </div>
                        <div className='summary-card'>
                            <p>Total Votes</p>
                            <p style={{ fontSize: '20px' }}>{totalVotes}</p>
                        </div>
                        <div className='summary-card'>
                            <p>Undecided Votes</p>
                            <p style={{ fontSize: '20px' }}>{undecidedVote}</p>
                        </div>
                        <div className='summary-card'>
                            <p>Status</p>
                            <p style={{ fontSize: '20px' }}  >{totalVotes === 0 ? 'Not Started' : undecidedVote > 0 ? 'OnGoing' : 'Completed'}</p>
                        </div>
                    </div>

                    <div className='winner-summary-card'>
                        <p>{totalVotes === 0 ? ' Election has not started yet' : ties.length > 1 ? 'Tie' : 'Winner'}  {totalVotes !== 0 && (ties ? [...new Set(ties.map(tie => tie.party))].join(', ') : finalResult.party)} {totalVotes !== 0 && `(${finalResult.votes} Votes)`}</p>
                    </div>
                </div>


                <div className='party-filter'>
                    {defaultData?.candidates?.length > 0 ? (
                        <>
                            <div className="party-tabs" key="all">
                                <input
                                    type="radio"
                                    name="party-tab"
                                    id="party-tab-all"
                                    value="All"
                                    onChange={() => handleFilterParty('All')}
                                    defaultChecked
                                />
                                <label htmlFor="party-tab-all" className="party-tab-button">
                                    All
                                </label>
                                {[...new Set(
                                    defaultData.candidates.map(candidate => candidate.party)
                                )].map((party, index) => (
                                    <div className="party-tabs" key={party}>
                                        <input
                                            type="radio"
                                            name="party-tab"
                                            id={`party-tab${index + 1}`}
                                            value={party}
                                            onChange={(e) => handleFilterParty(e.target.value)}
                                        />
                                        <label htmlFor={`party-tab${index + 1}`} className="party-tab-button">
                                            Party {party}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : <span className="no-party-message">No Party Found</span>
                    }
                </div>

                <div className='candidate-section'>
                    <div className="candidate-toolbar">
                        <div className='candidate-search'>
                            <input className='search-input' type="text" placeholder='Search by name...' value={search} onChange={(e) => { setSearch(e.target.value); handleSearch(e.target.value) }} />
                        </div>
                        <div className='candidate-sort'>
                            <select className='sort-select' value={sortBy} onChange={(e) => handleSort(e.target.value)} >
                                <option value='high-low'>Votes : High to Low</option>
                                <option value='low-high'>Votes : Low to High</option>
                                <option value='name-asc'>Name : A to Z</option>
                                <option value='name-desc'>Name : Z to A</option>
                            </select>
                        </div>
                        <div className='top-candidates-action'>
                            <button className='primary-action-button' onClick={handleTopTwo}>Show Top 2</button>
                        </div>
                    </div>

                    <table className="candidate-table">
                        <thead>
                            <tr className="candidate-table-header">
                                <th className="candidate-index">#</th>
                                <th className="candidate-name-header">Candidate</th>
                                <th className="candidate-party-header">Party</th>
                                <th className="candidate-votes-header">Votes</th>
                                <th className="candidate-percentage-header">Percentage</th>
                                <th className="candidate-action-header">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredCandidates.length > 0 ? (
                                filteredCandidates.map((user, index) => {
                                    const isReported = RepotedUserId?.some(
                                        id => Number(id) === Number(user?.whoAdded)
                                    );

                                    const isOwner = userId === user?.whoAdded;

                                    function countComments(commentList) {
                                        let count = 0;
                                        commentList.forEach(comment => {
                                            count++;
                                            if (comment.replies?.length > 0) {
                                                count += countComments(comment.replies);
                                            }
                                        });
                                        return count;
                                    }

                                    const commentsArray = Array.isArray(commentList) ? commentList : [];

                                    const totalcount = countComments(commentsArray.filter(comment => comment.candidate_id === user.id));

                                    return (
                                        <tr className="candidate-table-row" key={index}>
                                            <td className="candidate-index">
                                                {index + 1}
                                            </td>

                                            <td className="candidate-name">
                                                {user.candidates}
                                            </td>

                                            <td className="candidate-party">
                                                <span className="party-badge">
                                                    {user.party}
                                                </span>
                                            </td>

                                            <td className="candidate-votes">
                                                {user.votes}
                                            </td>

                                            <td className="candidate-percentage">
                                                {handlePercentage(user.votes)}%
                                            </td>

                                            <td className="candidate-actions">

                                                <span className="pin-action" onClick={() => handlePinUnpin(user.id, 'candidate')} >
                                                    <PinIcon
                                                        color="black"
                                                        fill={pinCandidate.includes(user?.id) ? "black" : "none"}
                                                    />
                                                </span>

                                                <span className={`like-action ${isReported ? "action-disabled" : ""}`} onClick={() => !isReported && handleLike(user.id)} style={{color : user.id === likeId ? 'red' : 'inherit'}}>
                                                    <LikeIcon />
                                                    <span>{Number(user.like || 0)}</span>
                                                </span>

                                                <span className={`dislike-action ${isReported ? "action-disabled" : ""}`} onClick={() => !isReported && handleDislike(user.id)} style={{color : user.id === disLikeId ? 'red' : 'inherit'}}>
                                                    <DislikeIcon />
                                                    <span>{Number(user.dislike || 0)}</span>
                                                </span>

                                                <span className={`comment-action ${isReported ? "action-disabled" : ""}`} onClick={() => {
                                                    if (!isReported) {
                                                        setOpenCommentModal(true);
                                                        setSelectCandidate(user);
                                                    }
                                                }}>
                                                    <CommentsIcon />
                                                    <span>{totalcount}</span>
                                                </span>

                                                <button className={`primary-action-button ${isReported ? "action-disabled" : ""}`} disabled={isReported} onClick={() => handleVotes(user.id)}>
                                                    Add Votes
                                                </button>

                                                {!isOwner && (
                                                    <button className={`report-button ${isReported ? "action-disabled" : ""}`} disabled={isReported} onClick={() => handleReport(user.id)}>
                                                        Report
                                                    </button>
                                                )}

                                                {isOwner && (
                                                    <button className="remove-candidate-button" onClick={() => handleRemoveCandidate(user.id)}>
                                                        Remove candidate
                                                    </button>
                                                )}

                                                {isOwner && user?.votes <= 0 && user?.like <= 0 && user?.dislike <= 0 && user?.editCandidate === false && (
                                                    <button className="update-candidate-button" onClick={() => { setOpen(true); setSelectCandidate(user) }}>
                                                        Update candidate
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td className="no-candidates" colSpan="6">
                                        No candidates
                                    </td>
                                </tr>
                            )}

                            {(addedCandidates.length < 3 || addedCandidates === false) && (
                                <tr className="add-candidate-row">
                                    <td colSpan="6">
                                        <button className="add-candidate-button" onClick={() => { setOpen(true); setSelectCandidate("") }}>
                                            Add Candidate
                                        </button>
                                    </td>
                                </tr>
                            )}

                            <tr className="undecided-votes-row">
                                <td colSpan="5">
                                    <span>Undecided Votes</span>
                                </td>

                                <td>
                                    <button
                                        className="undecided-votes-button"
                                        onClick={handleUndicidedVoted}
                                    >
                                        Add Undecided Votes
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className='vote-total-section'>
                    <strong className='vote-total'>Total Votes : {totalVotes}</strong>
                </div>

                <div className='undecided-votes-section'>
                    <div className='summary-card'>
                        <p>Undecided Votes</p>
                        <p>{undecidedVote}</p>
                    </div>
                    <p className='undecided-description'>Distribute Undecided Votes equally (one by one) in round-robin order across all candidates.</p>
                    <button className='primary-action-button' onClick={handleDisributeVoteUndecided}>Distribute Undecided Votes</button>
                </div>

                {reportedUsers.length > 0 && <div className='reported-users-section'>
                    <div className='summary-card'>
                        <p>Reported User</p>
                        <p>{reportedUsers?.length}</p>
                    </div>
                    <button className='primary-action-button' onClick={() => setOpenReportedUserModal(true)}>Show Reported User</button>
                </div>}
            </div>

            {open && <AddCandidateModal
                onClose={() => setOpen(false)}
                candidate={selectCandidate}
            />
            }
            {openReportedUserModal && <ShowReportedUserModal
                onClose={() => setOpenReportedUserModal(false)}
                reportedUser={reportedUsers}
                onUnreport={(userId, previousLikeId, previousDislikeId) => {
                    setReportedUserIds((prev) => prev.filter((id) => id !== userId));
                    if (previousLikeId) {
                        handleLike(previousLikeId);
                    }

                    if (previousDislikeId) {
                        handleDislike(previousDislikeId);
                    }
                }}
            />}
            {openCommentModal && <CommentsModal
                isOpen={openCommentModal}
                onClose={() => setOpenCommentModal(false)}
                candidate={selectCandidate}
            />}
        </>
    )
}
