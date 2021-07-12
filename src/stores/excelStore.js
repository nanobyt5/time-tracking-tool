import { extendObservable } from 'mobx';

class ExcelStore {
    constructor() {
        extendObservable(this, {
            excelFiles: []
        })

        // configure({
        //     enforceActions: "never"
        // })
    }
}

export default new ExcelStore();
