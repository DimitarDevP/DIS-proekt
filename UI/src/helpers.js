import XLSX from 'sheetjs-style-v2'

export const getFilteredData = (data, fields) => {
    const _columns = data.cols.filter(column => fields.includes(parseInt(column.key)) === true)
    const _data = data.data.map((row, index) => {
        if (index === 0) return row
        else return row.filter((item, index) => fields.includes(index) === true)
    })
    return {
        cols: _columns,
        data: _data.filter(d => d.length > 0)
    }
}

export const generate = (exportData, fields) => {
    const _data = getFilteredData(exportData, fields)
    let wb = XLSX.utils.book_new()
    wb.Props = {
        Title: "Report",
        Subject: "Report",
        Author: "WorxManager",
        CreatedDate: new Date()
    }
    wb.SheetNames.push("Report")
    const ws_data = _data.data
    const ws = XLSX.utils.aoa_to_sheet(ws_data)
    const colRules = _data.data[1].map(text => { console.log(text); return { wch: 30 } })
    ws["!cols"] = colRules

    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split("")
    chars = [...chars, "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL", "AM", "AN", "AO", "AP"]

    for (const [idr, row] of ws_data.entries()) {
        for (const [idc, col] of row.entries()) {
            const field = chars[idc]+(idr+1)?.toString()
            const isTotal = ws[field]?.v?.toString()?.includes("~") || ws[field]?.v?.toString()?.toLowerCase()?.includes("total")
            if (ws[field] !== undefined) ws[field].v = ws[field]?.v?.toString().replace("~", "")
            else ws[field] = {v: ""}
            if (isTotal) {
                for (const [cid, _col] of row.entries()) {
                    const _field = chars[cid]+(idr+1)?.toString()
                    ws[_field].s = {
                        fill: {
                            fgColor: {rgb: "FFAAAAAA"},
                            patternType: "solid"
                        },
                        font: {
                            bold: true,
                        }
                    }
                }
            }
        }
    }
    
    wb.Sheets["Report"] = ws;
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
    return wbout
}

export const s2ab = s => {
    var buf = new ArrayBuffer(s.length)
    var view = new Uint8Array(buf)
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF
    return buf
}


export const getDateFromRange = dates => {
    try {
        if (dates?.from && dates?.to)
            return dates.from.toDateString() + " to " + dates.to.toDateString()
        else return dates.toDateString()
    } catch (error) {
        return "Invalid Date(s)"
    }
}