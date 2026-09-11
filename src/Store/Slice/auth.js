import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const getLocalData = (key, defaultValue) => {
    const data = localStorage.getItem(key);
    try {
        return data ? JSON.parse(data) : defaultValue;
    } catch {
        return defaultValue;
    }
};

const DefaultData = getLocalData('DefaultData')

const initialState = {
    userDetail: getLocalData('user') || [],
    loginUserInfo: getLocalData('loginUserInfo') || null,
    userData: getLocalData('userData') || [],
    defaultData: getLocalData('DefaultData') || [],
    report: DefaultData?.report || [],
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reqToSetUsertDetail: (state, action) => {
            const newUser = action.payload;
            const oldUser = getLocalData('user') || [];
            localStorage.setItem('user', JSON.stringify([...oldUser, newUser]));
            state.userDetail = getLocalData('user');
        },
        reqToSetLoginUserDetail: (state, action) => {
            localStorage.setItem('loginUserInfo', JSON.stringify(action.payload));
            state.loginUserInfo = getLocalData('loginUserInfo');
            state.userData = getLocalData('userData');
            state.userDetail = getLocalData('user');
        },
        reqToLogoutUserDetail: (state, action) => {
            const email = action.payload;
            const updateUserDetail = state.userDetail.map(u => u.email === email ? { ...u, status: 'Inactive' } : u);
            localStorage.setItem('user', JSON.stringify(updateUserDetail));
            state.loginUserInfo = null;
            localStorage.removeItem('loginUserInfo');
        },
        reqToUpdateUserData: (state, action) => {
            if (!state.loginUserInfo?.id) return;
            localStorage.setItem('userData', JSON.stringify(action.payload));
            state.userData = getLocalData('userData');
        },
        reqToUpdateDefaultData: (state, action) => {
            state.defaultData = action.payload;
            localStorage.setItem('DefaultData', JSON.stringify(state.defaultData));
            if (action.payload.report) {
                state.report = action.payload.report;
            }
        },
        reqToAddCandidateData: (state, action) => {
            const { candidateName, partyName, candidateId } = action.payload;
            const beforeDistributedVotes = JSON.parse(localStorage.getItem('BeforeDistributedVotes'));
            if (candidateId) {

                const data = state.defaultData.candidates.find((candidate) => candidate.id === candidateId);
                if (data?.editCandidate) {
                    toast.error('You can update candidates only once!');
                    return;
                }

                const updatedDefaultData = {
                    ...state.defaultData,
                    candidates: state.defaultData.candidates.map((candidate) => candidate.id === candidateId ? { ...candidate, candidates: candidateName, party: partyName, editCandidate: true } : candidate),
                }

                const updateBeforeDistributedVotesData = beforeDistributedVotes && {
                    ...beforeDistributedVotes,
                    candidates: beforeDistributedVotes.candidates.map((candidate) => candidate.id === candidateId ? { ...candidate, candidates: candidateName, party: partyName, editCandidate: true } : candidate),
                }

                localStorage.setItem('DefaultData', JSON.stringify(updatedDefaultData));
                state.defaultData = getLocalData('DefaultData');

                if (beforeDistributedVotes) {
                    localStorage.setItem('BeforeDistributedVotes', JSON.stringify(updateBeforeDistributedVotesData));
                }
                return;
            }
            const addedCandidates = state.defaultData?.candidates?.length > 0 && state.defaultData?.candidates.filter((user) => Number(user.whoAdded) === Number(state.loginUserInfo?.id));
            if (addedCandidates.length === 3) {
                toast.error('You can only add 3 candidates');
                return;
            }
            const candidate = {
                id: state.defaultData?.candidates?.length ? state.defaultData.candidates[state.defaultData.candidates.length - 1].id + 1 : 1,
                candidates: candidateName,
                party: partyName,
                votes: 0,
                like: 0,
                dislike: 0,
                whoAdded: state.loginUserInfo?.id,
                editCandidate: false,
            }
            const updateDefaultData = state.defaultData.length === 0 ? { candidates: [candidate] } : { ...state.defaultData, candidates: [...state.defaultData.candidates, candidate] };
            const updateBeforeDistributedVotes = beforeDistributedVotes ? beforeDistributedVotes.length === 0 ? { candidates: [candidate] } : { ...beforeDistributedVotes, candidates: [...beforeDistributedVotes.candidates, candidate] } : null;
            localStorage.setItem('DefaultData', JSON.stringify(updateDefaultData));
            state.defaultData = getLocalData('DefaultData');
            if (beforeDistributedVotes) {
                localStorage.setItem('BeforeDistributedVotes', JSON.stringify(updateBeforeDistributedVotes));
            }
        },
        reqToDeleteCandidate: (state, action) => {
            const candidateId = action.payload;
            const beforeDistributedVotes = JSON.parse(localStorage.getItem('BeforeDistributedVotes'));
            const removedCandidate = state.defaultData.candidates.find(candidate => candidate.id === candidateId);

            const removedUserVotes = removedCandidate?.votes || 0;
            const remainingCandidates = state.defaultData.candidates.filter(candidate => candidate.id !== candidateId);
            const otherCandidatesCount = remainingCandidates.length;

            let remainingVotes = removedUserVotes;

            let updatedCandidates = [...remainingCandidates];

            const reportedCandidateIds = state?.defaultData?.report?.filter(report => report?.whoReported === state?.loginUserInfo?.id)?.map(report => report?.reportedCandidateId) || [];
            const eligibleIndices = updatedCandidates.map((candidate, index) => ({ index, id: candidate?.id })).filter(({ id }) => !reportedCandidateIds.includes(id)).map(({ index }) => index);

            if (otherCandidatesCount > 0 && removedUserVotes > 0) {
                updatedCandidates = remainingCandidates.filter((candidate) => ({ ...candidate }));

                if (eligibleIndices.length > 0) {
                    for (let i = 0; i < removedUserVotes; i++) {
                        const candidateIndex = eligibleIndices[i % eligibleIndices.length];
                        updatedCandidates[candidateIndex] = {
                            ...updatedCandidates[candidateIndex],
                            votes: updatedCandidates[candidateIndex].votes + 1
                        };
                    }
                }
            }
            const updatedDefaultData = {
                ...state.defaultData,
                candidates: updatedCandidates,
                undecidedVote: eligibleIndices && eligibleIndices?.length === 0 ? state.defaultData.undecidedVote + remainingVotes : state.defaultData.undecidedVote
            };
            localStorage.setItem('DefaultData', JSON.stringify(updatedDefaultData));
            state.defaultData = getLocalData('DefaultData');

            const updateCanidates = state.userData.map((user) => {
                const hasRemovedCandidateVote = user.votedCandidateId === candidateId;
                const hasRemovedCandidateLike = user.likeId?.includes(candidateId);
                const hasRemovedCandidateDislike = user.dislikeId?.includes(candidateId);

                if (!hasRemovedCandidateVote && !hasRemovedCandidateLike && !hasRemovedCandidateDislike) {
                    return user;
                }

                let newVotedCandidateId = user.votedCandidateId;
                let undecidedVotesDistributed = user.undecidedVotesDistributed;

                if (hasRemovedCandidateVote) {
                    if (eligibleIndices.length > 0) {
                        const userIndex = state.userData.indexOf(user);
                        const distributedIndex = eligibleIndices[userIndex % eligibleIndices.length];
                        newVotedCandidateId = updatedDefaultData.candidates[distributedIndex]?.id || 'undecided';
                        undecidedVotesDistributed = true;
                        console.log(distributedIndex, 'distributedIndex', newVotedCandidateId, 'newVotedCandidateId', userIndex, 'userIndex')
                    } else {
                        newVotedCandidateId = 'undecided';
                        undecidedVotesDistributed = false;
                    }
                }

                return {
                    ...user,
                    votedCandidateId: newVotedCandidateId,
                    undecidedVotesDistributed,
                    likeId: user.likeId ? user.likeId.filter(id => id !== candidateId) : user.likeId,
                    dislikeId: user.dislikeId ? user.dislikeId.filter(id => id !== candidateId) : user.dislikeId
                };
            });

            localStorage.setItem('userData', JSON.stringify(updateCanidates));
            state.userData = getLocalData('userData');

            if (beforeDistributedVotes) {
                const beforeCandidates = beforeDistributedVotes.candidates.filter(candidate => candidate.id !== candidateId);
                const undecidedVote = beforeDistributedVotes?.undecidedVote < remainingVotes ? remainingVotes : beforeDistributedVotes?.undecidedVote;
                const updateBeforeDistributedVotesData = {
                    ...beforeDistributedVotes,

                    candidates: beforeCandidates.map(candidate => ({
                        ...candidate,
                        votes: candidate?.votes
                    })),

                    undecidedVote: eligibleIndices && eligibleIndices?.length === 0 ? undecidedVote : beforeDistributedVotes?.undecidedVote
                };
                localStorage.setItem('BeforeDistributedVotes', JSON.stringify(updateBeforeDistributedVotesData));
            }
        },
    },
})

export const { reqToSetLoginUserDetail, reqToSetUsertDetail, reqToLogoutUserDetail, reqToUpdateUserData, reqToUpdateDefaultData, reqToAddCandidateData, reqToDeleteCandidate } = authSlice.actions;
export default authSlice.reducer