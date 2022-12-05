import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { readData } from "../../../Redux/Actions/GeneralActions"
import { _products } from "../../../Redux/Actions/ShopActions"
import { _technician_packages } from "../../../Redux/Actions/ShopActions"
import Input from "../../ReactFormer/Input"
import Select from "../../ReactFormer/Select"
import ProductCard from "./ProductCard"

import { NavLink } from 'react-router-dom'

import "./Products.css"
import PackageCard from "./PackageCard"

export default props => {

    const dispatch = useDispatch()
    const generalReducer = useSelector(state => state.general)
    const shopReducer = useSelector(state => state.shop)
    const userReducer = useSelector(state => state.user)
    useEffect(() => {
        dispatch(readData())
        dispatch(_products.read())
        dispatch(_technician_packages.read())
    }, [])

    const [filter, setFilter] = useState({
        _name: "",
        _category_id: null
    })

    let productsJsx

    if (userReducer.currentUser._type_id === 2) {
        productsJsx = shopReducer.packages?.filter(pkg => pkg !== null && pkg !== undefined && pkg._archived !== 1 && shopReducer.products[pkg._product_id] !== undefined && shopReducer.products[pkg._product_id] !== null && shopReducer.products[pkg._product_id]._archived !== 1 &&
            (shopReducer.products[pkg._product_id]._name.toLowerCase().includes(filter._name.toLowerCase()) || filter._name === "") &&
            (shopReducer?.locations[pkg._product_id] !== null && shopReducer?.locations[pkg._product_id]?.includes(userReducer.currentUser._instance_id)) &&
            (shopReducer.products[pkg._product_id]._category_id === filter._category_id || filter._category_id === null))
            .map(pkg => <ProductCard product={shopReducer.products[pkg._product_id]} package={pkg} />)
    } else {
        productsJsx = shopReducer.packages?.filter(pkg => pkg !== null && pkg !== undefined && pkg._archived !== 1 && shopReducer.products[pkg._product_id] !== undefined && shopReducer.products[pkg._product_id] !== null && shopReducer.products[pkg._product_id]._archived !== 1 && shopReducer.products[pkg._product_id]._is_internal !== 1 &&
            (shopReducer.products[pkg._product_id]._name.toLowerCase().includes(filter._name.toLowerCase()) || filter._name === "") &&
            (shopReducer.products[pkg._product_id]._category_id === filter._category_id || filter._category_id === null))
            .map(pkg => <ProductCard product={shopReducer.products[pkg._product_id]} package={pkg} />)
    }

    return (
        <div className="container shop-container">
            <div className="details" style={{ paddingBottom: "20px" }}>
                <h1>Products Page</h1>

                <div className="form" style={{ margin: "30px auto" }}>
                    <form>
                        <Input
                            name="_name"
                            label="Product Name"
                            type="text"
                            value={filter._name}
                            placeholder="Search product by name."
                            handleChange={e => setFilter({ ...filter, _name: e.target.value })}
                        />
                        <Select
                            name="_name"
                            label="Select Category"
                            value={filter._category_id}
                            options={generalReducer._product_categories}
                            handleChange={e => setFilter({ ...filter, _category_id: e.target.value })}
                        />
                        <span>
                            <NavLink to="/products/products_cart">Cart</NavLink>
                            <NavLink to="/orders/customer_orders">Orders</NavLink>
                        </span>
                    </form>
                </div>
            </div>
            <div className="products-container">
                {productsJsx}
                {/* {shopReducer.techPackages.map(pkg => pkg === null ? null : <PackageCard package={pkg} />)} */}
            </div>
        </div>
    )
}