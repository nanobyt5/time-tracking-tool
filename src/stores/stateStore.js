import { extendObservable, configure } from 'mobx';

class StateStore {
    constructor() {
        configure({
            enforceActions: "never"
        })
        extendObservable(this, {
            jsonFiles: [],
            checkboxState: []
        })
    }
}

export default new StateStore();
