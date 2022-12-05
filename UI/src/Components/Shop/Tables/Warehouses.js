import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { readData } from "../../../Redux/Actions/GeneralActions"
import Table from "../../ReduxTable/Table"

export default props => {
    const dispatch = useDispatch()
    const general = useSelector(state => state.general)

    const createArray = instance => {
        return [
            { "Name": instance._name },
            { "ID": instance._id }
        ]
    }

    const mapepdData = general._instances.map(instace => createArray(instace))

    useEffect(() => dispatch(readData()), [])

    return (
        <div className="container">
            <div className="details">
                <h1>Browse Warehouses</h1>
            </div>

            <Table
                loading={general.readDataStatus === "pending"}
                setExportData={() => { }}
                redirectPath="/warehouse/settings/"
                appendField="ID"
                appendAfterArgument="/inventory"
                appendFieldIdx={1}
                columns={[
                    { name: "Name" },
                    { name: "ID" },
                ]}
                rows={mapepdData}
            />
        </div>
    )
}