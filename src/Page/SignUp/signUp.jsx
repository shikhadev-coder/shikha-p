import React from "react";
import "./signup.css";
import { Formik, Form, ErrorMessage } from "formik";
import TextField from "../../Component/TextField";
import * as Yup from "yup";
import { reqToSetUsertDetail } from "../../Store/Slice/auth";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SignUp() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { userDetail } = useSelector(state => state.auth);

    const initialValues = {
        id: Date.now(),
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    };

    const validate = Yup.object({
        firstName: Yup.string().required("Firstname Required!"),
        lastName: Yup.string(),
        email: Yup.string().email("Email is invalid!").required("Email Required!"),
        password: Yup.string()
            .min(4, "Password must be minimum 4 digits!")
            .required("Password Required!"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "Password must match!")
            .required("Confirm password is reqired!"),
    });

    const handleSubmit = (values, resetForm) => {
        const alreadyExist = userDetail.some((user) => user.email.toLowerCase() === values.email.toLowerCase());

        if (alreadyExist) {
            toast.error("User already exists");
            return;
        }

        const payload = { ...values, status: '' };
        dispatch(reqToSetUsertDetail(payload));
        resetForm();
        navigate('/login');
    }

    return (
        <div>
            <Formik
                initialValues={initialValues}
                validationSchema={validate}
                onSubmit={(values, { resetForm }) => {
                    handleSubmit(values, resetForm)
                }}
            >
                {(formik) => (
                    <div>
                        <h1 className="">Signup</h1>
                        <Form className="form p-3">
                            <TextField
                                type="text"
                                label="Firstname"
                                name="firstName"
                                placeholder="Enter your first name"
                            />
                            <TextField
                                type="text"
                                name="lastName"
                                label="Lastname"
                                placeholder="Enter your last name"
                            />
                            <TextField
                                type="email"
                                name="email"
                                label="Email"
                                placeholder="Enter you email"
                            />
                            <TextField
                                type="password"
                                name="password"
                                label="Password"
                                placeholder="password"
                            />
                            <div className="mb-2">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    id="confirmPassword"
                                    className={`form-control shadow-none ${formik.touched.confirmPassword &&
                                        formik.errors.confirmPassword &&
                                        "is-invalid"
                                        }`}
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="confirm password"
                                    {...formik.getFieldProps("confirmPassword")}
                                />
                                <ErrorMessage
                                    component="div"
                                    name="confirmPassword"
                                    className="error"
                                />
                            </div>
                            <button className="btn btn-dark m-3" type="submit">
                                SignUp
                            </button>
                            <p>Already have an account? <Link to='/login'>Login</Link></p>
                        </Form>
                    </div>
                )}
            </Formik>
        </div>
    );
}

