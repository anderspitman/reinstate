import { fromObject } from 'rein-state';
import h from 'hyperscript';


function Main(state) {

  const valElem = h('h1.val', state.val.get());

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
    state.values.map((elemState) => {
      return createElem(elemState);
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
    textInput,
    listElems,
    AppendButton(state),
  );

  state.values.onPush((elemState, index) => {
    listElems.appendChild(createElem(elemState));
  });

  state.values.onInsert((elemState, index) => {
    console.log(listElems.childNodes);
    listElems.insertBefore(createElem(elemState), listElems.childNodes[index + 1]);
  });

  let selectedElem = null;

  function createElem(elemState) {
    const listElem = ListElem(elemState);

    listElem.addEventListener('selected', (e) => {

      const index = Array.prototype.indexOf.call(listElems.children, e.target.parentNode);

      console.log("item selected:", index);

      if (selectedElem !== null) {
        selectedElem.classList.remove('list__element--selected');
      }

      selectedElem = listElem;
      listElem.classList.add('list__element--selected');

      dom.dispatchEvent(new Event('elem-clicked'));
    });

    listElem.addEventListener('insert-after', (e) => {
      const index = Array.prototype.indexOf.call(listElems.children, e.target.parentNode);
      console.log("insert after", index);
      state.values.insert(index, { value: state.text.get(), selected: false });
    });

    return h('.list__element',
      listElem,
    );
  }

  return dom;
}


function ListElem(state) {

  const dom = h('.list-element',
    state.value.get(),
    h('button.list-element__insert-after-btn',
      {
        onclick: (e) => {
          e.stopPropagation();
          dom.dispatchEvent(new Event('insert-after'));
        },
      },
      "Insert After",
    )
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
