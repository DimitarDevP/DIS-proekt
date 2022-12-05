import {
    SET_TABLE_FILTER,
    SET_VIEW_FILTER,
    SET_PAGE_FILTER,
    GENERATE_FILTERS,
} from "../constants"

const filters = {
    
}


export default (state = filters, action) => {

    const newState = { ...state }

    switch (action.type) {
        case SET_TABLE_FILTER:
            return {
                ...newState,
                [action.payload.route] : {
                    ...newState[action.payload.route],
                    TableFilters: action.payload.filters,
                }
            }
        case SET_VIEW_FILTER:
            const cleared_filters = {}
            for (const f in newState[action.payload.route].TableFilters) {
                cleared_filters[f] = ""
            }

            return {
                ...newState,
                [action.payload.route] : {
                    ...newState[action.payload.route],
                    ViewFilters: {
                        ...newState[action.payload.route].ViewFilters,
                        [action.payload.filter.name]: action.payload.filter.value
                    },
                    PageFilters: {
                        default: 1
                    },
                    TableFilters: cleared_filters
                }
            }
        case SET_PAGE_FILTER:
            return {
                ...newState,
                [action.payload.route] : {
                    ...newState[action.payload.route],
                    PageFilters: {
                        ...newState[action.payload.route].PageFilters,
                        [action.payload.filter.name] : action.payload.filter.value
                    }
                }
            }
        case GENERATE_FILTERS:
            return {
                ...newState,
                [action.payload.route]: {
                    ...newState[action.payload.route],
                    TableFilters: action.payload.TableFilters,
                    PageFilters: {default: 1},
                    shoudlAscend: action.payload.asc,
                    index: action.payload.index,
                    props: action.payload.props
                },
                updated: true
            }
        case "SET_INDEX_FILTER":
            return {
                ...newState,
                [action.payload.route] : {
                    ...newState[action.payload.route],
                    index: action.payload.index
                }
            }
        case "SET_ASCEND_FILTER":
            return {
                ...newState,
                [action.payload.route] : {
                    ...newState[action.payload.route],
                    shoudlAscend: action.payload.ascend
                }
            }
        case "CLEAR_ALL_FILTERS":
            return filters
        default:
            return {...state}
    }
}


// def send_validation_mail(credentials, receiver_mail, subject, msg_body, variables): 
//     # credentials = { "email": email, "password": password }
//     # receiver_mail = Receiver's mail
//     # subject = Message subject
//     # msg_body = Message body, with variables
//     # variables = Replaces for the variables (dictionary, keys & values)

//     for k, v in variables.items():
//         msg_body = msg_body.replace(("$(_" + k + ")"), v)

//     try:
//         msg = MIMEMultipart('alternative')
//         msg['Subject'] = subject
//         msg['From'] = credentials["email"]
//         msg['To'] = receiver_mail
//         msg.attach(MIMEText(msg_body, 'html'))
//         server = smtplib.SMTP("smtp.office365.com", 587)
//         server.starttls()
//         server.login(credentials["email"], credentials["password"])
//         server.sendmail(credentials["email"], receiver_mail, msg.as_string())
//         server.quit()
//         return True
//     except:
//         return False