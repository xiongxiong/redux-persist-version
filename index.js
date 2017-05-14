import {REHYDRATE} from 'redux-persist/constants';

export default function createMigration(manifest, versionKey) {
    versionSelector = (state) => state[versionKey] && state[versionKey].version;
    versionSetter = (state, versionInfo) => {
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
        console.log("=====>>>>> old version -- " + version);
        console.log(state);
        const versions = manifest.migrations.map((elem) => elem.version);
        const incomingIndex = versions.indexOf(version);
        manifest.migrations.filter((elem, index) => index > incomingIndex).forEach((elem) => {
            console.log("---> state before: ");
            console.log(state);
            state = manifest.migrate(state, elem.version);
            state = versionSetter(state, elem);
            console.log("---> state after: ");
            console.log(state);
            console.log("===>>> migration success: " + elem.version);
        })
        console.log("=====>>>>> new version -- " + versionSelector(state));
        console.log(state);
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
