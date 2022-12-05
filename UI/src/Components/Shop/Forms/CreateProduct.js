import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { readData } from "../../../Redux/Actions/GeneralActions"
import { _products, _suppliers } from "../../../Redux/Actions/ShopActions"
import Form from "../../ReactFormer/Form"

export default props => {

    const getRange = (min, max) => {
        let arr = []
        for (let i = min; i <= max; i++) arr.push(i)
        return arr
    }

    const dispatch = useDispatch()
    const generalReducer = useSelector(state => state.general)
    const shopReducer = useSelector(state => state.shop)

    const [product, setProduct] = useState({
        _product_number: "",
        _name: "",
        _description: "",
        _category_id: null,
        _price: "",
        _reorder_quantity: null,
        _package_sizes: [],
        _supplier_id: null,
        image: null,
        _is_internal: 0
    })
    const [info, setInfo] = useState({ infoType: "Undetermined", infoMessage: "Undetermined" })
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        dispatch(readData())
        dispatch(_suppliers.read())
    }, [])

    useEffect(() => {
        if (submitted === true) setInfo({infoType: shopReducer.createProductStatus, infoMessage: shopReducer.createProductMessage})
    }, [shopReducer])

    return (
        <div className="container">
            <div className="details">
                <h1>Add a product in the system</h1>
            </div>

            <div style={{ marginTop: "-60px", marginBottom: "120px"}}>
                <Form
                    data={{
                        handleChange: e => {
                            setInfo({ infoType: "Undetermined", infoMessage: "Undetermined" })
                            setSubmitted(false)
                            setProduct({
                                ...product,
                                [e.target.name]: e.target.value
                            })
                        },
                        handleSubmit: e => {
                            e?.preventDefault()
                            
                            for (const key in product) {
                                if (product[key] === "" ||  product[key] === null) return setInfo({infoMessage: "Please make sure that you have correctly filled in the form.", infoType: "warning"})
                            }

                            const data = new FormData()
                            data.append("_product_number", product._product_number)
                            data.append("_name", product._name)
                            data.append("_description", product._description)
                            data.append("_category_id", product._category_id)
                            data.append("_price", product._price)
                            data.append("_supplier_id", product._supplier_id)
                            data.append("_reorder_quantity", product._reorder_quantity)
                            data.append("_package_sizes", JSON.stringify(product._package_sizes))
                            data.append("_locations", JSON.stringify(product._locations))
                            data.append("_is_internal", product._is_internal)
                            data.append("image", product.image.file)
                            setSubmitted(true)
                            dispatch(_products.create(data))
                        },
                        fields: [
                            {
                                name: "_product_number",
                                label: "Product Number",
                                type: "text",
                                value: product._product_number,
                                placeholder: "Enter Product Number",
                                formType: "input"
                            },
                            {
                                name: "_name",
                                label: "Product Name",
                                type: "text",
                                value: product._name,
                                placeholder: "Enter Product Name",
                                formType: "input"
                            },
                            {
                                name: "_description",
                                label: "Product Description",
                                type: "textarea",
                                value: product._description,
                                placeholder: "Enter description",
                                formType: "input"
                            },
                            {
                                name: "_category_id",
                                label: "Select Product Category",
                                value: product._type_id,
                                formType: "select",
                                options: generalReducer._product_categories
                            },
                            {
                                name: "_price",
                                label: "Product Price",
                                type: "text",
                                value: product._price,
                                placeholder: "Enter Product Price",
                                formType: "input"
                            },
                            {
                                name: "_package_sizes",
                                label: "Select package size options",
                                value: product._package_sizes,
                                formType: "multiple",
                                options: getRange(1, 20).map((item, index) => { return {"_id": item, "_name" : item + " piece(s) / package"}})
                            },
                            {
                                name: "_supplier_id",
                                label: "Select Package Supplier",
                                value: product._supplier_id,
                                formType: "select",
                                options: shopReducer.suppliers
                            },
                            {
                                name: "_reorder_quantity",
                                label: "Reorder Quantity (for plastfix technicians)",
                                type: "number",
                                value: product._reorder_quantity,
                                placeholder: "Enter Reorder Quantity",
                                formType: "input"
                            },
                            {
                                name: "_locations",
                                label: "Available in",
                                value: product._locations,
                                formType: "multiple",
                                options: generalReducer._instances
                            },
                            {
                                name: "_is_internal",
                                label: "Product is internal",
                                value: product._is_internal,
                                formType: "checkbox_switch",
                            },
                            {
                                name: "image",
                                label: "Product Image",
                                accept: "image/*",
                                formType: "file",
                                multiple: false,
                                withPreview: false,
                                withComment: false
                            },
                        ],
                        fieldsData: product,
                        info: info,
                        submitted: submitted,
                        formName: "Create Product Form",
                        submitButtonText: "Create Product"
                    }}
                />
            </div>
        </div>
    )
}