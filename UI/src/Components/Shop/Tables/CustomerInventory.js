import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Table from "../../ReduxTable/Table"
import { readInventory, _products, _packages } from "../../../Redux/Actions/ShopActions"
import { addOrder, emptyCart } from '../../../Redux/Actions/TempCartActions'
import { statuses } from '../../../Redux/constants'
import { CONSTANTS } from "../../../../package.json"
import { Redirect } from 'react-router-dom'

export default props => {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(_products.read())
        dispatch(_packages.read())
        dispatch(readInventory())
    }, [])

    const shop = useSelector(state => state.shop)
    const user = useSelector(state => state.user)
    const [redirect, setRedirect] = useState(false)

    const generateArray = item => {
        const product = shop.products[item._product_id]

        return [
            { "Product Name": product?._name },
            { "Quantity": item._quantity },
            { "Product Image": (<img src={CONSTANTS.STATIC_URL + product?._image_url} style={{ margin: "0px 10px" }} width="100px" />) }
        ]
    }

    const mappedInventory = shop.inventory.filter(item => item._customer_id == user?.currentUser?._id).map(item => generateArray(item))

    return (
        <div className="container">
            {redirect === true ? <Redirect to="/products/products_cart" /> : null}
            <div className="details">
                <h1>Stock</h1>
                <h3>Browser products in your stocks</h3>
            </div>
            <div className="inventory-container">
                <center>
                    <button className="top-off" onClick={e => {
                        e.preventDefault()
                        dispatch(emptyCart())

                        const missingInventory = shop.inventory.filter(item => item._customer_id == user?.currentUser?._id && item._quantity < 0)
                        for (const item of missingInventory) {
                            let itemPackage = shop.packages.find(pkg => pkg?._items_per_package == 1 && pkg?._product_id == item._product_id)
                            let _item = {
                                _product_id: itemPackage._id,
                                _quantity: item._quantity * -1
                            }
                            dispatch(addOrder(_item))
                        }
                        setRedirect(true)
                    }}> Top off my stock. </button>
                </center>
                <Table
                    hideTopClear={true}
                    loading={shop.readProductStatus === statuses.pending || shop.readInventoryStatus === statuses.pending}
                    columns={[
                        { name: "Product Name" },
                        { name: "Quantity", width: 80 },
                        { name: "Product Image", width: 120 },
                    ]}
                    rows={mappedInventory}
                />
            </div>
        </div>
    )
}