import createMigration from '../index.js'
import {compose, applyMiddleware, createStore} from 'redux';
import {autoRehydrate} from 'redux-persist';
import logger from 'redux-logger';

export const initialState = {}

const manifest = {
    migrate: (state, version) => updateState(state, version),
    migrations: [
      { version: "0.0.1" },
      { version: "0.0.2" },
      { version: "0.1.0" },
    ]
};

function updateState(state, version) {
    const newState = Object.assign({}, state)

    switch (version) {
      case '0.0.1':
        newState.todos = state.todos.map((i) => Object.assign({}, i, {complete: false}))
        return newState
      case '0.0.2':
        newState.todos = state.todos.map((i) => Object.assign({}, i, {assigned: 'me'}))
        return newState
      case '0.1.0':
        newState.todos = state.todos.map((i) => Object.assign({}, i, {priority: 'high'}))
        return newState
      default:
          return state;
    }
}

function todosReducer(action,state) {return state}

export const migration = createMigration(manifest, "app", {'log': true});
const enhancer = compose(applyMiddleware(logger), migration, autoRehydrate({log:true}));

export const store = createStore(todosReducer, initialState, enhancer);
