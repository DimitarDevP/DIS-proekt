

def create_table_row(items):
    opening = '<span class="row regular">' 
    closing = "</span>"
    
    data = ""
    
    for item in items:
        data = data + "<p>" + str(item) + "</p>"
    
    return opening + data + closing


purchase_order_template = """
<html>
    <head>
        <title>${title}</title>
        <style>
            @media print {
                a::after {
                    content: " (" attr(href) ") ";
                }
                @page {
                    margin: 0in;
                    size: A4;
                    @top-right {
                        content: counter(page);
                    }
                }
                @page :first {
                    @top-right {
                        content: "";
                    }
                }
            }
            * {
                font-family: sans-serif;
            }
            body {
                display: block;
                margin: 0px auto;
            }
            @print {
                body {
                    margin: 0px !important;
                }
            }
            .header {
                padding: 80px 30px 20px 30px;
                background: #EEF8FF;
                display: flex;
                justify-content: space-between;
            }
            .header > span > h1 {
                color: #0E607B;
                margin-bottom: 15px;
            }
            .header > span > h3 {
                margin-bottom: 10px;
            }
            .header > span > p > b {
                color: #0E607B;
            }
            .shipping {
                display: flex;
                justify-content: space-between;
                padding: 30px 30px 40px 30px;
            }
            .shipping > span {
                width: 50%;
                display: flex;
            }
            .shipping > span > span > h3 > b {
                color: #0E607B;
                font-size: 1.1em;
            }
            .shipping > span > span:nth-child(1) {
                margin-right: 10px;
            }
            .shipping > span > span:nth-child(2) {
                margin-top: 2px;
            }
            .shipping > span > span > h3 {
                margin-bottom: 10px
            }
            .table {
                display: flex;
                flex-direction: column;
            }
            .table > .table-header {
                background: #2F8BCB;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #FFF;
            }
            .table > .table-header > p {
                display: block;
                width: 20%;
                padding: 0px 8px;
                box-sizing: border-box;
                text-align: center;
            }
            .table > .table-rows {
            }
            .table > .table-rows > .row {
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .table > .table-rows > .regular {
                border-bottom: 1px solid #333
            }
            .table > .table-rows > .row > p {
                display: block;
                width: 20%;
                padding: 0px 8px;
                box-sizing: border-box;
                text-align: center;
            }
            .table > .table-rows > .row.total { 
                margin: 0px; 
                padding: 0px;
            }
            .table > .table-rows > .row.total > p {
                padding: 10px 0px;
                margin: 0px;
            }
            .table > .table-rows > .row.total > .total-cell { 
                background: #2F8BCB;
                color: #FFF;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <span>
                <h1>PURCHASE ORDER</h1>
                <p><b>Date: </b>${date}</p>
                <p><b>PO #: </b>${order_number}</p>
            </span>
            <span>
                <h3>Plastfix Industries</h3>
                <p>Artarmon NSW 2064, Australia</p>
                <p><b>PHONE</b> +61 1300 432 265</p>
                <p><b>WEBSITE</b> www.plastfix.com</p>
            </span>
        </div>
        <div class="shipping">
            <span>
                <span> <h3><b>Vendor:</b></h3> </span>
                <span>
                    <h3>${vendor_name}</h3>
                    <p> ${vendor_address}</p>
                    <p><b>PHONE</b> ${vendor_phone}</p>
                    <p><b>EMAIL</b> ${vendor_email}</p>
                </span>
            </span>
            <span>
                <span> <h3><b>Ship To:</b></h3> </span>
                <span>
                    <h3>${reciever_name}</h3>
                    <p> ${reciever_address}</p>
                    <p><b>PHONE</b> ${reciever_phone}</p>
                    <p><b>EMAIL</b> ${reciever_email}</p>
                </span>
            </span>
        </div>
        <div class="table">
            <span class="table-header">
                <p><b>ITEM</b></p> <p><b>ITEM NUMBER</b></p> <p><b>QUANTITY</b></p> <p><b>PRICE</b></p> <p><b>TOTAL</b></p>
            </span>
            <span class="table-rows">
                ${rows}
                <span class="row total"> <p></p> <p></p> <p></p> <p class="total-cell">TOTAL</p> <p class="total-cell">${total}</p> </span>
            </span>
        </div>
    </body>
</html>
"""

invoice_template = """
    <html>
        <head>
            <title>inv-${invoice_number}</title>
            <style>
                @page {
                    margin: 0px
                }
                @media print {
                    a::after {
                        content: " (" attr(href) ") ";
                    }
                    @page {
                        margin: 0in;
                        size: A4;
                        @top-right {
                            content: counter(page);
                        }
                    }
                    @page :first {
                        @top-right {
                            content: "";
                        }
                    }
                }
                * {
                    margin: 0px;
                    padding: 0px;
                    font-family: sans-serif;
                }
                body {
                    display: block;
                    margin: 0px auto;
                }
                @print {
                    body {
                        margin: 0px !important;
                    }
                }
                .header {
                    padding: 50px 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #2F8BCB;
                }
                .header > h1 {
                    font-size: 3em;
                    font-weight: 500;
                    letter-spacing: 0.1em;
                    color: #FFF;
                }
                .header > span {
                    display: flex;
                    justify-content: space-between;
                    width: 60%;
                }
                .header > span > span {
                    text-align: right;
                    margin-left: 30px;
                    color: #FFF;
                }
                .header > span > span > p {
                    margin-bottom: 8px;
                }
                .billing {
                    padding: 50px 20px;
                    display: flex;
                    justify-content: space-between;
                }
                .billing > span {
                    display: flex;
                    justify-content: space-between;
                    width: 50%;
                }
                .billing > span:nth-child(1) {
                    width: 50%
                }
                
                .billing > span > span {
                    margin-right: 60px;
                }
                .billing > span > span > h4 {
                    color: #555;
                }
                .billing > span > span > h4 {
                    padding-bottom: 6px;
                }
                .billing > span > span > p {
                    padding-bottom: 3px;
                }
                .table {
                    display: flex;
                    flex-direction: column;
                }
                .table > .table-header {
                    background: #2F8BCB;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: #FFF;
                }
                .table > .table-header > p {
                    display: block;
                    width: 20%;
                    padding: 10px 8px;
                    box-sizing: border-box;
                    text-align: center;
                }
                .table > .table-rows > .row {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .table > .table-rows > .regular {
                    border-bottom: 1px solid #333
                }
                .table > .table-rows > .row > p {
                    display: block;
                    width: 20%;
                    padding: 10px 8px;
                    box-sizing: border-box;
                    text-align: center;
                }
                .table > .table-rows > .row.total > .total-cell { 
                    background: #2F8BCB;
                    color: #FFF;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>PRE INVOICE</h1>
                <span>
                    <span>
                        <p>${seller_phone}</p>
                        <p>${seller_email}</p>
                        <p>www.plastfix.com</p>
                    </span>
                    <span>
                        <p>${seller_address}</p>
                        <p>${seller_city_country}</p>
                        <p>${seller_post}</p>
                    </span>
                </span>
            </div>
            <div class="billing">
                <span>
                    <span>
                        <h4>Billed To</h4>
                        <p>${buyer_name}</p>
                        <p>${buyer_address}</p>
                        <p>${buyer_city_country}</p>
                        <p>${buyer_post}</p>
                    </span>
                    <span>
                        <h4>Invoice Number</h4>
                        <p>${invoice_number}</p>
                        <br />
                        <h4>Date of issue</h4>
                        <p>${date}</p>
                    </span>
                </span>
                <span>
                    <span></span>
                    <span>
                        <h4>Customer Contact Info</h4>
                        <p>${buyer_email}</p>
                        <p>${buyer_phone}</p>
                    </span>
                </span>
            </div>
            <div class="table">
                <span class="table-header">
                    <p><b>ITEM</b></p> <p><b>ITEM NUMBER</b></p> <p><b>QUANTITY</b></p> <p><b>PRICE</b></p> <p><b>TOTAL</b></p>
                </span>
                <span class="table-rows">
                    ${rows}
                    <span class="row total"> <p></p> <p></p> <p></p> <p class="total-cell">SUBTOTAL</p> <p class="total-cell">${subtotal}</p> </span>
                    <span class="row total"> <p></p> <p></p> <p></p> <p class="total-cell">SHIIPPING</p> <p class="total-cell">${shipping}</p> </span>
                    <span class="row total"> <p></p> <p></p> <p></p> <p class="total-cell">TAX</p> <p class="total-cell">${tax}</p> </span>
                    <span class="row total"> <p></p> <p></p> <p></p> <p class="total-cell">DISCOUNT</p> <p class="total-cell">${discount}</p> </span>
                    <span class="row total"> <p></p> <p></p> <p></p> <p class="total-cell">TOTAL</p> <p class="total-cell">${total}</p> </span>
                </span>
            </div>
        </body>
    </html>
"""



