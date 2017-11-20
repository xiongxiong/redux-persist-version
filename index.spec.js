import {initialState, migration, store} from './test/state';
//import {fromJS} from 'immutable'
import {REHYDRATE} from 'redux-persist/constants';



const thunk = ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action(dispatch, getState)
  }

  return next(action)
}

const create = () => {
  const next = jest.fn()

  const invoke = (action) => thunk(store)(next)(action)
  store.dispatch = jest.fn(store.dispatch)
  store.getState = jest.fn(store.getState)

  return {store, next, invoke}
};

it(`passes through non-function action`, () => {
  const { next, invoke } = create()
  const action = {type: 'TEST'}
  invoke(action)
  expect(next).toHaveBeenCalledWith(action)
})

it('calls the function', () => {
  const { invoke } = create()
  const fn = jest.fn()
  invoke(fn)
  expect(fn).toHaveBeenCalled()
});

const savedState0 = {
    todos: [{title: 'implement priority for next version of todo app'}]
}
it('updates unversioned to 0.1.0', () => {
  const { store, invoke } = create()
  const action = {type:REHYDRATE, payload: savedState0}
  let newState = {}
  invoke((dispatch, getState) => {
    dispatch(action)
    newState = getState();
  })
  expect(store.dispatch).toHaveBeenCalledWith(action)
  expect(store.getState).toHaveBeenCalled()

  // console.log('newState ' + JSON.stringify(newState.payload))
  expect(newState.payload.app.version).toEqual('0.1.0')
  expect(newState.payload.todos[0].priority == 'high')
  expect(newState.payload.todos[0].complete == false)
});

const savedState1 = {
    app: {
      version: "0.0.1",
    },
    todos: [{title: 'implement priority for next version of todo app', complete: true}]
}
it('updates 0.0.1 to 0.1.0', () => {
  const { store, invoke } = create()
  const action = {type:REHYDRATE, payload: savedState1}
  let newState = {}
  invoke((dispatch, getState) => {
    dispatch(action)
    newState = getState();
  })
  expect(store.dispatch).toHaveBeenCalledWith(action)
  expect(store.getState).toHaveBeenCalled()

  // console.log('newState ' + JSON.stringify(newState.payload))
  expect(newState.payload.app.version).toEqual('0.1.0')
  expect(newState.payload.todos[0].priority == 'high')
  expect(newState.payload.todos[0].complete == true)
});
