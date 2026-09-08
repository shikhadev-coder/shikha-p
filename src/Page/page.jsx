import { useCallback, useEffect, useMemo, useState } from 'react';
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
            result = result.sort((a, b) => b.votes - a.votes).slice(0,2);
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

    }, [candidates, filter, search, sortBy, showTopTwo, reportedCandidateId  , pinCandidate]);

    const handleReport = (candidateId) => {
        setReportedCandidateId(candidateId);
        saveUserData(candidates, undecidedVote, votedCandidateId, loginUserData?.undecidedVotesDistributed, likeId, disLikeId, candidateId)
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

        if (hasDistributedVotes && loginUserData?.votedCandidateId === null || loginUserData?.undecidedVotesDistributed === true && loginUserData?.votedCandidateId === 'undecided' || hasDistributedVotes && loginUserData?.votedCandidateId !== 'undecided' ) {

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
            const undecidedVotes = Math.max(0, isCurrentUserDistributed  ? parsedData.undecidedVote : parsedData.undecidedVote + 1);
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

        loginUserData?.undecidedVotesDistributed !== true && localStorage.setItem('BeforeDistributedVotes', JSON.stringify({ candidates , undecidedVote, votedCandidateId, userId }));

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
                votedCandidateId: candidateId , 
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
        const ReportedUserDetail = { whoReported: loginUserInfo?.id, reportedUser: userId };

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

        if (data?.whoAdded === userId) {
            const updatecandidate = defaultData?.candidates.map((candidate) => {
                if (candidate.id === votedCandidateId) {
                    return {
                        ...candidate,
                        votes: candidate.votes - 1
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
            setUndecidedVote(updatedDefaultData?.undecidedVote);

            const userInfo = userData?.find((u) => u?.id === loginUserInfo?.id);
            if (userInfo) {
                upsertUserIntoStorage({
                    ...userInfo,
                    undecidedVotesDistributed: true,
                    votedCandidateId: 'undecided',
                });
            }

            saveUserData(updatecandidate, updatedDefaultData?.undecidedVote, 'undecided', true , likeId, disLikeId, null);

            if (beforeDistributedVotes) {
                const updateBeforeDistributedVotes = beforeDistributedVotes?.candidates.map((candidate) => {
                    if (candidate.id === votedCandidateId) {
                        return {
                            ...candidate,
                            votes: Math.max(0, candidate.votes - 1)
                        };
                    }
                    return candidate;
                });
                const updatedBeforeDistributedData = {
                    ...beforeDistributedVotes,
                    candidates: updateBeforeDistributedVotes,
                    undecidedVote : loginUserData?.undecidedVotesDistributed !== true ? beforeDistributedVotes.undecidedVote + 1 : beforeDistributedVotes.undecidedVote
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

        const config = { user: {
            storageKey: "PinnedUser", 
            idKey: "pinnedUserId", 
            setPins: setPinUser, 
        }, candidate: { 
            storageKey: "PinnedCandidate", 
            idKey: "pinnedCandidateId", 
            setPins: setPinCandidate, 
        }, };

        const { storageKey, idKey, setPins } = config[type];

        const newPin = { [idKey]: Id, whoPinned: currentUserId };

        const storedPins = localStorage.getItem(storageKey);
        let pinnedList = storedPins ? JSON.parse(storedPins) : [];
        if (!Array.isArray(pinnedList)) pinnedList = [];


        const isAlreadyPinned = pinnedList.some((pin) => pin[idKey] === newPin[idKey] && pin.whoPinned === newPin.whoPinned);

        if (isAlreadyPinned) {
            const updatedList = pinnedList.filter((pin) => !(pin[idKey] === newPin[idKey] && pin.whoPinned === newPin.whoPinned));
            const update = updatedList.filter((pin) => pin.whoPinned === newPin.whoPinned).map((pin) => pin[idKey] )
            setPins(update) ;

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
                <div className="dashboard-header">
                    <div className="top-details">
                        <h3 className="tittle">Election / Poll Analyser</h3>
                        <h4 className="description">
                            Analyser Votes, filter, search, sort and distribute undecided votes.
                        </h4>
                    </div>

                    <div className="user-details">
                        <strong>
                            {loginUserInfo?.firstName + " " + loginUserInfo?.lastName}
                        </strong>

                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </div>

                <div className='user-table-details'>
                    <div className='search'>
                        {/* <p>Search User</p> */}
                        <input
                            className='input'
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
                                    <th>{user.firstName + " " + user.lastName}</th>
                                    <th>{user.status}</th>
                                    <th>
                                        <span style={{cursor : 'pointer'}} onClick={() => handlePinUnpin(user.id , 'user')}><PinIcon color={'black'} fill={(Array.isArray(pinUser) && pinUser.includes(user.id)) ? 'black' : 'none'} /></span>
                                        <button className='action-btn' onClick={() => userId === user.id ? '' : handleReportUser(user.id)} style={{ cursor: userId === user.id ? "default" : "pointer" }}>{userId === user.id ? "Active User" : "Report"}</button>
                                    </th>
                                </tr>
                            )) : <tr><td colSpan='6'>No User</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className='box-detail'>
                    <div className='box'>
                        <p>Total User</p>
                        <p>{totalUser}</p>
                    </div>
                    <div className='box'>
                        <p>Total Candidates</p>
                        <p>{totalCandidates}</p>
                    </div>
                    <div className='box'>
                        <p>Total Votes</p>
                        <p>{totalVotes}</p>
                    </div>
                    <div className='box'>
                        <p>Undecided Votes</p>
                        <p>{undecidedVote}</p>
                    </div>
                    <div className='box'>
                        <p>Status</p>
                        <p>{totalVotes === 0 ? 'Not Started' : undecidedVote > 0 ? 'OnGoing' : 'Completed'}</p>
                    </div>
                </div>

                <div className='win-box'>
                    <p>{totalVotes === 0 ? ' Election has not started yet' : ties.length > 1 ? 'Tie' : 'Winner'}  {totalVotes !== 0 && (ties ? [...new Set(ties.map(tie => tie.party))].join(', ') : finalResult.party)} {totalVotes !== 0 && `(${finalResult.votes} Votes)`}</p>
                </div>

                <div className='party-filter'>
                    {defaultData?.candidates?.length > 0 ? (
                        <>
                            <div className="tabs" key="all">
                                <input
                                    type="radio"
                                    name="tab"
                                    id="tab-all"
                                    value="All"
                                    onChange={() => handleFilterParty('All')}
                                    defaultChecked
                                />
                                <label htmlFor="tab-all" className="tab-btn">
                                    All
                                </label>
                                {[...new Set(
                                    defaultData.candidates.map(candidate => candidate.party)
                                )].map((party, index) => (
                                    <div className="tabs" key={party}>
                                        <input
                                            type="radio"
                                            name="tab"
                                            id={`tab${index + 1}`}
                                            value={party}
                                            onChange={(e) => handleFilterParty(e.target.value)}
                                        />
                                        <label htmlFor={`tab${index + 1}`} className="tab-btn">
                                            Party {party}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : 'No Party Found'}
                </div>

                <div className="candidates">
                    <div className='search-cadi'>
                        <p>Search Candidate</p>
                        <input className='input' type="text" placeholder='Search by name...' value={search} onChange={(e) => { setSearch(e.target.value); handleSearch(e.target.value) }} />
                    </div>
                    <div className='sort'>
                        <p>Sort By</p>
                        <select className='select' value={sortBy} onChange={(e) => handleSort(e.target.value)} >
                            <option value='high-low'>Votes : High to Low</option>
                            <option value='low-high'>Votes : Low to High</option>
                            <option value='name-asc'>Name : A to Z</option>
                            <option value='name-desc'>Name : Z to A</option>
                        </select>
                    </div>
                    <div className='show-btn'>
                        <button className='action-btn' onClick={handleTopTwo}>Show Top 2</button>
                    </div>
                </div>

                <div>
                    <table>
                        <tbody>
                            <tr>
                                <th>#</th>
                                <th>Candidate</th>
                                <th>Party</th>
                                <th>Votes</th>
                                <th>Percentage</th>
                                <th>Action</th>
                            </tr>
                            {filteredCandidates.length > 0 ? filteredCandidates.map((user, index) => {
                                const isReported = RepotedUserId?.some(id => Number(id) === Number(user?.whoAdded));
                                const isOwner = userId === user?.whoAdded;
                                function countComments(commentList) {
                                    let count = 0;

                                    commentList.forEach(comment => {
                                        count++;
                                        if (comment.replies && comment.replies.length > 0) {
                                            count += countComments(comment.replies);
                                        }
                                    });

                                    return count;
                                }
                                const commentsArray = Array.isArray(commentList) ? commentList : [];
                                const totalcount = countComments(commentsArray.filter((comment) => comment.candidate_id === user.id));

                                return (
                                    <tr key={index}>
                                        <th>{index + 1}</th>
                                        <th>{user.candidates}</th>
                                        <th>{user.party}</th>
                                        <th>{user.votes}</th>
                                        <th>{handlePercentage(user.votes) + '%'}</th>
                                        <th>
                                            <span style={{cursor : 'pointer'}} onClick={() => handlePinUnpin(user.id , 'candidate')}><PinIcon color={'black'} fill={pinCandidate.includes(user?.id) ? 'black' : 'none'}/></span>
                                            <span disabled={isReported} onClick={() => handleLike(user.id)} style={{ color: user.id === likeId ? 'red' : 'black', cursor: isReported ? 'default' : 'pointer', pointerEvents: isReported ? 'none' : 'auto' }}><LikeIcon style={{ color: user.id === likeId ? 'red' : 'black' }} /> {Number(user.like || 0)}</span>
                                            <span disabled={isReported} onClick={() => handleDislike(user.id)} style={{ color: user.id === disLikeId ? 'red' : 'black', cursor: isReported ? 'default' : 'pointer', pointerEvents: isReported ? 'none' : 'auto' }}><DislikeIcon style={{ color: user.id === disLikeId ? 'red' : 'black' }} /> {Number(user.dislike || 0)}</span>
                                            <span onClick={() => {setOpenCommentModal(true) , setSelectCandidate(user)}} style={{ cursor: 'pointer', pointerEvents: isReported ? 'none' : 'auto' }} disabled={isReported}><CommentsIcon />{totalcount}</span>
                                            <button disabled={isReported} className='action-btn' onClick={() => handleVotes(user.id)}  style={{ cursor: isReported ? 'default' : 'pointer' }}>Add Votes</button>
                                            {!isOwner && <button className='action-btn' onClick={() => handleReport(user.id)} disabled={isReported} style={{ cursor: isReported ? 'default' : 'pointer' }}>Report</button>}
                                            {isOwner && <button className='action-btn' onClick={() => handleRemoveCandidate(user.id)} style={{ background: 'red' }}>Remove candidate</button>}
                                            {isOwner && user?.votes <= 0 && user?.like <= 0 && user?.dislike <= 0 && user?.editCandidate === false && <button className='action-btn' onClick={() => { setOpen(true), setSelectCandidate(user) }} style={{ background: '#eca265ff' }} >Update candidate</button>}
                                        </th>
                                    </tr>
                                )
                            }) : <tr><td colSpan='6'>No candidates</td></tr>}
                            {(addedCandidates.length < 3 || addedCandidates === false) &&
                                <tr>
                                    <td colSpan='6'><button className='action-btn' data-modal="modal-create" onClick={() => { setOpen(true), setSelectCandidate('') }}>Add Candidate</button></td>
                                </tr>
                            }
                            <tr>
                                <td colSpan='5'>Undecided Votes</td>
                                <td colSpan='1'><button className='action-btn' onClick={handleUndicidedVoted}>Add Undecided Votes</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className='win-box bottom-actions'>
                    <strong className='total'>Total Votes : {totalVotes}</strong>
                </div>

                <div className='win-box undecided-actions'>
                    <div className='box'>
                        <p>Undecided Votes</p>
                        <p>{undecidedVote}</p>
                    </div>
                    <p>Distribute Undecided Votes equally (one by one) in round-robin order across all candidates.</p>
                    <button className='action-btn' onClick={handleDisributeVoteUndecided}>Distribute Undecided Votes</button>
                </div>

                {reportedUsers.length > 0 && <div className='win-box reported-actions'>
                    <div className='box'>
                        <p>Reported User</p>
                        <p>{reportedUsers?.length}</p>
                    </div>
                    <button className='action-btn' onClick={() => setOpenReportedUserModal(true)}>Show Reported User</button>
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
                onUnreport={(userId) => {
                    setReportedUserIds((prev) => prev.filter((id) => id !== userId));
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