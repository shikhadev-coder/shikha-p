import React from "react";
import "./login.css";
import { Formik, Form, ErrorMessage } from "formik";
import TextField from "../../Component/TextField";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { reqToSetLoginUserDetail } from "../../Store/Slice/auth";
import { toast } from "react-toastify";

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userDetail, loginUserInfo } = useSelector(state => state.auth);

    const initialValues = {
        id: userDetail?.email === loginUserInfo?.email ? userDetail?.id : null,
        email: "",
        password: "",
    };

    const validate = Yup.object({
        email: Yup.string().email("Email is invalid!").required("Email Required!"),
        password: Yup.string()
            .min(4, "Password must be minimum 4 digits!")
            .required("Password Required!"),
    });

    // if (loginUserInfo) {
    //     navigate("/page");
    // }

    const handleSubmit = (values , resetForm) => {
        const user = userDetail.find(user => user.email.toLowerCase() === values.email.toLowerCase() && user.password === values.password);

        if (!user) {
            toast.error("Invalid email or password!");
            return;
        }
        const updateUserDetail = userDetail.map(u => ({ ...u, status: u.email.toLowerCase() === values.email.toLowerCase() ? "Active" : "Inactive"}));
        localStorage.setItem('user', JSON.stringify(updateUserDetail));
        dispatch(reqToSetLoginUserDetail(user));
        navigate("/page");
        resetForm();
    }
    return (
        <div>
            <Formik
                initialValues={initialValues}
                validationSchema={validate}

                onSubmit={(values, { resetForm }) => {
                    handleSubmit(values , resetForm);
                }}
            >
                {() => (
                    <div>
                        <h1 className="title">Login</h1>
                        <Form className="form">
                            <TextField
                                className="form-control"
                                type="email"
                                name="email"
                                label="Email"
                                placeholder="Enter you email"
                            />
                            <TextField
                            className="form-control"
                                type="password"
                                name="password"
                                label="Password"
                                placeholder="Enter you password"
                            />
                            <button className="btn btn-dark m-3" type="submit">
                                Login
                            </button>
                            <p>Don't have an account? <Link to='/'>signUp</Link></p>
                        </Form>
                    </div>
                )}
            </Formik>
        </div>
    );
}

