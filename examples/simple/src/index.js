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
        state.emit('selected');
      },
    },
    valElem,
    state.list.map((elemState, i) => {
      elemState.onEmit('selected', () => {
        state.emit('elem-clicked', i);
      });

      return ListElem(elemState);
    }),
  );

  state.val.onUpdate((val) => {
    valElem.innerHTML = val;
  });

  //state.onEmit('event', (e) => {
  //  console.log("child speaketh", e.payload);
  //  e.stop();
  //});

  return dom;
}


function ListElem(state) {

  const dom = h('div',
    {
      onclick: () => {
        state.emit('selected');
      },
    },
    state.value.get(),
  );

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
//root.appendChild(SimpleComponent(state));
root.appendChild(MyComponent(state));

state.onEmit('elem-clicked', (i) => {
  console.log("item clicked:", i);
});

setTimeout(() => {
  state.val.set(20);
}, 3000);

//state.val.onChange((value) => {
//  console.log("it changed:", value);
//});
//
//state.val.onEmit('ev1', (value, value2) => {
//  console.log("it emitted:", value, value2);
//});
//
//console.log("emit ev2");
//state.val.emit('ev2', "Hi there");
//
//console.log("emit ev1");
//state.val.emit('ev1', "low here", "ya fuzzy");
//
//console.log(state.val.get());
//state.val.set(10);
//console.log(state.val.get());
//
//console.log(state);
