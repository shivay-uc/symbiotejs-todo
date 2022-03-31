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

class MyComponent extends BaseComponent {
  init$ = {
    notes: localStorage.getItem('todos-symbiote')
      ? JSON.parse(localStorage.getItem('todos-symbiote'))
      : [],
    stateToShow: '',
    changeStateToShow: (id) => {
      console.log('hi');
      this.$.notes.map((note, idx) => {
        if (note.id === id) {
          const currStatus = this.$.notes[e.target.id].status;
          this.$.notes[idx].status =
            currStatus == 'complete' ? 'active' : 'complete';
          document.getElementById(id).classList.toggle('complete');
        }
      });
      this.$.updateState();
    },
    itemsLeft: 0,
    onAll: () => {
      AppRouter.applyRoute('all');
    },
    onActive: () => {
      AppRouter.applyRoute('active');
    },
    onComplete: () => {
      AppRouter.applyRoute('completed');
    },
    createNote: (e) => {
      if (e.code == 'Enter' && e.target.value.length) {
        this.$.notes.push({
          id: this.$.uuid(),
          note: e.target.value,
          status: 'active',
        });
        e.target.value = '';
      }
      this.$.updateState();
    },

    deleteNote: (id) => {
      this.$.notes = this.$.notes.filter((note, id) => id !== index);
      this.$.updateState();
    },
    listHtml: '',
    clearCompleted: () => {
      this.$.notes = this.$.notes.filter((note) => note.status !== 'complete');
      this.$.updateState();
    },
    uuid: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
          var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    },
    changeStatus: (status) => {
      this.$.stateToShow = status;
      this.$.updateState();
    },

    completeAll: () => {
      this.$.notes.map((note) => {
        note.status = note.status === 'active' ? 'complete' : 'active';

        document.getElementById(note.id).classList.toggle('complete');
      });
      this.$.updateState();
    },
    updateState: () => {
      this.sub('router/options', (opt) => {
        const option = opt.title;
        let leftTasksCounter = 0;
        this.$.listHtml = this.$.notes.reduce((html, item) => {
          if (item.status == 'active') {
            leftTasksCounter++;
          }
          if (!this.$.stateToShow || this.$.stateToShow === item.status) {
            const HTML = `<li id=${item.id} class=${
              item.status === 'complete' ? 'completed' : ''
            }>
                  <div class="view">
    
                 <input type="checkbox" ${
                   item.status === 'complete' ? 'checked' : ''
                 } class="toggle" set = "onclick: changeStateToShow"/>
    
            <label>${item.note}</label>
            <button class="destroy" set = "onclick: deleteNote(${
              item.id
            })"></button>
              </div>
            </li>`;
            if (option === 'Active' && item.status === 'active') {
              return (html += HTML);
            }
            if (option === 'Completed' && item.status === 'complete') {
              return (html += HTML);
            }
            if (option === 'All') {
              return (html += HTML);
            }

            return (html += '');
          }
        }, '');

        this.$.itemsLeft = leftTasksCounter;

        localStorage.setItem('todos-symbiote', JSON.stringify(this.$.notes));
      });
    },
  };

  initCallback() {
    this.$.updateState();
  }
}

MyComponent.template += `
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
              set="onclick : completeAll"
            />
          <label
            for="toggle-all"
          >
            Mark all as complete
          </label>
          <ul class="todo-list" set="innerHTML: listHtml">
            </ul>
        </section>
        <footer class="footer">
            <span class="todo-count">
              <strong>{{itemsLeft}}</strong> items left
            </span>
            <ul class="filters">
              <li >
                <a set = "onclick : onAll" class="">All</a>
               </li>
              <li class="selected">
                <a set = "onclick : onActive" set="onclick: onActive" class="">Active</a>
              </li>
              <li class="selected" set="onclick: changeStatus('complete')">
                <a set = "onclick : onComplete;style.cursor : pointer" class="">Completed</a>
              </li>
            </ul>
            <button class="clear-completed" set="onclick: clearCompleted">
                Clear completed
            </button>
        </footer>

      </div>

    `;
MyComponent.reg('my-component');
