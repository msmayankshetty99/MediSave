import React, { useState } from 'react';

function Expenses() {
  const [expense, setExpense] = useState({
    name: '',
    amount: ''
  });

  const [expensesList, setExpensesList] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense(prevExpense => ({
      ...prevExpense,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!expense.name || !expense.amount) {
      alert("Please fill in both fields");
      return;
    }

    setExpensesList(prevList => [
      ...prevList,
      {
        id: Date.now(),
        name: expense.name,
        amount: parseFloat(expense.amount)
      }
    ]);

    setExpense({
      name: '',
      amount: ''
    });
  };

  return (
    <div>
      <h2>Expense Tracker</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Expense Name:
            <input
              type="text"
              name="name"
              value={expense.name}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Amount:
            <input
              type="number"
              name="amount"
              value={expense.amount}
              onChange={handleChange}
            />
          </label>
        </div>
        <button type="submit">Add Expense</button>
      </form>

      <h3>Expenses List</h3>
      <ul>
        {expensesList.map((expense) => (
          <li key={expense.id}>
            {expense.name}: ${expense.amount.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Expenses;
