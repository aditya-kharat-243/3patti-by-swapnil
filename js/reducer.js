const initialState = {
 members: [],
 balances: {},
 roundData: {}, // now stores arrays per member: { member: [{amount,action}, ...] }
 winner: null
};

window.gameReducer = function(state = initialState, action){
switch(action.type){

case "ADD_MEMBERS":

const balances = {};

action.payload.forEach(name=>{
 balances[name] = state.balances[name] || 0;
});

return {
 ...state,
 members: action.payload,
 balances
};

case "SET_ROUND":
 return {
    ...state,
    roundData: {
        ...state.roundData,
        [action.payload.member]: [
            ...(state.roundData[action.payload.member] || []),
            action.payload.data
        ]
    }
 };

case "SET_WINNER":
 return {
  ...state,
  winner: action.payload
 };

case "COMPLETE_ROUND":

let updatedBalances = { ...state.balances };

let total = 0;

Object.keys(state.roundData).forEach(member => {
    const entries = state.roundData[member] || [];
    entries.forEach(entry => {
        const amount = Number(entry.amount || 0);
        if(member !== state.winner){
            updatedBalances[member] = (updatedBalances[member] || 0) - amount;
            total += amount;
        }
    });
});

updatedBalances[state.winner] = (updatedBalances[state.winner] || 0) + total;

return {
    ...state,
    balances: updatedBalances,
    roundData: {},
    winner: null
};

case "RESET_ROUND":

return{
 ...state,
 roundData:{},
 winner:null
};

case "CLEAR_DATA":
 return initialState;

default:
 return state;
}

}