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

let html = `<table class="table table-bordered"><tr>`;

state.members.forEach(m => { html += `<th>${m}</th>`; });

html += `</tr><tr>`;

state.members.forEach(member => {
    // create an empty cell; we'll populate DOM nodes after inserting html
    html += `<td data-member="${member}"></td>`;
});

html += `</tr></table>`;

html += `
<select id="winnerSelect" class="form-select mb-3">
<option value="">Select Winner</option>
`;

state.members.forEach(m => { html += `<option value="${m}">${m}</option>`; });

html += `</select>`;

html += `
<button class="btn btn-sm btn-outline-primary mb-3" id="addRoundBid">Add New Bid (All)</button>
`;

html += `
<button class="btn btn-primary me-2" id="completeRound">Complete</button>
<button class="btn btn-secondary me-2" id="resetRound">Reset Round</button>
<button class="btn btn-danger" id="restartGame">Restart Game</button>
`;

gameContainer.innerHTML = html;

// populate each member cell: show saved bids and one input row by default
const addRowFns = {};

state.members.forEach(member => {
    const td = gameContainer.querySelector(`td[data-member="${member}"]`);

    // saved bids (if any)
    const saved = state.roundData[member] || [];
    saved.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'mb-2 saved-row';
        div.innerHTML = `<div class="form-control-plaintext">${entry.action} ₹${entry.amount}</div>`;
        td.appendChild(div);
    });

    // container for dynamic unsaved bid rows
    const unsavedContainer = document.createElement('div');
    unsavedContainer.className = 'unsaved-container';
    td.appendChild(unsavedContainer);

    // helper to add a new bid row inside this td
    function addBidRow(){
        const div = document.createElement('div');
        div.className = 'mb-2 bid-row d-flex gap-2 align-items-start';
        div.innerHTML = `
            <input type="number" class="form-control mb-0 amount" data-member="${member}" placeholder="Amount">
            <button class="btn btn-sm btn-outline-danger remove-row">Remove</button>
        `;

        const input = div.querySelector('.amount');
        const removeBtn = div.querySelector('.remove-row');

        removeBtn.onclick = () => div.remove();

        unsavedContainer.appendChild(div);
        input.focus();
    }

    // add initial bid row
    addBidRow();

    // expose function to add a bid row for this member (used by global Add New Bid)
    addRowFns[member] = addBidRow;

    // Add New Bid button
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-sm btn-outline-secondary mt-2 add-bid-btn';
    addBtn.innerText = 'Add New Bid';
    addBtn.onclick = addBidRow;
    td.appendChild(addBtn);
});

bindEvents();

// wire global Add New Bid (All) button
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
        const memberTd = container.closest('td[data-member]');
        const member = memberTd ? memberTd.getAttribute('data-member') : null;
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