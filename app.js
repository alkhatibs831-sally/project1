function loadExpenses() {
  try {
    return JSON.parse(localStorage.getItem('expenses')) || [];
  } catch {
    return [];
  }
}

function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

let expenses = loadExpenses();

const form = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');
const totalSpentEl = document.getElementById('totalSpent');
const expenseCountEl = document.getElementById('expenseCount');
const biggestExpenseEl = document.getElementById('biggestExpense');
const filterCategory = document.getElementById('filterCategory');
const sortAmount = document.getElementById('sortAmount');
function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  document.getElementById(fieldId + 'Error').textContent = message;
  field.classList.toggle('is-invalid-field', message !== '');
}

function validateForm() {
  let valid = true;

  const description = document.getElementById('description').value.trim();
  const letters = description.match(/\p{L}/gu) || [];
  if (letters.length < 3) {
    showError('description', 'Description must have at least 3 letters');
    valid = false;
  } else {
    showError('description', '');
  }

  const amount = Number(document.getElementById('amount').value);
  if (document.getElementById('amount').value === '' || isNaN(amount) || amount <= 0) {
    showError('amount', 'Amount must be a number above 0');
    valid = false;
  } else {
    showError('amount', '');
  }

  if (document.getElementById('category').value === '') {
    showError('category', 'Please choose a category');
    valid = false;
  } else {
    showError('category', '');
  }

  if (document.getElementById('date').value === '') {
    showError('date', 'Date is required');
    valid = false;
  } else {
    showError('date', '');
  }

  return valid;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getVisibleExpenses() {
  let list = [...expenses];

  if (filterCategory.value !== '') {
    list = list.filter(exp => exp.category === filterCategory.value);
  }

  if (sortAmount.value === 'high') {
    list.sort((a, b) => b.amount - a.amount);
  } else if (sortAmount.value === 'low') {
    list.sort((a, b) => a.amount - b.amount);
  }

  return list;
}

function renderTable() {
  const visible = getVisibleExpenses();

  if (visible.length === 0) {
    const message = expenses.length === 0
      ? 'No expenses yet'
      : 'No expenses in this category';
    expenseList.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted">${message}</td>
      </tr>`;
    return;
  }

  expenseList.innerHTML = visible.map(exp => `
    <tr>
      <td>${escapeHtml(exp.description)}</td>
      <td>${exp.category}</td>
      <td>${exp.date}</td>
      <td>$${exp.amount.toFixed(2)}</td>
      <td class="text-end">
        <button class="btn-delete" data-id="${exp.id}">Delete</button>
      </td>
    </tr>
  `).join('');
}

function updateCards() {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const biggest = expenses.length ? Math.max(...expenses.map(exp => exp.amount)) : 0;

  totalSpentEl.textContent = '$' + total.toFixed(2);
  expenseCountEl.textContent = expenses.length;
  biggestExpenseEl.textContent = '$' + biggest.toFixed(2);
}

function render() {
  renderTable();
  updateCards();
}

form.addEventListener('submit', function (e) {
  e.preventDefault();

  if (!validateForm()) return;

  const expense = {
    id: Date.now(),
    description: document.getElementById('description').value.trim(),
    amount: Number(document.getElementById('amount').value),
    category: document.getElementById('category').value,
    date: document.getElementById('date').value
  };

  expenses.push(expense);
  saveExpenses();
  form.reset();
  render();
});
expenseList.addEventListener('click', function (e) {
  const btn = e.target.closest('.btn-delete');
  if (!btn) return;

  if (confirm('Are you sure you want to delete this expense?')) {
    const id = Number(btn.dataset.id);
    expenses = expenses.filter(exp => exp.id !== id);
    saveExpenses();
    render();
  }
});

filterCategory.addEventListener('change', renderTable);
sortAmount.addEventListener('change', renderTable);
render();