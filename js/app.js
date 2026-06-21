const modal =
new bootstrap.Modal(
document.getElementById("memberModal")
);

const memberInputs =
document.getElementById("memberInputs");

const balanceContainer = document.getElementById("balanceContainer");
const gameContainer = document.getElementById("gameContainer");

function createMemberInput(){

const div=document.createElement("div");

div.className="mb-2";

div.innerHTML=
`<input class="form-control member-name"
placeholder="Member Name">`;

memberInputs.appendChild(div);
}

createMemberInput();
createMemberInput();

document
.getElementById("openMemberModal")
.onclick=()=>modal.show();

document
.getElementById("addMoreMember")
.onclick=createMemberInput;

document
.getElementById("saveMembers")
.onclick=()=>{

const names=[
...document.querySelectorAll(".member-name")
]
.map(x=>x.value.trim())
.filter(Boolean);

if(names.length<2){
 alert("Minimum 2 members required");
 return;
}

store.dispatch(addMembers(names));

modal.hide();

render();
};

document
.getElementById("clearData")
.onclick=()=>{

if(confirm("Clear all data?")){
 store.dispatch({
  type:"CLEAR_DATA"
 });
 render();
}
};

function render(){

const state=store.getState();

renderBalances(state);

renderTable(state);
}

function renderBalances(state){

let html='<div class="row mb-4">';

state.members.forEach(member=>{

let bal=state.balances[member]||0;

html+=`
<div class="col-md-3 mb-2">
<div class="balance-card
${member===state.winner?'winner-card':''}">

<h5>${member}</h5>

<div class="${bal>=0?'positive':'negative'}">

${bal>=0?'+':'-'}
₹${Math.abs(bal)}

</div>
</div>
</div>
`;
});

html+='</div>';

balanceContainer.innerHTML=html;
}

function renderTable(state){

if(!state.members.length){
 gameContainer.innerHTML='';
 return;
}

let html = `<div class="row g-3 mb-3">`;

state.members.forEach(member => {
    html += `
      <div class="col-12">
        <div class="member-card" data-member="${member}">
          <div class="card-header">
            <h5>${member}</h5>
            <span class="badge bg-secondary">${state.balances[member] >= 0 ? '+' : '-'}₹${Math.abs(state.balances[member] || 0)}</span>
          </div>
          <div class="saved-list"></div>
          <div class="unsaved-container"></div>
          <button class="btn btn-sm btn-outline-secondary add-bid-btn">Add New Bid</button>
        </div>
      </div>
    `;
});

html += `</div>`;

html += `
<div class="mb-3">
  <select id="winnerSelect" class="form-select mb-3">
    <option value="">Select Winner</option>
`;

state.members.forEach(m => { html += `<option value="${m}">${m}</option>`; });

html += `
  </select>
  <button class="btn btn-sm btn-outline-primary w-100 mb-2" id="addRoundBid">Add New Bid (All)</button>
</div>
`;

html += `
<div class="d-flex flex-column flex-sm-row gap-2">
  <button class="btn btn-primary flex-fill" id="completeRound">Complete</button>
  <button class="btn btn-secondary flex-fill" id="resetRound">Reset Round</button>
  <button class="btn btn-danger flex-fill" id="restartGame">Restart Game</button>
</div>
`;

gameContainer.innerHTML = html;

const addRowFns = {};

state.members.forEach(member => {
    const card = gameContainer.querySelector(`.member-card[data-member="${member}"]`);
    const savedList = card.querySelector('.saved-list');
    const unsavedContainer = card.querySelector('.unsaved-container');

    const saved = state.roundData[member] || [];
    saved.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'saved-row';
        div.innerHTML = `
          <span>${entry.action}</span>
          <strong>₹${entry.amount}</strong>
        `;
        savedList.appendChild(div);
    });

    function addBidRow(){
        const div = document.createElement('div');
        div.className = 'bid-row';
        div.innerHTML = `
          <input type="number" class="form-control amount" data-member="${member}" placeholder="Amount">
          <button class="btn btn-sm btn-outline-danger remove-row">Remove</button>
        `;

        const input = div.querySelector('.amount');
        const removeBtn = div.querySelector('.remove-row');

        removeBtn.onclick = () => div.remove();

        unsavedContainer.appendChild(div);
        input.focus();
    }

    addBidRow();
    addRowFns[member] = addBidRow;

    const addBtn = card.querySelector('.add-bid-btn');
    addBtn.onclick = addBidRow;
});

bindEvents();

const addRoundBidBtn = document.getElementById('addRoundBid');
if(addRoundBidBtn){
    addRoundBidBtn.onclick = () => {
        Object.keys(addRowFns).forEach(m => { addRowFns[m](); });
    };
}
}

function bindEvents(){

// winner select change
const winnerSelect = document.getElementById('winnerSelect');
if(winnerSelect){
    winnerSelect.onchange = e => { store.dispatch(setWinner(e.target.value)); };
    // keep current selection if any
    const state = store.getState();
    if(state.winner) winnerSelect.value = state.winner;
}

// round controls
document.getElementById("completeRound").onclick = () => {
    const state = store.getState();
    if(!state.winner){ alert("Select winner"); return; }

    // collect all unsaved bid rows and dispatch SET_ROUND for each
    document.querySelectorAll('.unsaved-container').forEach(container => {
        const memberCard = container.closest('.member-card[data-member]');
        const member = memberCard ? memberCard.getAttribute('data-member') : null;
        if(!member) return;

        container.querySelectorAll('.bid-row').forEach(row => {
            const input = row.querySelector('.amount');
            if(!input) return;
            const val = input.value;
            if(val === '' || isNaN(Number(val)) || Number(val) < 0) return;

            store.dispatch(setRound(member, { amount: Number(val), action: 'Show' }));
        });
    });

    // now complete the round using reducer logic
    store.dispatch({ type: "COMPLETE_ROUND" });
    alert("Round Completed");
    render();
};

document.getElementById("resetRound").onclick = () => { store.dispatch({ type: "RESET_ROUND" }); render(); };

document.getElementById("restartGame").onclick = () => { store.dispatch({ type: "CLEAR_DATA" }); render(); };
}



render();