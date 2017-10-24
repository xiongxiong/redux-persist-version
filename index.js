import {REHYDRATE} from 'redux-persist/constants';

export default function createMigration(manifest, versionKey, options) {
    const {log: isLog = false} = options;
    const log = isLog ? (s) => console.log(s) : (s) => null;
    const versionSelector = (state) => state[versionKey] && state[versionKey].version;
    const versionSetter = (state, versionInfo) => {
        return {
            ...state,
            [versionKey]: {...versionInfo}
        }
    };

    const migrationDispatch = (next) => (action) => {
        if (action.type === REHYDRATE) {
            const incomingState = action.payload;
            const incomingVersion = versionSelector(incomingState);
            const migratedState = migrate(incomingState, incomingVersion);
            action.payload = migratedState;
        }
        return next(action);
    };

    const migrate = (state, version) => {
        log("=====>>>>> old version -- " + version);
        log(state);
        const versions = manifest.migrations.map((elem) => elem.version);
        const incomingIndex = versions.indexOf(version);
        manifest.migrations.filter((elem, index) => index > incomingIndex).forEach((elem) => {
            log("---> state before: ");
            log(state);
            state = manifest.migrate(state, elem.version);
            state = versionSetter(state, elem);
            log("---> state after: ");
            log(state);
            log("===>>> migration success: " + elem.version);
        })
        log("=====>>>>> new version -- " + versionSelector(state));
        log(state);
        return state;
    };

    return (next) => (reducer, initialState, enhancer) => {
        const store = next(reducer, initialState, enhancer);
        return {
            ...store,
            dispatch: migrationDispatch(store.dispatch)
        };
    }
};
