store.subscribe(()=>{

localStorage.setItem(
"pattiStore",
JSON.stringify(store.getState())
);

});