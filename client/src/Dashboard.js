import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from './App';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './dashboard.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const axios = require('axios');

const API_KEY = 'f671082f5fdbe6488ce24f306baf37a3';  // Replace with your actual Nessie API key
const ACCOUNT_ID = '67c28e049683f20dd518c023';  // Replace with a valid account ID

async function getAccountBalance() {
  if (!API_KEY || !ACCOUNT_ID) {
    console.error('Missing API key or account ID. Please check your environment variables.');
    return null;
  }
  console.log("Weeeeeee");
  try {
    const response = await axios.get(`http://api.nessieisreal.com/accounts/${ACCOUNT_ID}`, {
      params: { key: API_KEY }
    });

    const account = response.data;
    console.log(`Account ID: ${account._id}`);
    console.log(`Balance: $${account.balance}`);
    console.log(account)

    return account.balance;
  } catch (error) {
    console.error('Error fetching account balance:', error.response?.data || error.message);
    return null;
  }
}
getAccountBalance();

function Dashboard() {
  const { theme } = useContext(ThemeContext);
  const [expensesList, setExpensesList] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filteredAmount, setFilteredAmount] = useState(0);
  const [accountBalance, setAccountBalance] = useState(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });

  // Categories for medical expenses
  const categories = [
    { id: 'medication', name: 'Medication', icon: '💊', color: '#4F46E5' },
    { id: 'consultation', name: 'Doctor Visit', icon: '👨‍⚕️', color: '#10B981' },
    { id: 'test', name: 'Medical Tests', icon: '🔬', color: '#F59E0B' },
    { id: 'hospital', name: 'Hospital', icon: '🏥', color: '#EF4444' },
    { id: 'other', name: 'Other', icon: '📌', color: '#8B5CF6' }
  ];

  // Load expenses from localStorage
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
    setExpensesList(expenses);
    
    // Calculate total
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    setTotalAmount(total);
  }, []);

  // Filter expenses based on selected category
  useEffect(() => {
    let filtered = [...expensesList];
    
    if (selectedCategory !== 'all') {
      filtered = expensesList.filter(expense => expense.category === selectedCategory);
    }
    
    setFilteredExpenses(filtered);
    
    // Calculate filtered total
    const filteredTotal = filtered.reduce((sum, exp) => sum + exp.amount, 0);
    setFilteredAmount(filteredTotal);
  }, [expensesList, selectedCategory]);

  // Prepare chart data
  useEffect(() => {
    if (expensesList.length === 0) return;

    // Calculate totals by category
    const categoryTotals = {};
    categories.forEach(cat => {
      categoryTotals[cat.id] = 0;
    });

    expensesList.forEach(expense => {
      if (categoryTotals[expense.category] !== undefined) {
        categoryTotals[expense.category] += expense.amount;
      } else {
        // Handle expenses with categories that no longer exist
        categoryTotals['other'] += expense.amount;
      }
    });

    // Filter out categories with zero expenses
    const filteredCategories = categories.filter(cat => categoryTotals[cat.id] > 0);

    // Prepare chart data
    const data = {
      labels: filteredCategories.map(cat => cat.name),
      datasets: [
        {
          data: filteredCategories.map(cat => categoryTotals[cat.id]),
          backgroundColor: filteredCategories.map(cat => cat.color),
          borderColor: filteredCategories.map(cat => cat.color),
          borderWidth: 1,
        },
      ],
    };

    setChartData(data);
  }, [expensesList]);

  useEffect(() => {
    async function fetchBalance() {
      const balance = await getAccountBalance();
      if (balance !== null) {
        setAccountBalance(balance);
      }
    }
    fetchBalance();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get category details by id
  const getCategoryDetails = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category || { name: 'Unknown', icon: '❓', color: '#94A3B8' };
  };

  // Handle category filter change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: theme === 'dark' ? '#E2E8F0' : '#1E293B',
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
        titleColor: theme === 'dark' ? '#F8FAFC' : '#1E293B',
        bodyColor: theme === 'dark' ? '#E2E8F0' : '#334155',
        borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const percentage = ((value / totalAmount) * 100).toFixed(1);
            return `$${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Overview of your medical expenses</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-summary">
          <div className="summary-card total">
            <div className="card-content">
              <h3>Total Expenses</h3>
              <p className="amount">${selectedCategory === 'all' ? totalAmount.toFixed(2) : filteredAmount.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="summary-card count">
            <div className="card-content">
              <h3>Total Records</h3>
              <p className="count-value">{filteredExpenses.length}</p>
            </div>
          </div>

          <div className="summary-card total">
            <div className="card-content">
              <h3>Money Saved</h3>
              <p className="amount">${accountBalance !== null ? `$${accountBalance.toFixed(2)}` : 'Loading...'}</p>
            </div>
          </div>
        </div>

        <div className="category-filter">
          <h3>Filter by Category</h3>
          <div className="filter-buttons">
            <button 
              className={`filter-button ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('all')}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                className={`filter-button ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
                style={{ 
                  backgroundColor: selectedCategory === category.id ? `${category.color}30` : 'transparent',
                  borderColor: category.color
                }}
              >
                <span className="category-icon">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-charts">
          <div className="chart-container">
            <h2>Expenses by Category</h2>
            <div className="pie-chart-container">
              {expensesList.length > 0 ? (
                <Pie data={chartData} options={chartOptions} />
              ) : (
                <div className="no-data">
                  <p>No expense data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="recent-expenses">
          <h2>Recent Expenses</h2>
          <div className="expenses-table-container">
            {filteredExpenses.length === 0 ? (
              <div className="no-expenses">
                <p>No expenses recorded yet.</p>
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
                  </tr>
                </thead>
                <tbody>
                  {sortedExpenses
                    .slice(0, 5)
                    .map((exp) => {
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

export default Dashboard; 