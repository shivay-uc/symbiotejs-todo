import { BaseComponent } from 'https://symbiotejs.github.io/symbiote.js/core/BaseComponent.js';
import { AppRouter } from 'https://symbiotejs.github.io/symbiote.js/core/AppRouter.js';

AppRouter.createRouterData('router', {
  all: {
    title: 'All',
    default: true,
  },
  active: {
    title: 'Active',
  },
  completed: {
    title: 'Completed',
  },
  error: {
    title: 'Error',
    error: true,
  },
});

class ListItem extends BaseComponent {
  constructor(text, idx) {
    super();
    this.data = text;
    this.idx = idx;
  }
  init$ = {
    text: '',
    fetchState: () => {
      let localState = localStorage.getItem('state');
      if (!localState) {
        localState = [];
      } else {
        localState = JSON.parse(localState);
      }

      return localState;
    },
    updateLocalState: (arr) => {
      localStorage.setItem('state', JSON.stringify(arr));
    },
    remove: () => {
      let currState = this.$.fetchState();

      currState.map(({ idx }) => {
        if (idx > this.$.idx) {
          idx -= 1;
        }
      });

      currState.splice(this.$.idx, 1);
      console.log(currState);

      this.$.updateLocalState(currState);

      const currLeft = document.getElementById('left-items');

      if (!this.ref.complete.classList.contains('completed')) {
        currLeft.innerText = parseInt(currLeft.innerText) - 1;
      }

      this.remove();
    },

    marked_check: () => {
      this.ref.complete.classList.toggle('completed');

      const currLeft = document.getElementById('left-items');

      const currState = this.$.fetchState();

      currLeft.innerText = this.ref.complete.classList.contains('completed')
        ? parseInt(currLeft.innerText) - 1
        : parseInt(currLeft.innerText) + 1;

      currState[this.$.idx].checked = this.ref.complete.classList.contains(
        'completed'
      )
        ? true
        : false;

      this.$.updateLocalState(currState);
    },
    idx: 0,
  };

  get checked() {
    return this.ref.checkbox.checked;
  }

  updateCounterState(delta) {
    const currLeft = document.getElementById('left-items');

    currLeft.innerText = parseInt(currLeft.innerText) + delta;
  }

  updateStateOnChange(delta) {
    const currState = this.$.fetchState();

    currState[this.$.idx].checked = delta;

    this.$.updateLocalState(currState);
  }
  removeWrapper() {
    this.$.remove();
  }

  make_check() {
    this.ref.complete.classList.add('completed');
    this.ref.checkbox.checked = true;

    this.updateCounterState(-1);
    this.updateStateOnChange(true);
  }
  remove_check() {
    this.ref.complete.classList.remove('completed');
    this.ref.checkbox.checked = false;

    this.updateCounterState(1);

    this.updateStateOnChange(false);
  }
  initCallback() {
    this.$.text = this.data;
    this.$.idx = this.idx;
  }
  show() {
    this.ref.complete.style.display = 'block';
  }
  hide() {
    this.ref.complete.style.display = 'none';
  }
}

ListItem.template = `
<li ref="complete">
      <div class="view">
        <input set="onclick : marked_check" ref="checkbox" type="checkbox" class="toggle"/>
        <label>{{text}}</label>
        <button class="destroy" set = "onclick: remove"></button>
    </div>
</li>
`;
ListItem.reg('list-item');

class MyComponent extends BaseComponent {
  get items() {
    return [...this.ref.list_wrapper.children];
  }
  init$ = {
    fetchState: () => {
      let localState = localStorage.getItem('state');
      if (!localState) {
        localState = [];
      } else {
        localState = JSON.parse(localState);
      }
      return localState;
    },
    createNote: (e) => {
      if (e.code == 'Enter' && e.target.value.length) {
        this.ref.list_wrapper.insertBefore(
          new ListItem(e.target.value, this.$.initIdx),
          this.ref.list_wrapper.firstChild
        );
        const currLeft = document.getElementById('left-items');

        currLeft.innerText = parseInt(currLeft.innerText) + 1;

        const currState = this.$.fetchState();

        currState.push({ text: e.target.value, checked: false });

        localStorage.setItem('state', JSON.stringify(currState));

        this.$.initIdx += 1;

        e.target.value = '';
      }
    },
    createNoteFromLocalStorage: (text, isActive) => {
      const listItem = new ListItem(text, this.$.initIdx);
      this.ref.list_wrapper.insertBefore(
        listItem,
        this.ref.list_wrapper.firstChild
      );
      if (isActive) {
        listItem.make_check();
      }
    },
    removeChecked: () => {
      this.items.forEach((item) => {
        if (item.checked) {
          item.removeWrapper();
        }
      });
    },
    completeAll: () => {
      if (this.ref.impact_all.getAttribute('data-checked') === 'active') {
        this.items.forEach((item) => {
          if (!item.checked) {
            item.make_check();
          }
        });
        this.ref.impact_all.setAttribute('data-checked', 'inactive');
      } else {
        this.items.forEach((item) => {
          if (item.checked) {
            item.remove_check();
          }
        });
        this.ref.impact_all.setAttribute('data-checked', 'active');
      }
    },
    onAll: () => {
      this.items.forEach((item) => {
        item.show();
      });
      AppRouter.applyRoute('all');
    },
    onActive: () => {
      AppRouter.applyRoute('active');
    },
    onComplete: () => {
      AppRouter.applyRoute('completed');
    },
    initIdx: 0,
  };

  initCallback() {
    let leftItems = 0;
    this.items.forEach((item) => {
      if (!item.checked) {
        leftItems++;
      }
    });

    document.getElementById('left-items').innerText = leftItems;

    const currState = this.$.fetchState();

    const currLeft = document.getElementById('left-items');
    let tempCount = 0;

    currState.map((item) => {
      this.$.createNoteFromLocalStorage(item.text, item.checked);
      this.$.initIdx++;

      if (!item.checked) {
        tempCount++;
      }
    });

    currLeft.innerText = tempCount;

    this.sub('router/options', (opt) => {
      if (opt.title === 'Active') {
        this.items.forEach((item) => {
          item.show();
        });
        this.items.forEach((item) => {
          if (item.checked) {
            item.hide();
          }
        });
      }
      if (opt.title === 'Completed') {
        this.items.forEach((item) => {
          item.show();
        });
        this.items.forEach((item) => {
          if (!item.checked) {
            item.hide();
          }
        });
      }
    });
  }
}

MyComponent.template = `
      <div class="todoapp">
        <header class="header">
          <h1>todos</h1>
          <input class="new-todo" id="new-todo-input" placeholder="What needs to be done?" set = "onkeypress: createNote" ></input>
        </header>
        <section class="main">
          <input
              id="toggle-all"
              class="toggle-all"
              type="checkbox"
              ref="impact_all"
              data-checked="active"
              set="onclick : completeAll"
            />
          <label
            for="toggle-all"
          >
            Mark all as complete
          </label>
          <ul ref="list_wrapper" class="todo-list" >
            </ul>
        </section>
        <footer class="footer">
            <span class="todo-count">
              <strong id="left-items">5</strong> items left
            </span>
            <ul class="filters">
              <li >
                <a set = "onclick : onAll" class="">All</a>
               </li>
              <li class="selected">
                <a set = "onclick : onActive" set="onclick: onActive" class="">Active</a>
              </li>
              <li class="selected" set="onclick: changeStatus('complete')">
                <a set = "onclick : onComplete" class="">Completed</a>
              </li>
            </ul>
            <button class="clear-completed" set="onclick: removeChecked">
                Clear completed
            </button>
        </footer>

      </div>

    `;
MyComponent.reg('my-component');
