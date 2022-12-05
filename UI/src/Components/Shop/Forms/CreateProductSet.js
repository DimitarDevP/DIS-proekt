import { Fragment, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { _products, _technician_packages } from "../../../Redux/Actions/ShopActions"
import Form from "../../ReactFormer/Form"
import { MdLibraryAdd } from "react-icons/md"
import ItemCard from "./ItemCard"

export default props => {

    const dispatch = useDispatch()
    const generalReducer = useSelector(state => state.general)
    const shopReducer = useSelector(state => state.shop)

    const [packageSet, setPackageSet] = useState({
        _name: "",
        locations: [],
        items: []
    })
    const [info, setInfo] = useState({ infoType: "Undetermined", infoMessage: "Undetermined" })
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => { dispatch(_products.read()) }, [])
    useEffect(() => { setInfo({ infoType: shopReducer.createTechPackageStatus, infoMessage: shopReducer.createTechPackageMessage }) }, [shopReducer.createTechPackageStatus])

    return (
        <div className="container">
            <div className="details">
                <h1>Create a set of products</h1>
            </div>

            <div style={{ marginTop: "-60px", marginBottom: "120px" }}>
                <Form
                    data={{
                        handleChange: e => {
                            setInfo({ infoType: "Undetermined", infoMessage: "Undetermined" })
                            setSubmitted(false)
                            if (e.target.name === "_name" || e.target.name === "locations") setPackageSet({ ...packageSet, [e.target.name]: e.target.value })
                        },
                        handleSubmit: e => {
                            e?.preventDefault()

                            // const _items = [...packageSet]
                            // for (const i of _items) delete i._id

                            const data = new FormData()
                            data.append("_name", packageSet._name)
                            data.append("locations", JSON.stringify(packageSet.locations))
                            data.append("items", JSON.stringify(packageSet.items))
                            setSubmitted(true)
                            dispatch(_technician_packages.create(data))
                        },
                        fields: [
                            {
                                name: "_name",
                                label: "Product Name",
                                type: "text",
                                value: packageSet._name,
                                placeholder: "Enter Product Name",
                                formType: "input"
                            },
                            {
                                name: "locations",
                                label: "Available In:",
                                value: packageSet.locations,
                                options: generalReducer._instances,
                                formType: "multiple"
                            }
                        ],
                        overloadedFields: [
                            <Fragment>
                                {packageSet.items.sort((a, b) => a._id > b._id ? 1 : -1).map(item => <ItemCard item={item} setPackageSet={setPackageSet} packageSet={packageSet} setInfo={setInfo} setSubmitted={setSubmitted} />)}
                                <MdLibraryAdd 
                                    className="add-item"
                                    onClick={e => {
                                        e.preventDefault()
                                        setPackageSet({
                                            ...packageSet,
                                            items: [
                                                ...packageSet.items, 
                                                {
                                                    _id: packageSet.items.sort((a, b) => a._id > b._id ? 1 : -1).length === 0 ? 0 : packageSet.items.sort((a, b) => a._id > b._id ? 1 : -1)[packageSet.items.sort((a, b) => a._id > b._id ? 1 : -1).length - 1]._id + 1,
                                                    _product_id : null, 
                                                    _quantity: 1, new: true
                                                }
                                            ]
                                        })
                                    }}
                                />
                            </Fragment>
                        ],
                        fieldsData: packageSet,
                        info: info,
                        submitted: submitted,
                        formName: "Create Product Set Form",
                        submitButtonText: "Create"
                    }}
                />
            </div>
        </div>
    )
}