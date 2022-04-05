import { BaseComponent } from "https://symbiotejs.github.io/symbiote.js/core/BaseComponent.js";
import { AppRouter } from "https://symbiotejs.github.io/symbiote.js/core/AppRouter.js";

AppRouter.createRouterData("router", {
  all: {
    title: "All",
    default: true,
  },
  active: {
    title: "Active",
  },
  completed: {
    title: "Completed",
  },
  error: {
    title: "Error",
    error: true,
  },
});

class ListItem extends BaseComponent {
  constructor(text) {
    super();
    this.data = text;
  }
  init$ = {
    text: "",
    remove: () => {
      this.remove();
    },
    marked_check: () => {
      this.ref.complete.classList.toggle("completed");

      const currLeft = document.getElementById("left-items");

      currLeft.innerText = this.ref.complete.classList.contains("completed")
        ? parseInt(currLeft.innerText) - 1
        : parseInt(currLeft.innerText) + 1;
    },
  };

  get checked() {
    return this.ref.checkbox.checked;
  }

  updateCounterState(delta) {
    const currLeft = document.getElementById("left-items");

    currLeft.innerText = parseInt(currLeft.innerText) + delta;
  }

  make_check() {
    this.ref.complete.classList.add("completed");
    this.ref.checkbox.checked = true;

    this.updateCounterState(-1);
  }
  remove_check() {
    this.ref.complete.classList.remove("completed");
    this.ref.checkbox.checked = false;

    this.updateCounterState(1);
  }
  initCallback() {
    this.$.text = this.data;
  }
  show() {
    this.ref.complete.style.display = "block";
  }
  hide() {
    this.ref.complete.style.display = "none";
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
ListItem.reg("list-item");

class MyComponent extends BaseComponent {
  get items() {
    return [...this.ref.list_wrapper.children];
  }
  init$ = {
    createNote: (e) => {
      if (e.code == "Enter" && e.target.value.length) {
        this.ref.list_wrapper.insertBefore(
          new ListItem(e.target.value),
          this.ref.list_wrapper.firstChild
        );
        e.target.value = "";

        const currLeft = document.getElementById("left-items");

        currLeft.innerText = parseInt(currLeft.innerText) + 1;
      }
    },
    removeChecked: () => {
      this.items.forEach((item) => {
        if (item.checked) {
          item.remove();
        }
      });
    },
    completeAll: () => {
      if (this.ref.impact_all.getAttribute("data-checked") === "active") {
        this.items.forEach((item) => {
          if (!item.checked) {
            item.make_check();
          }
        });
        this.ref.impact_all.setAttribute("data-checked", "inactive");
      } else {
        this.items.forEach((item) => {
          if (item.checked) {
            item.remove_check();
          }
        });
        this.ref.impact_all.setAttribute("data-checked", "active");
      }
    },
    onAll: () => {
      this.items.forEach((item) => {
        item.show();
      });
      AppRouter.applyRoute("all");
    },
    onActive: () => {
      this.items.forEach((item) => {
        item.show();
      });
      this.items.forEach((item) => {
        if (item.checked) {
          item.hide();
        }
      });
      AppRouter.applyRoute("active");
    },
    onComplete: () => {
      this.items.forEach((item) => {
        item.show();
      });
      this.items.forEach((item) => {
        if (!item.checked) {
          item.hide();
        }
      });
      AppRouter.applyRoute("completed");
    },
  };

  initCallback() {
    let leftItems = 0;
    this.items.forEach((item) => {
      if (!item.checked) {
        leftItems++;
      }
    });

    document.getElementById("left-items").innerText = leftItems;
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
MyComponent.reg("my-component");
