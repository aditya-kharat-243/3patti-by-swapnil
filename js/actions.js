window.addMembers = members => ({
 type:"ADD_MEMBERS",
 payload:members
});

window.setRound = (member,data) => ({
 type:"SET_ROUND",
 payload:{member,data}
});

window.setWinner = winner => ({
 type:"SET_WINNER",
 payload:winner
});