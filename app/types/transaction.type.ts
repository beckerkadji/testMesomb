import { defaultPhone } from "./defaults/phone.type"

namespace TransactionType {

    export interface payment {
        amount: number,
        phone: defaultPhone
    }

    export interface deposit {
        amount: number,
        phone: defaultPhone
    }
}

export default TransactionType