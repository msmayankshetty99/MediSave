import React, { useState, useEffect } from 'react';
import './expenses.css';
import ReceiptScanner from './components/ReceiptScanner';

function Expenses() {
  const [expense, setExpense] = useState({
    name: '',
    amount: '',
    category: 'medication',
    date: new Date().toISOString().substr(0, 10),
    notes: ''
  });

  const [expensesList, setExpensesList] = useState(() => {
    // Load from localStorage if available
    const savedExpenses = localStorage.getItem('expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // Categories for medical expenses
  const categories = [
    { id: 'medication', name: 'Medication', icon: '💊', color: '#4F46E5' },
    { id: 'consultation', name: 'Doctor Visit', icon: '👨‍⚕️', color: '#10B981' },
    { id: 'test', name: 'Medical Tests', icon: '🔬', color: '#F59E0B' },
    { id: 'hospital', name: 'Hospital', icon: '🏥', color: '#EF4444' },
    { id: 'other', name: 'Other', icon: '📌', color: '#8B5CF6' }
  ];

  // Save to localStorage whenever expenses change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expensesList));
    
    // Calculate total
    const total = expensesList.reduce((sum, exp) => sum + exp.amount, 0);
    setTotalAmount(total);
  }, [expensesList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense(prevExpense => ({
      ...prevExpense,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!expense.name || !expense.amount || !expense.date) {
      alert("Please fill in all required fields");
      return;
    }

    if (editingExpense) {
      // Update existing expense
      setExpensesList(prevList => 
        prevList.map(exp => 
          exp.id === editingExpense.id 
            ? {
                ...exp,
                name: expense.name,
                amount: parseFloat(expense.amount),
                category: expense.category,
                date: expense.date,
                notes: expense.notes
              } 
            : exp
        )
      );
      setEditingExpense(null);
    } else {
      // Add new expense
      setExpensesList(prevList => [
        ...prevList,
        {
          id: Date.now(),
          name: expense.name,
          amount: parseFloat(expense.amount),
          category: expense.category,
          date: expense.date,
          notes: expense.notes
        }
      ]);
    }

    // Reset form
    setExpense({
      name: '',
      amount: '',
      category: 'medication',
      date: new Date().toISOString().substr(0, 10),
      notes: ''
    });
    
    // Close form
    setShowAddExpense(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpensesList(prevList => prevList.filter(expense => expense.id !== id));
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setExpense({
      name: expense.name,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      notes: expense.notes || ''
    });
    setShowAddExpense(true);
    setShowReceiptScanner(false);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleScanReceipt = () => {
    setShowReceiptScanner(true);
    setShowAddExpense(false);
    setEditingExpense(null);
  };

  const handleScanComplete = (scannedData) => {
    // Set the expense form with the scanned data
    setExpense({
      name: scannedData.name || '',
      amount: scannedData.amount ? scannedData.amount.toString() : '',
      category: scannedData.category || 'other',
      date: scannedData.date || new Date().toISOString().substr(0, 10),
      notes: scannedData.notes || ''
    });
    
    // Show the expense form with pre-filled data
    setShowAddExpense(true);
    setShowReceiptScanner(false);
  };

  // Filter and sort expenses
  const filteredAndSortedExpenses = expensesList
    .filter(expense => {
      // Category filter
      const categoryMatch = filter === 'all' || expense.category === filter;
      
      // Search term filter
      const searchMatch = !searchTerm || 
        expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return categoryMatch && searchMatch;
    })
    .sort((a, b) => {
      const { key, direction } = sortConfig;
      
      if (key === 'date') {
        return direction === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      
      if (key === 'amount') {
        return direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      
      if (key === 'name') {
        return direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      
      return 0;
    });

  // Get category details by id
  const getCategoryDetails = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category || { name: 'Unknown', icon: '❓' };
  };

  // Calculate statistics
  const categoryTotals = categories.map(category => {
    const total = expensesList
      .filter(exp => exp.category === category.id)
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    return {
      ...category,
      total
    };
  });

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="medical-expense-tracker">
      <div className="header">
        <div className="header-content">
          <div className="header-top">
            <h1>Medical Expense Tracker</h1>
          </div>
          <p>Track and manage your healthcare expenses</p>
        </div>
      </div>

      <div className="dashboard">
        <div className="summary-cards">
          <div className="summary-card total">
            <div className="card-content">
              <h3>Total Expenses</h3>
              <p className="amount">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="summary-card count">
            <div className="card-content">
              <h3>Total Records</h3>
              <p className="count-value">{expensesList.length}</p>
            </div>
          </div>
        </div>

        <div className="category-summary">
          <h3>Expenses by Category</h3>
          <div className="category-cards">
            {categoryTotals.map(category => (
              <div 
                key={category.id} 
                className={`category-card ${filter === category.id ? 'active' : ''}`}
                onClick={() => setFilter(category.id === filter ? 'all' : category.id)}
                style={{ 
                  backgroundColor: filter === category.id ? `${category.color}20` : 'var(--form-background)',
                  borderColor: filter === category.id ? category.color : 'var(--border-color)'
                }}
              >
                <div className="category-icon">{category.icon}</div>
                <div className="category-details">
                  <h4>{category.name}</h4>
                  <p style={{ color: category.color }}>${category.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="expenses-section">
          <div className="expenses-header">
            <h2>Expenses List</h2>
            <div className="expenses-actions">
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="action-buttons">
                <button
                  className="scan-receipt-button"
                  onClick={handleScanReceipt}
                >
                  Scan Receipt
                </button>
                <button
                  className="add-expense-button"
                  onClick={() => {
                    setShowAddExpense(!showAddExpense);
                    setShowReceiptScanner(false);
                    setEditingExpense(null);
                    setExpense({
                      name: '',
                      amount: '',
                      category: 'medication',
                      date: new Date().toISOString().substr(0, 10),
                      notes: ''
                    });
                  }}
                >
                  {showAddExpense ? 'Cancel' : 'Add Expense'}
                </button>
              </div>
            </div>
          </div>

          {showReceiptScanner && (
            <ReceiptScanner 
              onScanComplete={handleScanComplete} 
              onCancel={() => setShowReceiptScanner(false)} 
            />
          )}

          {showAddExpense && (
            <div className="expense-form-container">
              <h3>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
              <form onSubmit={handleSubmit} className="expense-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Description</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={expense.name}
                      onChange={handleChange}
                      placeholder="e.g., Prescription Medicine"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="amount">Amount ($)</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={expense.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={expense.category}
                      onChange={handleChange}
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={expense.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={expense.notes}
                    onChange={handleChange}
                    placeholder="Add any additional details here..."
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    {editingExpense ? 'Update Expense' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="expenses-table-container">
            {filteredAndSortedExpenses.length === 0 ? (
              <div className="no-expenses">
                {searchTerm || filter !== 'all' ? (
                  <p>No matching expenses found. Try adjusting your filters.</p>
                ) : (
                  <p>No expenses recorded yet. Add your first expense!</p>
                )}
              </div>
            ) : (
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('date')} className="sortable">
                      Date
                      {sortConfig.key === 'date' && (
                        <span className="sort-indicator">
                          {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </th>
                    <th onClick={() => handleSort('name')} className="sortable">
                      Description
                      {sortConfig.key === 'name' && (
                        <span className="sort-indicator">
                          {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </th>
                    <th>Category</th>
                    <th onClick={() => handleSort('amount')} className="sortable amount-column">
                      Amount
                      {sortConfig.key === 'amount' && (
                        <span className="sort-indicator">
                          {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </th>
                    <th className="actions-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedExpenses.map((exp) => {
                    const category = getCategoryDetails(exp.category);
                    return (
                      <tr key={exp.id}>
                        <td>{formatDate(exp.date)}</td>
                        <td>
                          <div className="expense-name-cell">
                            <span className="expense-name">{exp.name}</span>
                            {exp.notes && (
                              <span className="expense-notes" title={exp.notes}>
                                📝
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="category-badge" style={{ backgroundColor: `${category.color}20` }}>
                            <span className="category-icon">{category.icon}</span>
                            {category.name}
                          </span>
                        </td>
                        <td className="amount-column">${exp.amount.toFixed(2)}</td>
                        <td className="actions-column">
                          <div className="expense-actions">
                            <button 
                              className="edit-button" 
                              onClick={() => handleEdit(exp)}
                              aria-label="Edit expense"
                            >
                              ✏️
                            </button>
                            <button 
                              className="delete-button" 
                              onClick={() => handleDelete(exp.id)}
                              aria-label="Delete expense"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Expenses;
