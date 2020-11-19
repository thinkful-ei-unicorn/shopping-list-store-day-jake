'use strict';

const store = {
  items: [
    { id: cuid(), name: 'apples', checked: false, editing: false },
    { id: cuid(), name: 'oranges', checked: false, editing: false },
    { id: cuid(), name: 'milk', checked: true, editing: false },
    { id: cuid(), name: 'bread', checked: false, editing: false },
  ],
  hideCheckedItems: false,
};

const generateItemElement = function (item) {
  let itemTitle = `<span class='shopping-item shopping-item__checked'>${item.name}</span>`;
  if (!item.checked) {
    itemTitle = `
     <span class='shopping-item'>${item.name}</span>
    `;
  }

  if (item.editing) {
    console.log('editing true');
    return `
    <li class='js-item-element' data-item-id='${item.id}'>
      ${itemTitle}
      <div class='shopping-item-controls'>
        <button class='shopping-item-toggle js-item-toggle'>
          <span class='button-label'>check</span>
        </button>
        <button class='shopping-item-delete js-item-delete'>
          <span class='button-label'>delete</span>
        </button>
        </button>
        <button class='shopping-item-edit js-item-edit'>
          <span class='button-label'>Edit Item Name</span>
        </button>
        <div class='item-edit-section'>
          <input type="text" name="shopping-list-edit-item" class="js-shopping-list-new-item-name" value="${item.name}">
          <button class='js-item-edit-submit'>Edit</button>
        </div>
      </div>
    </li>`;
  }

  return `
    <li class='js-item-element' data-item-id='${item.id}'>
      ${itemTitle}
      <div class='shopping-item-controls'>
        <button class='shopping-item-toggle js-item-toggle'>
          <span class='button-label'>check</span>
        </button>
        <button class='shopping-item-delete js-item-delete'>
          <span class='button-label'>delete</span>
        </button>
        </button>
        <button class='shopping-item-edit js-item-edit'>
          <span class='button-label'>Edit Item Name</span>
        </button>
    </li>`;
};

const generateShoppingItemsString = function (shoppingList) {
  const items = shoppingList.map((item) => generateItemElement(item));
  return items.join('');
};

/**
 * Render the shopping list in the DOM
 */
const render = function () {
  // Set up a copy of the store's items in a local
  // variable 'items' that we will reassign to a new
  // version if any filtering of the list occurs.
  let items = [...store.items];
  // If the `hideCheckedItems` property is true,
  // then we want to reassign filteredItems to a
  // version where ONLY items with a "checked"
  // property of false are included.
  if (store.hideCheckedItems) {
    items = items.filter((item) => !item.checked);
  }

  /**
   * At this point, all filtering work has been
   * done (or not done, if that's the current settings),
   * so we send our 'items' into our HTML generation function
   */
  const shoppingListItemsString = generateShoppingItemsString(items);

  // insert that HTML into the DOM
  $('.js-shopping-list').html(shoppingListItemsString);
};

const addItemToShoppingList = function (itemName) {
  store.items.push({
    id: cuid(),
    name: itemName,
    checked: false,
    editing: false,
  });
};

const handleNewItemSubmit = function () {
  $('#js-shopping-list-form').submit(function (event) {
    event.preventDefault();
    const newItemName = $('.js-shopping-list-entry').val();
    $('.js-shopping-list-entry').val('');
    addItemToShoppingList(newItemName);
    render();
  });
};

const toggleCheckedForListItem = function (id) {
  const foundItem = store.items.find((item) => item.id === id);
  foundItem.checked = !foundItem.checked;
};

const handleItemCheckClicked = function () {
  $('.js-shopping-list').on('click', '.js-item-toggle', (event) => {
    const id = getItemIdFromElement(event.currentTarget);
    toggleCheckedForListItem(id);
    render();
  });
};

const getItemIdFromElement = function (item) {
  return $(item).closest('.js-item-element').data('item-id');
};

/**
 * Responsible for deleting a list item.
 * @param {string} id
 */
const deleteListItem = function (id) {
  // As with 'addItemToShoppingLIst', this
  // function also has the side effect of
  // mutating the global store value.
  //
  // First we find the index of the item with
  // the specified id using the native
  // Array.prototype.findIndex() method.
  const index = store.items.findIndex((item) => item.id === id);
  // Then we call `.splice` at the index of
  // the list item we want to remove, with
  // a removeCount of 1.
  store.items.splice(index, 1);
};

const handleDeleteItemClicked = function () {
  // Like in `handleItemCheckClicked`,
  // we use event delegation.
  $('.js-shopping-list').on('click', '.js-item-delete', (event) => {
    // Get the index of the item in store.items.
    const id = getItemIdFromElement(event.currentTarget);
    // Delete the item.
    deleteListItem(id);
    // Render the updated shopping list.
    render();
  });
};

/**
 * Toggles the store.hideCheckedItems property
 */
const toggleCheckedItemsFilter = function () {
  store.hideCheckedItems = !store.hideCheckedItems;
};

/**
 * Places an event listener on the checkbox
 * for hiding completed items.
 */
const handleToggleFilterClick = function () {
  $('.js-filter-checked').click(() => {
    toggleCheckedItemsFilter();
    render();
  });
};

/**
 * This function will be our callback when the
 * page loads. It is responsible for initially
 * rendering the shopping list, then calling
 * our individual functions that handle new
 * item submission and user clicks on the
 * "check" and "delete" buttons for individual
 * shopping list items.
 */
const handleShoppingList = function () {
  render();
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  handleToggleFilterClick();
  handleItemEdit();
  handleItemEditSubmit();
};

// when the page loads, call `handleShoppingList`
$(handleShoppingList);

// HANDLE EDIT ITEM NAME BUTTON

const handleItemEdit = function () {
  $('.js-shopping-list').on('click', '.shopping-item-edit', (event) => {
    // console.log('item edit click registered');

    const id = getItemIdFromElement(event.currentTarget);

    for (let item of store.items) {
      if (item.id === id) {
        item.editing = !item.editing;
      }
    }
    render();
  });
};

// HANDLE EDIT BUTTON CLICK

const handleItemEditSubmit = function () {
  $('.js-shopping-list').on('click', '.js-item-edit-submit', (event) => {
    // console.log('item edit SUBMIT click registered');

    let newName = $(event.currentTarget).siblings('input').val();

    const id = getItemIdFromElement(event.currentTarget);

    editStoreItem(id, newName);

    for (let item of store.items) {
      if (item.id === id) {
        item.editing = !item.editing;
      }
    }
    render();
  });
};

// EDIT STORE ITEM IN STORE

const editStoreItem = function (id, newName) {
  console.log('editing item');
  for (let item of store.items) {
    if (item.id === id) {
      console.log(`item name is currently ${item.name}`);
      item.name = newName;
      console.log(`item name is now ${item.name}`);
    }
  }
};
