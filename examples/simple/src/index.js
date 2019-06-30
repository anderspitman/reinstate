import { fromObject } from 'rein-state';
import h from 'hyperscript';


function SimpleComponent(state) {
  const elem = h('div.myclass');
  return elem;
}

function MyComponent(state) {

  const valElem = h('div.val', state.val.get());

  const dom = h('div.my-class',
    {
      onclick: () => {
        state.val.set(state.val.get() + 1);
      },
    },
    valElem,
    state.list.map((elemState, i) => {

      const listElem = ListElem(elemState);

      listElem.addEventListener('selected', () => {
        dom.dispatchEvent(new CustomEvent('elem-clicked', {
          bubbles: true,
          detail: {
            index: i,
          },
        }));
      });

      return listElem;
    }),
  );

  state.val.onUpdate((val) => {
    valElem.innerHTML = val;
  });

  return dom;
}


function ListElem(state) {

  const dom = h('div',
    state.value.get(),
  );

  dom.addEventListener('click', () => {
    dom.dispatchEvent(new Event('selected'));
  });

  return dom;
}


const state = fromObject({
  val: 5,
  s: "is texty",
  list: [
    { value: 1, selected: false },
    { value: 2, selected: true },
  ],
});

//console.log(JSON.stringify(state, null, 2));

const root = document.getElementById('root');
root.appendChild(MyComponent(state));

root.addEventListener('elem-clicked', (e) => {
  console.log("item clicked:", e.detail.index);
});

setTimeout(() => {
  state.val.set(20);
}, 3000);
