import React, { useState } from "react";
import './modal.css';
import { Field, Formik,Form } from "formik";
import TextField from "../TextField";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { reqToAddCandidateData } from "../../Store/Slice/auth";
import { toast } from "react-toastify";

const AddCandidateModal = ({ onClose , candidate }) => {
    const dispatch = useDispatch();
    const { defaultData } = useSelector(state => state.auth);

    const validate = Yup.object({
        candidateName: Yup.string().required("Candidate Name Required!"),
        partyName: Yup.string().required("Party Name Required!")
    });

    const handleSubmit = (values , resetForm) => {
        if (!values.candidateName.trim() || !values.partyName.trim()) return;

        const CandidateAlreadyExist = defaultData?.candidates?.some((candidate) => candidate.candidates.toLowerCase() === values.candidateName.trim().toLowerCase());

        if (CandidateAlreadyExist) {
            toast.error("Candidate Already Exist!");
            return;
        }

        if(candidate && candidate?.editCandidate === false){
            const confirmModal = window.confirm("You can only edit this one time. Are you sure you want to save?");
            if(!confirmModal){
                return;
            }
        }
        dispatch(reqToAddCandidateData({candidateName : values.candidateName.trim(), partyName : values.partyName.trim() ,candidateId : candidate?.id}));
        resetForm();
        onClose();
    };


    return (

        <div className="Modal">
            <Formik
                initialValues={{
                    candidateName: candidate?.candidates,
                    partyName: candidate?.party,
                }}
                validationSchema={validate}

                onSubmit={(values, { resetForm }) => {
                    handleSubmit(values , resetForm);
                }}
            >
                {() => (
                    <div >
                        <Form className="form">
                            <TextField
                            className="form-control"
                            type="text"
                            name="candidateName"
                            label="Candidate Name"
                            placeholder="Enter you candidate name"
                            />
                            <TextField
                                className="form-control"
                                type="text"
                                name="partyName"
                                label="Party Name"
                                placeholder="Enter you party name"
                            />
                            <button className="btn btn-dark m-3" type="submit">
                                {candidate ? "Update" : "Add"}
                            </button>
                            <button className="btn btn-danger" onClick={onClose}>Cancel</button>
                        </Form>
                    </div>
                )}
            </Formik>
        </div>
    );
};

export default AddCandidateModal;