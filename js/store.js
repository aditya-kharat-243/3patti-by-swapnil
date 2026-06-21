const saved = localStorage.getItem("pattiStore");

const preloadedState =
saved ? JSON.parse(saved) : undefined;

window.store = Redux.createStore(
 gameReducer,
 preloadedState
);