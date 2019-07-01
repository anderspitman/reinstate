import { fromObject } from 'rein-state';
import h from 'hyperscript';


function Main(state) {

  const valElem = h('div.val', state.val.get());

  const dom = h('.main',
    {
      onclick: () => {
        state.val.set(state.val.get() + 1);
      },
    },
    valElem,
    List(state.list), 
  );

  state.val.onUpdate((val) => {
    valElem.innerHTML = val;
  });

  return dom;
}


function List(state) {

  const listElems = h('.list-elements',
    state.values.map((elemState, i) => {
      return h('.list__element',
        createElem(elemState, i),
      );
    })
  );

  state.text.set("Default value");

  const textInput = h('input.list__text-input',
    {
      type: 'text',
      value: "Default value",
      onkeyup: (e) => {
        state.text.set(e.target.value);
      },
    }
  );

  const dom = h('.list',
    listElems,
    textInput,
    AppendButton(state),
  );

  state.values.onPush((elemState, index) => {
    listElems.appendChild(h('.list__element',
      createElem(elemState, index),
    ));
  });

  let selectedElem = null;

  function createElem(elemState, index) {
    const listElem = ListElem(elemState);

    listElem.addEventListener('selected', () => {

      if (selectedElem !== null) {
        selectedElem.classList.remove('list__element--selected');
      }

      selectedElem = listElem;
      listElem.classList.add('list__element--selected');

      dom.dispatchEvent(new CustomEvent('elem-clicked', {
        bubbles: true,
        detail: {
          index,
        },
      }));
    });

    return listElem;
  }

  return dom;
}


function ListElem(state) {

  const dom = h('.list-element',
    state.value.get(),
  );

  dom.addEventListener('click', () => {
    dom.dispatchEvent(new Event('selected'));
  });

  return dom;
}

function AppendButton(state) {
  return h('button', 
    {
      onclick: () => {
        state.values.push({ value: state.text.get(), selected: false });
      },
    },
    "Append"
  );
};


const state = fromObject({
  val: 5,
  s: "is texty",
  list: {
    text: null,
    values: [
      { value: 1, selected: false },
      { value: 2, selected: true },
    ]
  },
});

//console.log(JSON.stringify(state, null, 2));

const root = document.getElementById('root');
root.appendChild(Main(state));

root.addEventListener('elem-clicked', (e) => {
  console.log("item clicked:", e.detail.index);
});

setTimeout(() => {
  state.val.set(20);
}, 3000);
