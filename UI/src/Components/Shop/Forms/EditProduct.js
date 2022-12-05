import { Fragment, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { readData } from "../../../Redux/Actions/GeneralActions"
import { _packages, _products, _suppliers } from "../../../Redux/Actions/ShopActions"
import Form from "../../ReactFormer/Form"


import moment from 'moment-timezone'
import PackageCard from "./PackageCard"
import { statuses } from "../../../Redux/constants"
const TIMEZONE_REGION = {
    "name": "Sydney Australia",
    "value": "Australia/Sydney"
}

export const getUtcString = (d = new Date()) => {
    return moment.tz(moment(), TIMEZONE_REGION.value).format("YYYY-MM-DD HH:mm:ss")
}

export default props => {
    const id = useParams()._id

    const getRange = (min, max) => {
        let arr = []
        for (let i = min; i <= max; i++) arr.push(i)
        return arr
    }

    const dispatch = useDispatch()
    const generalReducer = useSelector(state => state.general)
    const shopReducer = useSelector(state => state.shop)

    const [product, setProduct] = useState({ 
        ...shopReducer.products.find(prod => prod?._id === parseInt(id)),
        _locations: generalReducer._instances.filter(ins => shopReducer.locations[parseInt(id)]?.includes(ins._id)).map(l => l._id)
    })
    const [info, setInfo] = useState({ infoType: "Undetermined", infoMessage: "Undetermined" })
    const [submitted, setSubmitted] = useState(false)
    const [productPackage, setProductPackage] = useState({
        _items_per_package: null
    })
    const [infoPkg, setInfoPkg] = useState({ infoType: "Undetermined", infoMessage: "Undetermined" })
    const [submittedPkg, setSubmittedPkg] = useState(false)

    useEffect(() => {
        dispatch(readData())
        dispatch(_products.read())
        dispatch(_suppliers.read())
    }, [])

    useEffect(() => { if (submitted === true) setInfo({ infoType: shopReducer.updateProductStatus, infoMessage: shopReducer.updateProductMessage }) }, [shopReducer.updateProductStatus])
    useEffect(() => { 
        if (submitted === true) {
            setInfo({ infoType: shopReducer.deleteProductStatus, infoMessage: shopReducer.deleteProductMessage })
            if (shopReducer.deleteProductStatus === statuses.success) {
                setProduct(shopReducer.products[id])
            }
        } 
    }, [shopReducer.deleteProductStatus])

    const existing_sizes = shopReducer.packages.filter(pkg => pkg !== null && pkg !== undefined && pkg._product_id == product._id).map(item => item._items_per_package)
    console.log(existing_sizes)
    return (
        <div className="container">
            <div className="details">
                <h1>Edit a product</h1>
            </div>

            <div style={{ marginTop: "-60px", marginBottom: "120px" }}>
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
                                if (product[key] === "" || product[key] === null) return setInfo({ infoMessage: "Please make sure that you have correctly filled in the form.", infoType: "warning" })
                            }

                            const data = new FormData()
                            data.append("_id", product._id)
                            data.append("_product_number", product._product_number)
                            data.append("_name", product._name)
                            data.append("_description", product._description)
                            data.append("_category_id", product._category_id)
                            data.append("_price", product._price)
                            data.append("_supplier_id", product._supplier_id)
                            data.append("_image_url", product._image_url)
                            data.append("_reorder_quantity", product._reorder_quantity)
                            data.append("_is_internal", product._is_internal)
                            data.append("_locations", JSON.stringify(product._locations))
                            if (product?.image?.file !== undefined) data.append("image", product.image.file)
                            setSubmitted(true)
                            dispatch(_products.update(data))
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
                                name: "_supplier_id",
                                label: "Select Supplier",
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
                                value: product._is_internal === null ? 0 : product._is_internal,
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
                            }
                        ],
                        overloadedFields: [
                            (
                                <Fragment>
                                    {product._archived === 0 ? <button className="Rejected" onClick={e => {
                                        e.preventDefault()
                                        setSubmitted(true)
                                        dispatch(_products.read(id))
                                    }}>Archive</button> : <button className="Approved" onClick={e => {
                                        e.preventDefault()
                                        setSubmitted(true)
                                        dispatch(_products.read(id, true))
                                    }}>Retrive</button>}
                                </Fragment>
                            )
                        ],
                        fieldsData: product,
                        info: info,
                        submitted: submitted,
                        formName: "Edit Product Form",
                        submitButtonText: "Submit"
                    }}
                />
            </div>

            <Form
                data={{
                    handleChange: e => {
                        setInfoPkg({ infoType: "Undetermined", infoMessage: "Undetermined" })
                        setSubmittedPkg(false)
                        setProductPackage({
                            ...productPackage,
                            [e.target.name]: e.target.value
                        })
                    },
                    handleSubmit: e => {
                        e?.preventDefault()

                        const data = new FormData()
                        data.append("_product_id", id)
                        data.append("_items_per_package", productPackage._items_per_package)

                        setSubmittedPkg(true)
                        dispatch(_packages.create(data))
                    },
                    fields: [
                        {
                            name: "_items_per_package",
                            label: "Select package size",
                            value: productPackage._items_per_package,
                            formType: "select",
                            options: getRange(1, 20).filter(i => existing_sizes.includes(i) === false).map((item, index) => { return { "_id": item, "_name": item + " piece(s) / package" } })
                        },
                    ],
                    fieldsData: productPackage,
                    info: infoPkg,
                    submitted: submittedPkg,
                    formName: "Create a package",
                    submitButtonText: "Create"
                }}
            />

            <div className="manage-packages">
                {shopReducer.packages.filter(pkg => pkg !== null && pkg !== undefined && pkg._product_id === product._id).sort((a, b) => a._id > b._id ? 1 : -1).map(_package => <PackageCard _package={_package} product={product} />)}
            </div>
        </div>
    )
}