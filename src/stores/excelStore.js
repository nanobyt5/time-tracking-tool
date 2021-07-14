import { extendObservable, configure } from 'mobx';

class ExcelStore {
    constructor() {
        configure({
            enforceActions: "never"
        })
        extendObservable(this, {
            excelFiles: []
        })
    }
}

export default new ExcelStore();
