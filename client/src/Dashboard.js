import React, { useState, useEffect, useContext, useRef } from 'react';
import { ThemeContext } from './App';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './dashboard.css';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);


// we should make these environment variables
const API_KEY = "f671082f5fdbe6488ce24f306baf37a3";
const ACCOUNT_ID = "67c28e049683f20dd518c023"; //we should update this eventually (make a user have to login)

var request = require('superagent');

function Dashboard() {
  const { theme } = useContext(ThemeContext);
  const [expensesList, setExpensesList] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filteredAmount, setFilteredAmount] = useState(0);
  const [initialBalance, setInitialBalance] = useState(null);
  const [healthBalance, setHealthBalance] = useState(null);
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

  // Fetch account balance
  const fetchAccountBalance = () => {
    request.get(`http://api.nessieisreal.com/customers/${ACCOUNT_ID}/accounts?key=${API_KEY}`)
      .end(function (err, res) {
        if (err) {
          console.error('Error fetching data:', err);
          return;
        }

        if (!res) {
          console.error('No response received');
          return;
        }

        if (res && res.status) {
          console.log('Response Status:', res.status);
        }

        if (res && res.body) {
          console.log('Response Body:', res.body);
          for (let x of res.body) {
            if (x['nickname'] === 'Health Savings') {
              console.log('Initial Health Savings balance:', x['balance']);
              setInitialBalance(x['balance']);
            }
          }
        } else {
          console.error('No body in response');
        }
      });
  };

  // Load expenses from localStorage and fetch account balance
  useEffect(() => {
    console.log("Fetching account balance");
    fetchAccountBalance();
    
    const savedExpenses = localStorage.getItem('expenses');
    const expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
    setExpensesList(expenses);
    
    // Calculate total with proper rounding to avoid floating point issues
    const total = expenses.reduce((sum, exp) => sum + Math.round(exp.amount * 100) / 100, 0);
    setTotalAmount(total);
  }, []); // Empty dependency array to run only once on mount

  // Update health balance whenever expenses or initial balance changes
  useEffect(() => {
    if (initialBalance !== null) {
      const newHealthBalance = initialBalance - totalAmount;
      setHealthBalance(newHealthBalance);

      const requestBody = {
        medium: "balance",  // Choose between 'balance' or 'rewards'
        transaction_date: "2025-03-01",
        status: "pending",
        amount: totalAmount,
        description: "Withdrawal for medical expenses"
      };

      const url = (`http://api.nessieisreal.com/customers/67c2920b9683f20dd518c02d/accounts?key=${API_KEY}`)

      axios.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('Success:', response.data);
      })
      .catch(error => {
        console.error('Error:', error.response ? error.response.data : error.message);
      });
      
      
      console.log(`Updated Health Balance: ${initialBalance} - ${totalAmount} = ${newHealthBalance}`);
    }
  }, [initialBalance, totalAmount]);

  // Filter expenses based on selected category
  useEffect(() => {
    let filtered = [...expensesList];
    
    if (selectedCategory !== 'all') {
      filtered = expensesList.filter(expense => expense.category === selectedCategory);
    }
    
    setFilteredExpenses(filtered);
    
    // Calculate filtered total with proper rounding
    const filteredTotal = filtered.reduce((sum, exp) => sum + Math.round(exp.amount * 100) / 100, 0);
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
        categoryTotals[expense.category] += Math.round(expense.amount * 100) / 100;
      } else {
        // Handle expenses with categories that no longer exist
        categoryTotals['other'] += Math.round(expense.amount * 100) / 100;
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
              <p className="amount">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
          
          {selectedCategory !== 'all' && (
            <div className="summary-card filtered">
              <div className="card-content">
                <h3>Filtered Expenses</h3>
                <p className="amount">${filteredAmount.toFixed(2)}</p>
              </div>
            </div>
          )}
          
          <div className="summary-card count">
            <div className="card-content">
              <h3>Total Records</h3>
              <p className="count-value">{filteredExpenses.length}</p>
            </div>
          </div>

          <div className="summary-card total">
            <div className="card-content">
              <h3>Health Balance</h3>
              <p className="amount">{healthBalance !== null ? `$${healthBalance.toFixed(2)}` : 'Loading...'}</p>
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