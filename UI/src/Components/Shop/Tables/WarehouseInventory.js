import Table from "../../ReduxTable/Table"
import { statuses } from '../../../Redux/constants'
import { CONSTANTS } from "../../../../package.json"

export default props => {
    const generateArray = item => {
        const product = props.shop.products[item._product_id]

        return [
            { "Product Name": product?._name },
            { "Quantity": item._quantity },
            { "Product Image": (<img src={CONSTANTS.STATIC_URL + product?._image_url} style={{ margin: "0px 10px" }} width="100px" />) }
        ]
    }

    const mappedInventory = props.shop.warehouseInventory.filter(item => item !== null && item !== undefined && item._instance_id == props.id).map(item => generateArray(item))
    
    return (
        <Table
            loading={props.shop.readProductStatus === statuses.pending || props.shop.readWarehouseInventoryStatus === statuses.pending || props.general.readDataStatus === statuses.pending}
            columns={[
                { name: "Product Name" },
                { name: "Quantity", width: 80 },
                { name: "Product Image", width: 120 },
            ]}
            rows={mappedInventory}
            hideTopClear={true}
        />
    )
}