import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Redirect } from "react-router-dom"
import { login } from "../../../Redux/Actions/UserActions"
import "./Login.css"
import image from "../../../static/PlastfixShop.png"
import Input from "../../ReactFormer/Input"
import Info from "../../ReactFormer/Info"

export default props => {
    const dispatch = useDispatch()
    const [user, setUser] = useState({
        _username: "",
        _password: ""
    })

    const [info, setInfo] = useState({ infoType: "Undetermined", infoMessage: "Undetermined" })
    const [submitted, setSubmitted] = useState(false)

    const userReducer = useSelector(state => state.user)

    useEffect(() => {
        if (submitted === false) return

        setInfo({ infoType: userReducer.loginStatus, infoMessage: userReducer.loginMessage })

    }, [userReducer, submitted])

    const handleChange = e => {
        setSubmitted(false)
        setInfo({ infoType: "Undetermined", infoMessage: "Undetermined" })
        setUser({ ...user, [e.target.name]: e.target.value })
    }
    
    const handleSubmit = e => {
        e.preventDefault()
        const data = new FormData()
        data.append("_username", user._username)
        data.append("_password", user._password)
        setSubmitted(true)
        dispatch(login(data))
    }

    return (
        <div className="container loginContainer">
            {userReducer?.currentUser?._id !== undefined ? <Redirect to="/orders/customer_orders" /> : null}
            <div className="login-wrapper">
                <img src={image} />
                <form className="form">
                    <h1>LOGIN</h1>
                    <Input type="text" name="_username" label="Username" placeholder="Enter your username" value={user["_username"]} handleChange={e => handleChange(e)} />
                    <Input type="password" name="_password" label="Password" placeholder="Enter your password" value={user["_password"]} handleChange={e => handleChange(e)} />
                    {submitted === true ? <Info type={info.infoType} message={info.infoMessage} /> : <button onClick={e => handleSubmit(e)}>Login</button>}
                </form>
            </div>
        </div>
    )
}